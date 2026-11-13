/* ==========================================================================
   WebLuxe inbox: booking requests and messages from the website, kept in a
   Google Sheet that you own. Free; no server needed.

   Set up once (about 5 minutes):
   1. Create a new Google Sheet (sheets.new). Name it e.g. "Website inbox".
   2. Extensions -> Apps Script. Delete what is there and paste this whole file.
   3. Change SECRET below to a long random word only you know. Optionally put
      your email in NOTIFY to get an email for every new request.
   4. Deploy -> New deployment -> type "Web app".
      Execute as: Me.  Who has access: Anyone.  Deploy, allow access.
   5. Copy the web app URL (ends in /exec).
   6. In the website admin, Inbox: paste the URL as "Inbox address" and
      Publish; type the SECRET as "Inbox key" (it stays on your device).
   Anyone can ADD a request (that is what the website does); only someone
   with the SECRET can READ or change them.
   ========================================================================== */
const SECRET = 'change-this-to-a-long-secret';
const NOTIFY = '';   // e.g. 'you@example.com' to get an email for each new request
const COLS = ['id', 'received', 'status', 'type', 'name', 'email', 'phone', 'item', 'in', 'out', 'guests', 'total', 'currency', 'extras', 'message', 'via', 'site', 'lang', 'data'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Inbox') || ss.insertSheet('Inbox');
  if (sh.getLastRow() === 0) { sh.appendRow(COLS); sh.setFrozenRows(1); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* the website sends each request here */
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (d._gotcha) return json_({ ok: true });   // spam trap
    const id = Utilities.getUuid().slice(0, 8);
    const row = { id, received: new Date().toISOString(), status: 'new', data: JSON.stringify(d) };
    COLS.forEach((c) => { if (!(c in row)) row[c] = d[c] == null ? '' : String(d[c]).slice(0, 2000); });
    sheet_().appendRow(COLS.map((c) => row[c]));
    if (NOTIFY) MailApp.sendEmail(NOTIFY, `New ${d.type || 'request'} from ${d.name || 'the website'}`, Object.keys(d).map((k) => `${k}: ${d[k]}`).join('\n'));
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}

/* the admin panel reads and updates requests here (needs the SECRET) */
function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== SECRET) return json_({ error: 'key' });
  const sh = sheet_(), values = sh.getDataRange().getValues(), head = values.shift() || COLS;
  const col = (name) => head.indexOf(name);
  if (p.action === 'status' && p.id) {
    const r = values.findIndex((v) => String(v[col('id')]) === String(p.id));
    if (r < 0) return json_({ error: 'not found' });
    sh.getRange(r + 2, col('status') + 1).setValue(String(p.status || 'new'));
    return json_({ ok: true });
  }
  const rows = values.slice(-300).map((v) => {
    let data = {}; try { data = JSON.parse(v[col('data')] || '{}'); } catch (err) { /* keep empty */ }
    return { id: String(v[col('id')]), at: String(v[col('received')]), status: String(v[col('status')] || 'new'), data };
  });
  return json_({ ok: true, rows });
}
