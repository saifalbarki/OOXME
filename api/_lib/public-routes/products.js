const { json, methodNotAllowed } = require('../http');
const { query } = require('../db');

const serialize = (row) => ({
  slug: row.slug,
  isFeatured: row.is_featured,
  displayOrder: row.display_order,
  name: { en: row.name_en, ar: row.name_ar },
  category: { en: row.category_en, ar: row.category_ar },
  description: { en: row.description_en, ar: row.description_ar },
  price: {
    amount: row.price_amount === null ? null : Number(row.price_amount),
    currency: String(row.price_currency || 'USD').trim(),
    label: { en: row.price_label_en || '', ar: row.price_label_ar || '' },
    afterDiscount: row.price_after_discount_amount === null ? null : { amount: Number(row.price_after_discount_amount), label: { en: row.price_after_discount_label_en || '', ar: row.price_after_discount_label_ar || '' } }
  },
  imageData: row.image_data || ''
});

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
  try {
    const result = await query(`SELECT slug, is_featured, display_order, name_en, name_ar,
                                      category_en, category_ar, description_en, description_ar,
                                      price_amount, price_currency, price_label_en, price_label_ar,
                                      price_after_discount_amount, price_after_discount_label_en, price_after_discount_label_ar, image_data
                                 FROM os_products
                                WHERE status = 'active'
                                ORDER BY is_featured DESC, display_order ASC, created_at ASC`);
    return json(response, 200, { success: true, data: { products: result.rows.map(serialize) } });
  } catch (error) {
    console.error('Public products read failed', error.message);
    return json(response, 503, { success: false, error: 'products_unavailable' });
  }
};
