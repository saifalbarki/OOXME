const assert = require('assert/strict');
const {
  yCloudBookingParameters,
  bookingTemplateContract,
  yCloudTemplateLanguage,
  legacyBookingTemplateContract,
  approvedSixVariableBookingTemplateContract,
  bookingConfirmationTemplate
} = require('../api/_lib/whatsapp');

const booking = {
  name: 'Safe Test Customer',
  topic: 'Safe Test Topic',
  reference: 'OOX-SAFE-TEST',
  date: '2030-01-07',
  time: '13:00',
  duration: 45
};

const originalContract = process.env.YCLOUD_WHATSAPP_BOOKING_TEMPLATE_CONTRACT;
const originalArabicLanguage = process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE_AR;
const originalEnglishLanguage = process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE;

try {
  delete process.env.YCLOUD_WHATSAPP_BOOKING_TEMPLATE_CONTRACT;
  assert.equal(bookingConfirmationTemplate, 'ooxme_booking_confirmation');
  assert.equal(bookingTemplateContract(), approvedSixVariableBookingTemplateContract);
  assert.deepEqual(yCloudBookingParameters(booking), [
    'Safe Test Customer',
    'Safe Test Topic',
    'OOX-SAFE-TEST',
    '2030-01-07',
    '13:00',
    '45'
  ]);

  const futureExpected = ['Safe Test Customer', 'Safe Test Topic', 'OOX-SAFE-TEST', '2030-01-07', '13:00', '45'];
  assert.deepEqual(yCloudBookingParameters(booking, approvedSixVariableBookingTemplateContract), futureExpected);
  assert.deepEqual(yCloudBookingParameters({ ...booking, language: 'ar' }, approvedSixVariableBookingTemplateContract), futureExpected);

  process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE = 'en_US';
  process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE_AR = 'ar';
  assert.equal(yCloudTemplateLanguage('en', approvedSixVariableBookingTemplateContract), 'en_US');
  assert.equal(yCloudTemplateLanguage('ar', approvedSixVariableBookingTemplateContract), 'ar');
  assert.equal(yCloudTemplateLanguage('ar', approvedSixVariableBookingTemplateContract), 'ar');

  process.env.YCLOUD_WHATSAPP_BOOKING_TEMPLATE_CONTRACT = approvedSixVariableBookingTemplateContract;
  assert.equal(bookingTemplateContract(), approvedSixVariableBookingTemplateContract);
  console.log('WhatsApp legacy and future six-variable template contracts passed.');
} finally {
  if (originalContract === undefined) delete process.env.YCLOUD_WHATSAPP_BOOKING_TEMPLATE_CONTRACT;
  else process.env.YCLOUD_WHATSAPP_BOOKING_TEMPLATE_CONTRACT = originalContract;
  if (originalArabicLanguage === undefined) delete process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE_AR;
  else process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE_AR = originalArabicLanguage;
  if (originalEnglishLanguage === undefined) delete process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE;
  else process.env.YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE = originalEnglishLanguage;
}
