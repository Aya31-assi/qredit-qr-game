/** Google Apps Script: attach to a Google Sheet (Extensions > Apps Script).
 * Deploy > New deployment > Web app > Execute as Me; access Anyone.
 * Keep the sheet private. Public endpoints can receive spam: review quotas and logs.
 */
const SHEET_NAME = 'Leads';
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = e.parameter || {};
    const name = String(p.fullName || '').trim();
    const phone = String(p.phone || '').trim();
    const email = String(p.email || '').trim();
    const description = String(p.businessDescription || '').trim();
    if (p.website || p.consent !== 'on' || !name || !phone || !description ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        name.length > 120 || phone.length > 30 || email.length > 180 || description.length > 1000) {
      return reply('invalid');
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp','Full Name','Phone','Email','Business Description','Prize','Campaign','Consent','Status']);
    // Guard against spreadsheet formula injection.
    const safe = s => /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
    const emailKey = email.toLowerCase();
    const existing = sheet.getLastRow() > 1 ? sheet.getRange(2,4,sheet.getLastRow()-1,1).getValues().flat() : [];
    if (existing.some(v => String(v).toLowerCase() === emailKey)) return reply('already_registered');
    sheet.appendRow([new Date(),safe(name),safe(phone),safe(email),safe(description),'1 Month Subscription Fee Waived',safe(String(p.campaign||'Exhibition QR')),'Yes','New']);
    return reply('received');
  } catch (error) {
    console.error(error);
    return reply('error');
  } finally { try { lock.releaseLock(); } catch (_) {} }
}
function reply(status) {return ContentService.createTextOutput(JSON.stringify({status})).setMimeType(ContentService.MimeType.JSON);}
