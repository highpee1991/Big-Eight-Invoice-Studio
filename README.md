# Big Eight Integrated — Invoice Studio

A shared, team-usable invoice generator: business details and the invoice
counter live in Firestore so everyone sees the same data, invoice numbers are
reserved atomically (no duplicate numbers even if two people generate at the
same moment), and every invoice can be re-downloaded as PDF or Excel at any
time from the History tab.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name (e.g. `big8-invoice-studio`).
2. In the project, go to **Build → Firestore Database → Create database**. Start in production mode, pick a region close to your team.
3. Go to **Build → Authentication → Get started**. Enable the **Email/Password** sign-in method.
4. Go to **Project settings** (gear icon) → **Your apps** → click the `</>` (web) icon → register an app (any nickname). Copy the `firebaseConfig` object it shows you.

## 2. Add your config

Open `src/firebase.js` and paste your real values in place of the `YOUR_...` placeholders. These values are safe to have in client-side code — access is controlled by the sign-in requirement and the security rules in `firestore.rules`, not by hiding this config.

## 3. Create accounts for your team

This app has **no public sign-up** on purpose, so random people can't create invoices. Add each colleague from Firebase Console → **Authentication → Users → Add user** (email + a temporary password they should change, or use "Send password reset" after creating the account).

## 4. Install and run locally

```bash
npm install
npm run dev
```

Open the local URL it prints. Sign in with one of the accounts you created in step 3.

## 5. Deploy

```bash
npm install -g firebase-tools   # one-time, if you don't have it
firebase login
```

Edit `.firebaserc` and replace `YOUR_PROJECT_ID` with your actual Firebase project ID (visible in Project settings), then:

```bash
firebase deploy --only firestore:rules   # publishes the security rules
npm run deploy                            # builds the app and deploys hosting
```

Firebase will print a live URL (`https://YOUR_PROJECT_ID.web.app`) — that's what you share with colleagues.

## How the data is organized (Firestore)

- `meta/business` — one shared document with your company details (name, address, bank info, etc.)
- `meta/counter` — one document holding `{ next: <number> }`, the next invoice number to hand out
- `invoices/{INV000200}` — one document per invoice, keyed by its own invoice number, holding the full record (client, line items, totals, who created it, when)

Invoice numbers start at `INV000200` and count up. If you ever need to correct
the counter, there's an override field in Business Details — it directly sets
`meta/counter`, no code changes needed.

## Notes on security rules

`firestore.rules` currently allows any signed-in user to read/write the shared
business profile and to create (but never edit or delete) invoices. That fits
a small trusted team where anyone can generate an invoice. If you want to
later restrict *editing business details* to specific people (e.g. only
admins), that's a rule change plus a custom claim or an `admins` collection —
happy to add that if it becomes useful.

## Project structure

```
src/
  firebase.js       Firebase project config + initialized db/auth
  data.js           All Firestore reads/writes (profile, counter, invoices)
  constants.js       Default business profile & invoice notes text
  utils.js           Formatting helpers
  pdf.js             PDF generation (jsPDF)
  excel.js           Excel generation (SheetJS)
  Login.jsx          Email/password sign-in screen
  App.jsx            Auth gate + navigation + orchestration
  components/
    NewInvoice.jsx    New invoice form + generate action
    History.jsx       Past invoices, re-download PDF/Excel
    Settings.jsx      Business details form
    InvoicePreview.jsx  The on-screen styled invoice sheet
    Field.jsx          Small shared form field wrapper
public/
  logo.png           Company logo, embedded in the PDF and on-screen preview
```
