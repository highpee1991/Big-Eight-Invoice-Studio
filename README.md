# Big Eight Integrated — Invoice Studio

A shared, team-usable invoice generator built for Big Eight Integrated, LLC.
Business details and the invoice counter live in Firestore so everyone on
the team sees the same data, invoice numbers are reserved atomically (no
duplicate numbers even if two people generate at the same moment), and every
invoice can be re-downloaded as PDF or Excel at any time from the History
tab.

## What it does

- Team members sign in with an email/password account (no public sign-up —
  accounts are created by an admin in the Firebase console)
- Fill in client details and line items to generate an invoice, with
  auto-calculated subtotal, tax, and shipping/handling
- Invoice numbers auto-increment and are reserved atomically, so two people
  generating at once never collide
- Every invoice is saved to Firestore and downloadable as a PDF (jsPDF) or
  Excel file (ExcelJS), styled to match the company's branding
- A History tab lists past invoices for re-download at any time
- A Settings tab holds shared business details (address, bank info, invoice
  numbering) that all team members pull from automatically

## Stack

- **React** (Vite) — UI and app logic
- **Firebase Authentication** — email/password sign-in, no public sign-up
- **Firestore** — shared business profile, invoice counter, and invoice
  records
- **jsPDF** — PDF invoice generation
- **ExcelJS** — Excel invoice generation
- **Tailwind CSS** — styling
- **Firebase Hosting** — deployment

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → give it a name (e.g. `big8-invoice-studio`).
2. In the project, go to **Build → Firestore Database → Create database**. Start in production mode, pick a region close to your team.
3. Go to **Build → Authentication → Get started**. Enable the **Email/Password** sign-in method.
4. Go to **Project settings** (gear icon) → **Your apps** → click the `</>` (web) icon → register an app (any nickname). Copy the `firebaseConfig` object it shows you.

## 2. Add your