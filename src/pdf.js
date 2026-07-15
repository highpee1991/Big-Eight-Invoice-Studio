import { jsPDF } from "jspdf";
import { money } from "./utils.js";
import { LOGO_DATA_URI } from "./logoAsset.js";

const NAVY = [47, 111, 228];
const TEAL = [47, 168, 79];
const SLATE = [90, 107, 117];
const LIGHT = [220, 220, 220];

function clean(str) {
  if (str === null || str === undefined) return str;
  return String(str)
    .replace(/[\u2018\u2019\u02BC]/g, "'") // curly single quotes -> '
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes -> "
    .replace(/\u2032/g, "'") // prime (feet) -> '
    .replace(/\u2033/g, '"') // double prime (inches) -> "
    .replace(/[\u2013\u2014]/g, "-") // en/em dash -> hyphen
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u00A0/g, " "); // non-breaking space -> space
}

export function buildPdf(inv) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 46;
  let y = 50;

  try {
    doc.addImage(LOGO_DATA_URI, "PNG", marginX, y - 16, 40, 38);
  } catch (e) {
    /* logo is optional, ignore if it fails to embed */
  }

  doc.setFont("helvetica", "bold");doc.addImage;
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(clean(inv.business.name) || "", marginX + 54, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text(clean(inv.business.tagline) || "", marginX + 54, y + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  const bizLines = [inv.business.address, inv.business.email, inv.business.phone, inv.business.website]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .map(clean)
  let by = y + 32;
  bizLines.forEach((line) => {
    doc.text(line, marginX, by);
    by += 12;
  });

  // INVOICE title + number, top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("INVOICE", pageWidth - marginX, y, { align: "right" });
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEAL);
  doc.text(inv.number, pageWidth - marginX, y + 16, { align: "right" });
  if (inv.invoiceName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text(clean(inv.invoiceName), pageWidth - marginX, y + 30, { align: "right" });
  }

  let cursorY = Math.max(by, y + 46) + 18;
  doc.setDrawColor(...LIGHT);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 20;

  // Metadata table: Invoice date | Due date | PO/Ref | Prepared by
  const metaColW = (pageWidth - marginX * 2) / 4;
  const metaLabels = ["INVOICE DATE", "DUE DATE", "PO / REFERENCE", "PREPARED BY"];
  const metaValues = [inv.invoiceDate || "-", inv.dueDate || "-", clean(inv.poNumber) || "-", clean(inv.business.repName) || "-"];
  doc.setFillColor(247, 249, 250);
  doc.rect(marginX, cursorY, pageWidth - marginX * 2, 34, "F");
  doc.setDrawColor(...LIGHT);
  doc.rect(marginX, cursorY, pageWidth - marginX * 2, 34, "S");
  metaLabels.forEach((label, i) => {
    const x = marginX + i * metaColW;
    if (i > 0) doc.line(x, cursorY, x, cursorY + 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(label, x + 8, cursorY + 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(String(metaValues[i]), x + 8, cursorY + 26);
  });
  cursorY += 54;

  // Bill To / Ship To
  const halfW = (pageWidth - marginX * 2) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text("BILL TO", marginX, cursorY);
  doc.text("SHIP TO", marginX + halfW, cursorY);
  cursorY += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  const billLines = [
    inv.clientName,
    ...inv.clientAddress.split("\n"),
    inv.clientEmail || "",
  ].filter(Boolean).map(clean);
  const shipAddr =
    inv.shipToAddress && inv.shipToAddress.trim()
      ? inv.shipToAddress
      : inv.clientAddress;
  const shipLines = [inv.clientName, ...shipAddr.split("\n")].filter(Boolean).map(clean);
  const colWidth = halfW - 12;
  const billWrapped = billLines.flatMap((line) =>
    doc.splitTextToSize(line, colWidth),
  );
  const shipWrapped = shipLines.flatMap((line) =>
    doc.splitTextToSize(line, colWidth),
  );
  const maxWrappedLines = Math.max(billWrapped.length, shipWrapped.length);
  let by2 = cursorY;
  for (let i = 0; i < maxWrappedLines; i++) {
    if (billWrapped[i]) doc.text(billWrapped[i], marginX, by2);
    if (shipWrapped[i]) doc.text(shipWrapped[i], marginX + halfW, by2);
    by2 += 13;
  }
  cursorY = by2 + 12;

  // Items table
  const cols = [
    { key: "partNumber", label: "P/N", w: 0.11, align: "left" },
    { key: "model", label: "MODEL", w: 0.13, align: "left" },
    { key: "desc", label: "DESCRIPTION", w: 0.36, align: "left" },
    { key: "qty", label: "QTY", w: 0.1, align: "right" },
    { key: "price", label: "UNIT PRICE", w: 0.14, align: "right" },
    { key: "amount", label: "AMOUNT", w: 0.16, align: "right" },
  ];
  const tableW = pageWidth - marginX * 2;
  let colX = marginX;
  const colPositions = cols.map((c) => {
    const pos = { ...c, x: colX, w: c.w * tableW };
    colX += pos.w;
    return pos;
  });

  doc.setFillColor(...NAVY);
  doc.rect(marginX, cursorY, tableW, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  colPositions.forEach((c) => {
    const tx = c.align === "right" ? c.x + c.w - 6 : c.x + 6;
    doc.text(c.label, tx, cursorY + 13, { align: c.align });
  });
  cursorY += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const descCol = colPositions.find((c) => c.key === "desc");
  inv.items.forEach((it, idx) => {
    const descLines = doc.splitTextToSize(clean(it.desc) || "", descCol.w - 10);
    const rowH = Math.max(18, descLines.length * 12 + 6);

    if (idx % 2 === 1) {
      doc.setFillColor(247, 249, 250);
      doc.rect(marginX, cursorY, tableW, rowH, "F");
    }
    doc.setTextColor(20, 20, 20);
    const values = {
      partNumber: clean(it.partNumber) || "—",
      model: clean(it.model) || "—",
      qty: String(it.qty),
      price: money(it.price),
      amount: money(it.amount),
    };
    colPositions.forEach((c) => {
      if (c.key === "desc") return; // handled separately below, since it can wrap
      const tx = c.align === "right" ? c.x + c.w - 6 : c.x + 6;
      doc.text(String(values[c.key]), tx, cursorY + 12, {
        align: c.align,
        maxWidth: c.w - 10,
      });
    });
    doc.text(descLines, descCol.x + 6, cursorY + 12);

    doc.setDrawColor(...LIGHT);
    doc.line(marginX, cursorY + rowH, marginX + tableW, cursorY + rowH);
    cursorY += rowH;
  });
  cursorY += 18;

  // Totals
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text("Subtotal", pageWidth - marginX - 100, cursorY, { align: "right" });
  doc.text(money(inv.subtotal), pageWidth - marginX, cursorY, { align: "right" });
  cursorY += 15;
  doc.text("Tax (" + inv.taxRate + "%)", pageWidth - marginX - 100, cursorY, { align: "right" });
  doc.text(money(inv.tax), pageWidth - marginX, cursorY, { align: "right" });
  cursorY += 15;
  if (inv.shippingHandling > 0) {
    doc.text("Shipping / Handling", pageWidth - marginX - 100, cursorY, { align: "right" });
    doc.text(money(inv.shippingHandling), pageWidth - marginX, cursorY, { align: "right" });
    cursorY += 15;
  }
  doc.setDrawColor(20, 20, 20);
  doc.line(pageWidth - marginX - 200, cursorY, pageWidth - marginX, cursorY);
  cursorY += 17;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Total", pageWidth - marginX - 100, cursorY, { align: "right" });
  doc.text(money(inv.total), pageWidth - marginX, cursorY, { align: "right" });

  cursorY += 32;
  if (inv.business.bank || inv.business.account || inv.business.remitToAddress) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text("PAYMENT DETAILS", marginX, cursorY);
    cursorY += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const payLines = [
      inv.business.bank ? "Bank: " + clean(inv.business.bank) : "",
      inv.business.account ? "Account: " + clean(inv.business.account) : "",
      inv.business.routingNumber ? "Routing: " + clean(inv.business.routingNumber) : "",
      inv.business.swift ? "SWIFT/BIC: " + clean(inv.business.swift) : "",
    ].filter(Boolean);
    payLines.forEach((line) => {
      doc.text(line, marginX, cursorY);
      cursorY += 13;
    });
    if (inv.business.remitToAddress) {
      doc.text("Remit to: " + clean(inv.business.remitToAddress).replace(/\n/g, ", "), marginX, cursorY, { maxWidth: pageWidth - marginX * 2 });
      cursorY += 13;
    }
    cursorY += 6;
  }
  if (inv.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text(doc.splitTextToSize(clean(inv.notes), pageWidth - marginX * 2), marginX, cursorY);
    cursorY += 24;
  }

  // Signature line
  cursorY += 20;
  doc.setDrawColor(120, 120, 120);
  doc.line(marginX, cursorY, marginX + 220, cursorY);
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text("Date: ______________", marginX + 240, cursorY);
  cursorY += 16;
  if (inv.business.repName) {
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(clean(inv.business.repName) + (inv.business.repTitle ? ", " + clean(inv.business.repTitle) : ""), marginX, cursorY);
  }

  return doc;
}
