# Qredit Exhibition QR Game

A free static mobile web game: QR scan → animation → fixed gift → lead form → Google Sheets.

## 1. Create the Google Sheet
1. Sign in with the **company-controlled Google account** (not a personal account).
2. Create a Google Sheet named `Qredit Exhibition Leads`.
3. Select **Extensions > Apps Script**, replace the starter code with `google-apps-script.gs`, and save.
4. Select **Deploy > New deployment > Web app**. Choose **Execute as: Me** and **Who has access: Anyone**. Authorize the permissions, then copy the URL ending in `/exec`.
5. Paste that URL into `config.js` as `formEndpoint`. The web app will have public submission access, but the Sheet should NOT be shared publicly.
6. Add your approved offer terms and privacy notice links to `config.js`.

## 2. Publish on GitHub Pages
1. Create a public repository, for example `qredit-qr-game`.
2. Upload `index.html`, `style.css`, `script.js`, and `config.js` to the repository root. Do **not** upload `google-apps-script.gs` with any private business data (the sample has none).
3. Open **Settings > Pages > Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. Open `https://YOUR-USERNAME.github.io/qredit-qr-game/` from a phone.
5. Generate a QR code pointing to that exact URL and test it before printing.

## 3. Important limitations
- GitHub Pages is free for public repositories, but files and frontend code are publicly visible. Never place credentials or secrets in frontend files.
- This starter uses `fetch` with `mode: no-cors` for Google Apps Script. It **cannot read the server response**, so a successful browser request is **not proof** the row was saved. Test real submissions and confirm them in the Sheet. For verified confirmations, duplicates and reliable retries, use a small proper backend/proxy or another form service with a CORS-enabled API.
- The Apps Script sample rejects duplicate **email** addresses, but cannot prevent all repeated entries or malicious spam. Public endpoints may be abused; add rate limiting/CAPTCHA through a suitable backend before high-traffic use.
- The free-month reward is an offer, not automatically activated by this site. Qredit staff must validate eligibility and activate it through approved business processes.
- Do not imply all fees are waived: this offer waives one month of subscription fees only, subject to your approved terms.
- Get approval for data collection wording and privacy terms. Restrict Google Sheet access to authorized Qredit staff.

## 4. Customize the design
- Change colors, fonts, layouts and animations in `style.css`.
- Change labels and wording in `index.html`.
- Change the fixed prize and endpoint in `config.js`.
- Replace the bouncing gift with your own mascot animation in the `#reveal` section.

## 5. Local testing
Open `index.html` in a browser for a visual preview. For more realistic testing, run a local HTTP server, e.g. `python -m http.server 8000`, then open `http://localhost:8000`. A real Google Apps Script deployment is required for saving data.
