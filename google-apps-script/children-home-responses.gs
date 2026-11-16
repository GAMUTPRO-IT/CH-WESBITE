/* ════════════════════════════════════════════════════════════════════════════
   Children Home admin page: read-only link to THIS spreadsheet
   (the one that collects your Google Form responses, one tab per form)

   How to use (full steps in ADMIN-GUIDE.md):
     1. In the spreadsheet: Extensions → Apps Script. Delete what's there and paste this file.
        Easiest: copy it from admin.html → Form responses, where your secret is already filled in.
     2. Save, then Deploy → New deployment → Select type: Web app
          Execute as: Me      Who has access: Anyone
        Deploy, allow the permissions Google asks for, and copy the Web app URL.
     3. Paste the Web app URL into admin.html → Form responses → Connect.

   What it does: it only READS this spreadsheet, and only answers requests that carry
   the secret below. It can't change or delete anything, and it can't see other files.
   ════════════════════════════════════════════════════════════════════════════ */

const SECRET = 'PASTE-YOUR-SECRET-HERE';   // the secret from admin.html → Form responses
const MAX_ROWS = 2000;                     // newest responses sent per tab
const VERSION = 2;                         // the admin page checks this to know which features the script has

function doPost(e) {
  let req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return reply({ ok: false, error: 'Bad request.' }); }

  if (!SECRET || SECRET.indexOf('PASTE') === 0 || SECRET.length < 24) {
    return reply({ ok: false, error: 'The script has no secret yet. Paste the code from the admin page (it has your secret in it) and deploy again.' });
  }
  if (!sameText(String(req.key || ''), SECRET)) return reply({ ok: false, error: 'Wrong secret key. Paste the latest code from the admin page and deploy a new version.' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = ss.getSheets().filter(function (sh) { return !sh.isSheetHidden(); });

  if (req.action === 'list') {
    return reply({
      ok: true, version: VERSION, title: ss.getName(), url: ss.getUrl(),
      tabs: tabs.map(function (sh) { return { name: sh.getName(), count: Math.max(0, sh.getLastRow() - 1) }; })
    });
  }

  if (req.action === 'rows') {
    const sh = tabs.filter(function (s) { return s.getName() === req.tab; })[0];
    if (!sh) return reply({ ok: false, error: 'There is no tab called "' + req.tab + '". Click Refresh.' });
    const lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
    const link = ss.getUrl() + '#gid=' + sh.getSheetId();
    if (lastRow < 1 || lastCol < 1) return reply({ ok: true, tab: sh.getName(), header: [], rows: [], total: 0, url: link });
    const header = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const total = Math.max(0, lastRow - 1), take = Math.min(total, MAX_ROWS);
    const range = take ? sh.getRange(lastRow - take + 1, 1, take, lastCol) : null;
    const rows = range ? range.getDisplayValues().reverse() : [];                               // newest first
    const stamps = range ? range.getValues().map(function (r) { return isoDate(r[0]); }).reverse() : [];   // the Timestamp column as a real date
    return reply({ ok: true, version: VERSION, tab: sh.getName(), header: header, rows: rows, stamps: stamps, total: total, url: link });
  }

  // for the admin dashboard: how many responses each form has, and when they came in (no personal details)
  if (req.action === 'overview') {
    return reply({
      ok: true, version: VERSION, title: ss.getName(), url: ss.getUrl(),
      tabs: tabs.map(function (sh) {
        const total = Math.max(0, sh.getLastRow() - 1), take = Math.min(total, MAX_ROWS);
        const stamps = take ? sh.getRange(sh.getLastRow() - take + 1, 1, take, 1).getValues().map(function (r) { return isoDate(r[0]); }).reverse() : [];
        return { name: sh.getName(), count: total, stamps: stamps };
      })
    });
  }

  return reply({ ok: false, error: 'Unknown request.' });
}

// Opening the Web app URL in a browser just shows that the link is running (no data).
function doGet() {
  return reply({ ok: true, message: 'The Children Home responses link is running. Use it from admin.html.' });
}

function isoDate(v) {
  return (v instanceof Date && !isNaN(v)) ? v.toISOString() : '';
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// compares the secret without giving away how much of it matched
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}