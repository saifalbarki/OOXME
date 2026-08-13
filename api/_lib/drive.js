const { googleAccessToken } = require('./google');
const { optional } = require('./config');

async function storeBookingRecord(booking) {
  const folderId = optional('GOOGLE_DRIVE_BOOKINGS_FOLDER_ID');
  if (!folderId) return { skipped: true, reason: 'no_drive_folder' };
  const token = await googleAccessToken();
  const boundary = `ooxme-${Date.now()}`;
  const metadata = { name: `${booking.id}.json`, mimeType: 'application/json', parents: [folderId], appProperties: { ooxmeBookingId: booking.id } };
  const body = [`--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', JSON.stringify(metadata), `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', JSON.stringify(booking, null, 2), `--${boundary}--`, ''].join('\r\n');
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Drive storage failed: ${result.error?.message || response.status}`);
  return result;
}
module.exports = { storeBookingRecord };
