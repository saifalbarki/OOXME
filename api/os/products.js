const crypto = require('crypto');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { query } = require('../_lib/db');
const { decimal, integer, nullableText, text, bool } = require('../_lib/os-helpers');
const { requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { recordAudit, setRequestId } = require('../_lib/os-audit');
const { begin: beginIdempotency, complete: completeIdempotency } = require('../_lib/os-idempotency');

const IMAGE_DATA_MAX_LENGTH = 2_000_000;
const IMAGE_DATA_PATTERN = /^data:image\/(?:png|jpe?g|webp|avif);base64,[a-z0-9+/=]+$/i;

const serialize = (row) => ({
  id: row.id, slug: row.slug, status: row.status, isFeatured: row.is_featured,
  displayOrder: row.display_order, version: row.version,
  name: { en: row.name_en, ar: row.name_ar }, category: { en: row.category_en, ar: row.category_ar },
  description: { en: row.description_en, ar: row.description_ar },
  price: { amount: row.price_amount == null ? null : Number(row.price_amount), currency: String(row.price_currency || 'USD').trim(), label: { en: row.price_label_en || '', ar: row.price_label_ar || '' }, afterDiscount: row.price_after_discount_amount == null ? null : { amount: Number(row.price_after_discount_amount), label: { en: row.price_after_discount_label_en || '', ar: row.price_after_discount_label_ar || '' } } },
  imageData: row.image_data || ''
});

const fields = (body) => {
  const value = {
    slug: text(body.slug).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''),
    nameEn: text(body.nameEn), nameAr: text(body.nameAr), categoryEn: text(body.categoryEn), categoryAr: text(body.categoryAr),
    descriptionEn: text(body.descriptionEn), descriptionAr: text(body.descriptionAr),
    priceAmount: decimal(body.priceAmount), priceCurrency: (text(body.priceCurrency, 'USD') || 'USD').toUpperCase().slice(0, 3),
    priceLabelEn: nullableText(body.priceLabelEn), priceLabelAr: nullableText(body.priceLabelAr), priceAfterDiscountAmount: decimal(body.priceAfterDiscountAmount), priceAfterDiscountLabelEn: nullableText(body.priceAfterDiscountLabelEn), priceAfterDiscountLabelAr: nullableText(body.priceAfterDiscountLabelAr),
    isFeatured: bool(body.isFeatured), displayOrder: integer(body.displayOrder, 0), status: ['active', 'inactive', 'archived'].includes(body.status) ? body.status : 'active',
    imageData: text(body.imageData)
  };
  for (const [key, label] of [['slug', 'slug'], ['nameEn', 'name_en'], ['nameAr', 'name_ar'], ['categoryEn', 'category_en'], ['categoryAr', 'category_ar'], ['descriptionEn', 'description_en'], ['descriptionAr', 'description_ar']]) if (!value[key]) throw Object.assign(new Error(`${label}_required`), { status: 400 });
  if (value.priceAmount != null && value.priceAmount < 0) throw Object.assign(new Error('price_invalid'), { status: 400 });
  if (value.priceAfterDiscountAmount != null && value.priceAfterDiscountAmount < 0) throw Object.assign(new Error('price_after_discount_invalid'), { status: 400 });
  if (value.imageData && (value.imageData.length > IMAGE_DATA_MAX_LENGTH || !IMAGE_DATA_PATTERN.test(value.imageData))) throw Object.assign(new Error('image_invalid'), { status: 400 });
  return value;
};

const readAll = async () => query(`SELECT id,slug,status,is_featured,display_order,name_en,name_ar,category_en,category_ar,description_en,description_ar,price_amount,price_currency,price_label_en,price_label_ar,price_after_discount_amount,price_after_discount_label_en,price_after_discount_label_ar,image_data,version
  FROM os_products WHERE status <> 'archived' ORDER BY is_featured DESC, display_order ASC, created_at ASC`);

