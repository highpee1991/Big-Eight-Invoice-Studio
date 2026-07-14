export function fmt(n) {
  return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
}

// Currency formatting with thousands separators, e.g. 1234.5 -> "1,234.50"
export function money(n) {
  const num = Number(n) || 0;
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function plusDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Turns a human invoice name into a safe filename fragment, e.g.
// "CPS Forklift Purchase" -> "cps-forklift-purchase"
export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Builds the download filename for an invoice: the human name (if any) plus
// the invoice number, so files are easy to find and re-download later.
export function invoiceFilename(inv, extension) {
  const slug = slugify(inv.invoiceName);
  const base = slug ? `${slug}-${inv.number}` : inv.number;
  return `${base}.${extension}`;
}
