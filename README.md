# Qredit Spin & Win

Four prize wheel segments: One Free Month, Chocolate, Try Again, Surprise Gift.

## Setup
1. Upload `index.html`, `style.css`, `script.js`, and `config.js` to GitHub Pages root. Keep the existing working `config.js` endpoint.
2. In **Google Apps Script**, replace `Code.gs` with the updated `google-apps-script.gs` code. This file is NOT executed by GitHub Pages. Verify `SPREADSHEET_ID` and `SHEET_NAME`.
3. Save, then **Deploy > Manage deployments > Edit > New version > Deploy**. Keep Execute as Me and access Anyone.
4. Test with a NEW email address. The `Leads` sheet `Prize` column will record the selected prize.
5. Note: the wheel selection is client-side and can be manipulated by technically skilled users. For prizes with monetary value or limited stock, use a server-side draw and enforce one claim per person.
6. A `no-cors` submission cannot confirm a saved row; check Apps Script executions and the sheet.

`Try Again` allows a repeat spin and does not submit a lead. The other three results open the existing lead form.