module.exports = async (request, response) => {
  setRequestId(request, response); response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(response, ['GET', 'POST']);
  try {
    const session = await requireAdmin(request);
    if (request.method === 'GET') { const result = await readAll(); return json(response, 200, { success: true, data: { products: result.rows.map(serialize) } }); }
    requireCsrf(request, session);
    const body = await readJson(request); const action = text(body.action);
    if (action === 'archive' || action === 'delete') {
      const id = text(body.id); const version = integer(body.version); if (!id) throw Object.assign(new Error('id_required'), { status: 400 });
      const result = await query(`UPDATE os_products SET status = 'archived', updated_at = now(), version = version + 1 WHERE id = $1 AND status <> 'archived' AND ($2::int IS NULL OR version = $2) RETURNING *`, [id, version]);
      if (!result.rowCount) throw Object.assign(new Error(version == null ? 'product_not_found' : 'product_conflict'), { status: version == null ? 404 : 409 });
      await recordAudit({ request, action: 'archive', resourceType: 'product', resourceId: id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
      return json(response, 200, { success: true, data: { product: serialize(result.rows[0]) } });
    }
    const value = fields(body);
    if (action === 'create') {
      const idempotency = await beginIdempotency(request, 'product:create', body);
      if (idempotency?.replay) return json(response, idempotency.status, idempotency.body);
      const result = await query(`INSERT INTO os_products (id,slug,status,is_featured,display_order,name_en,name_ar,category_en,category_ar,description_en,description_ar,price_amount,price_currency,price_label_en,price_label_ar,price_after_discount_amount,price_after_discount_label_en,price_after_discount_label_ar,image_data)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`, [crypto.randomUUID(), value.slug, value.status, value.isFeatured, value.displayOrder, value.nameEn, value.nameAr, value.categoryEn, value.categoryAr, value.descriptionEn, value.descriptionAr, value.priceAmount, value.priceCurrency, value.priceLabelEn, value.priceLabelAr, value.priceAfterDiscountAmount, value.priceAfterDiscountLabelEn, value.priceAfterDiscountLabelAr, value.imageData || null]);
      const bodyResult = { success: true, data: { product: serialize(result.rows[0]) } };
      await completeIdempotency(idempotency, { status: 201, body: bodyResult, resourceType: 'product', resourceId: result.rows[0].id });
      await recordAudit({ request, action: 'create', resourceType: 'product', resourceId: result.rows[0].id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
      return json(response, 201, bodyResult);
    }
    if (action === 'update') {
      const id = text(body.id); const version = integer(body.version);
      if (!id || version == null) throw Object.assign(new Error('id_and_version_required'), { status: 400 });
      const result = await query(`UPDATE os_products SET slug=$2,status=$3,is_featured=$4,display_order=$5,name_en=$6,name_ar=$7,category_en=$8,category_ar=$9,description_en=$10,description_ar=$11,price_amount=$12,price_currency=$13,price_label_en=$14,price_label_ar=$15,price_after_discount_amount=$16,price_after_discount_label_en=$17,price_after_discount_label_ar=$18,image_data=$19,updated_at=now(),version=version+1
        WHERE id=$1 AND version=$20 AND status <> 'archived' RETURNING *`, [id, value.slug, value.status, value.isFeatured, value.displayOrder, value.nameEn, value.nameAr, value.categoryEn, value.categoryAr, value.descriptionEn, value.descriptionAr, value.priceAmount, value.priceCurrency, value.priceLabelEn, value.priceLabelAr, value.priceAfterDiscountAmount, value.priceAfterDiscountLabelEn, value.priceAfterDiscountLabelAr, value.imageData || null, version]);
      if (!result.rowCount) throw Object.assign(new Error('product_conflict_or_not_found'), { status: 409 });
      await recordAudit({ request, action: 'update', resourceType: 'product', resourceId: id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
      return json(response, 200, { success: true, data: { product: serialize(result.rows[0]) } });
    }
    throw Object.assign(new Error('product_action_invalid'), { status: 400 });
  } catch (error) {
    const status = Number(error.status) || 503; if (status >= 500) console.error('OS products request failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'products_unavailable' : error.message });
  }
};
