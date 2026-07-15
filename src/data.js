import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase.js";

export const NUMBER_PREFIX = "INV";
export const NUMBER_DIGITS = 6;
export const START_NUMBER = 200;

export function formatNumber(n) {
  return NUMBER_PREFIX + String(n).padStart(NUMBER_DIGITS, "0");
}

const businessRef = doc(db, "meta", "business");
const counterRef = doc(db, "meta", "counter");

// ---------- Business profile (shared by the whole team) ----------
export async function getBusinessProfile() {
  const snap = await getDoc(businessRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveBusinessProfile(profile) {
  await setDoc(businessRef, profile, { merge: true });
}

// ---------- Invoice counter ----------
// Reads the current counter for display only (does not reserve a number).
export async function getNextNumberPreview() {
  const snap = await getDoc(counterRef);
  return snap.exists() ? snap.data().next : START_NUMBER;
}

// Atomically reserves the next invoice number. Safe for concurrent use by
// multiple people at once — Firestore transactions guarantee no two callers
// can ever walk away with the same number.
export async function reserveNextNumber() {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().next : START_NUMBER;
    tx.set(counterRef, { next: current + 1 }, { merge: true });
    return current;
  });
}

// Manual override, e.g. to correct the counter. Not used in the normal flow.
export async function setNextNumber(n) {
  await setDoc(counterRef, { next: n }, { merge: true });
}

// ---------- Invoice records ----------
export async function saveInvoiceRecord(record, userEmail) {
  const ref = doc(db, "invoices", record.number);
  await setDoc(ref, {
    ...record,
    createdBy: userEmail || null,
    createdAt: serverTimestamp(),
  });
}

export async function getInvoiceRecord(number) {
  const snap = await getDoc(doc(db, "invoices", number));
  return snap.exists() ? snap.data() : null;
}

// Most recent invoices first, capped at 300 for a reasonably fast history view.
export async function listInvoices() {
  const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"), limit(300));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}


// delete document
export async function deleteInvoiceRecord(number) {
  await deleteDoc(doc(db, "invoices", number))  
}