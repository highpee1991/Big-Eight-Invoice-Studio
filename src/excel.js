import ExcelJS from "exceljs";
import { LOGO_BASE64 } from "./logoAsset.js";
import { invoiceFilename } from "./utils.js";

const NAVY = "FF2F6FE4";
const TEAL = "FF2FA84F";
const SLATE = "FF5A6B75";
const LIGHT_FILL = "FFF7F9FA";
const WHITE = "FFFFFFFF";
const BORDER = { style: "thin", color: { argb: "FFDDE3E7" } };
const THIN_BORDERS = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };

function setCell(sheet, ref, value, opts = {}) {
  const cell = sheet.getCell(ref);
  cell.value = value;
  if (opts.bold || opts.size || opts.color || opts.italic) {
    cell.font = { bold: !!opts.bold, italic: !!opts.italic, size: opts.size || 10, color: { argb: opts.color || "FF16232E" }, name: "Calibri" };
  }
  if (opts.align) cell.alignment = { horizontal: opts.align, vertical: "middle", wrapText: !!opts.wrap };
  else if (opts.wrap) cell.alignment = { wrapText: true, vertical: "top" };
  if (opts.fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: opts.fill } };
  if (opts.border) cell.border = THIN_BORDERS;
  return cell;
}

export async function buildWorkbook(inv) {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Invoice", { properties: { defaultColWidth: 14 } });
  sheet.columns = [
    { width: 12 }, // A - P/N
    { width: 14 }, // B - Model
    { width: 34 }, // C - Description
    { width: 9 },  // D - Qty
    { width: 14 }, // E - Unit price
    { width: 14 }, // F - Amount
  ];

  // Logo
  try {
    const imageId = wb.addImage({ base64: LOGO_BASE64, extension: "png" });
    sheet.addImage(imageId, { tl: { col: 0, row: 0.1 }, ext: { width: 54, height: 52 } });
  } catch (e) {
    /* logo is optional */
  }

  setCell(sheet, "C1", inv.business.name || "", { bold: true, size: 14 });
  setCell(sheet, "C2", inv.business.tagline || "", { italic: true, size: 9, color: TEAL });
  sheet.mergeCells("C3:D6");
  setCell(sheet, "C3", [inv.business.address, inv.business.email, inv.business.phone, inv.business.website].filter(Boolean).join("\n"), { size: 9, color: SLATE, wrap: true });

  sheet.mergeCells("E1:F1");
  setCell(sheet, "E1", "INVOICE", { bold: true, size: 16, align: "right" });
  sheet.mergeCells("E2:F2");
  setCell(sheet, "E2", inv.number, { bold: true, size: 11, color: TEAL, align: "right" });
  if (inv.invoiceName) {
    sheet.mergeCells("E3:F3");
    setCell(sheet, "E3", inv.invoiceName, { size: 9, color: SLATE, align: "right" });
  }

  // Metadata row
  const metaRow = 8;
  const metaLabels = ["DATE", "TERMS", "DUE DATE", "PO / REFERENCE", "PREPARED BY", ""];
  const metaValues = [inv.invoiceDate || "-", inv.terms || "-", inv.dueDate || "-", inv.poNumber || "-", inv.business.repName || "-", ""];
  ["A", "B", "C", "D", "E", "F"].forEach((col, i) => {
    setCell(sheet, `${col}${metaRow}`, metaLabels[i], { bold: true, size: 7.5, color: WHITE, fill: NAVY, border: true });
    setCell(sheet, `${col}${metaRow + 1}`, metaValues[i], { bold: true, size: 10, color: WHITE, fill: NAVY, border: true });
  });

  // Bill to / Ship to
  const billRow = 11;
  setCell(sheet, `A${billRow}`, "BILL TO", { bold: true, size: 8.5, color: SLATE });
  setCell(sheet, `D${billRow}`, "SHIP TO", { bold: true, size: 8.5, color: SLATE });
  const billLines = [
    inv.clientName || "",
    inv.companyName || "",
    ...inv.clientAddress.split("\n"),
    inv.clientEmail || "",
    inv.clientPhone || "",
  ].filter(Boolean);
  const shipAddr = inv.shipToAddress && inv.shipToAddress.trim() ? inv.shipToAddress : inv.clientAddress;
  const shipLines = [inv.clientName, ...shipAddr.split("\n")].filter(Boolean);
  sheet.mergeCells(`A${billRow + 1}:C${billRow + 3}`);
  setCell(sheet, `A${billRow + 1}`, billLines.join("\n"), { size: 10.5, wrap: true });
  sheet.mergeCells(`D${billRow + 1}:F${billRow + 3}`);
  setCell(sheet, `D${billRow + 1}`, shipLines.join("\n"), { size: 10.5, wrap: true });

  // Items table
  const headerRow = billRow + 5;
  const headers = ["P/N", "MODEL", "DESCRIPTION", "QTY", "UNIT PRICE", "AMOUNT"];
  ["A", "B", "C", "D", "E", "F"].forEach((col, i) => {
    setCell(sheet, `${col}${headerRow}`, headers[i], { bold: true, size: 9, color: WHITE, fill: NAVY, align: i >= 3 ? "right" : "left", border: true });
  });

  let row = headerRow + 1;
  inv.items.forEach((it, idx) => {
    const fill = idx % 2 === 1 ? LIGHT_FILL : null;
    setCell(sheet, `A${row}`, it.partNumber || "—", { size: 9.5, fill, border: true });
    setCell(sheet, `B${row}`, it.model || "—", { size: 9.5, fill, border: true });
    setCell(sheet, `C${row}`, it.desc, { size: 9.5, fill, border: true });
    setCell(sheet, `D${row}`, it.qty, { size: 9.5, fill, border: true, align: "right" });
    setCell(sheet, `E${row}`, it.price, { size: 9.5, fill, border: true, align: "right" }).numFmt = "#,##0.00";
    setCell(sheet, `F${row}`, it.amount, { size: 9.5, fill, border: true, align: "right" }).numFmt = "#,##0.00";
    row += 1;
  });

  row += 1;
  setCell(sheet, `E${row}`, "Subtotal", { align: "right", size: 10 });
  setCell(sheet, `F${row}`, inv.subtotal, { align: "right", size: 10 }).numFmt = "#,##0.00";
  row += 1;
  setCell(sheet, `E${row}`, `Tax (${inv.taxRate}%)`, { align: "right", size: 10 });
  setCell(sheet, `F${row}`, inv.tax, { align: "right", size: 10 }).numFmt = "#,##0.00";
  row += 1;
  if (inv.shippingHandling > 0) {
    setCell(sheet, `E${row}`, "Shipping / Handling", { align: "right", size: 10 });
    setCell(sheet, `F${row}`, inv.shippingHandling, { align: "right", size: 10 }).numFmt = "#,##0.00";
    row += 1;
  }
  setCell(sheet, `E${row}`, "TOTAL", { align: "right", bold: true, size: 12, color: NAVY });
  setCell(sheet, `F${row}`, inv.total, { align: "right", bold: true, size: 12, color: NAVY }).numFmt = "#,##0.00";
  sheet.getRow(row).eachCell({ includeEmpty: false }, (cell) => {
    cell.border = { ...cell.border, top: { style: "medium", color: { argb: "FF16232E" } } };
  });

  row += 3;
  if (inv.business.bank || inv.business.account || inv.business.remitToAddress) {
    setCell(sheet, `A${row}`, "PAYMENT DETAILS", { bold: true, size: 8.5, color: SLATE });
    row += 1;
    const payLines = [
      inv.business.bank ? "Bank: " + inv.business.bank : "",
      inv.business.account ? "Account: " + inv.business.account : "",
      inv.business.routingNumber
        ? "ACH/Direct Deposit Routing: " + inv.business.routingNumber
        : "",
      inv.business.wireRoutingNumber
        ? "Wire Routing: " + inv.business.wireRoutingNumber
        : "",
      inv.business.swift ? "SWIFT/BIC: " + inv.business.swift : "",
      inv.business.remitToAddress
        ? "Remit to: " + inv.business.remitToAddress.replace(/\n/g, ", ")
        : "",
    ].filter(Boolean);
    sheet.mergeCells(`A${row}:F${row + payLines.length - 1}`);
    setCell(sheet, `A${row}`, payLines.join("\n"), { size: 9.5, wrap: true });
    row += payLines.length + 1;
  }
  if (inv.notes) {
    sheet.mergeCells(`A${row}:F${row + 2}`);
    setCell(sheet, `A${row}`, inv.notes, { size: 9, color: SLATE, wrap: true });
    row += 4;
  }

  row += 1;
  setCell(sheet, `A${row}`, "Signature: ____________________________     Date: ______________", { size: 9.5, color: SLATE });
  row += 2;
  if (inv.business.repName) {
    setCell(sheet, `A${row}`, inv.business.repName + (inv.business.repTitle ? " — " + inv.business.repTitle : ""), { size: 10 });
  }

  return wb;
}

export async function downloadWorkbook(inv) {
  const wb = await buildWorkbook(inv);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = invoiceFilename(inv, "xlsx");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
