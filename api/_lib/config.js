const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const optional = (name, fallback = '') => process.env[name] || fallback;

const bookingConfig = () => ({
  timezone: optional('BOOKING_TIMEZONE', 'Asia/Baghdad'),
  calendarId: required('GOOGLE_CALENDAR_ID'),
  slots: optional('BOOKING_SLOT_TIMES', '10:00,13:00,16:00,19:00')
    .split(',')
    .map((slot) => slot.trim())
    .filter((slot) => /^\d{2}:\d{2}$/.test(slot)),
  internalEmail: required('BOOKING_INTERNAL_EMAIL'),
  internalWhatsApp: optional('WHATSAPP_INTERNAL_RECIPIENT'),
  driveFolderId: optional('GOOGLE_DRIVE_BOOKINGS_FOLDER_ID'),
  consultationMinutes: [45, 60, 90, 120]
});

module.exports = { required, optional, bookingConfig };
