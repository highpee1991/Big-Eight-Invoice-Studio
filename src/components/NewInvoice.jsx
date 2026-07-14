import React, { useState } from "react";
import { Plus, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import Field from "./Field.jsx";
import InvoicePreview from "./InvoicePreview.jsx";
import { fmt, money } from "../utils.js";
import { inputCls, textareaCls, primaryBtnCls, secondaryBtnCls, cardCls, cardTitleCls } from "../uiClasses.js";

export default function NewInvoice(props) {
  const {
    invoiceName,
    setInvoiceName,
    clientName,
    setClientName,
    companyName,
    setCompanyName,
    clientAddress,
    setClientAddress,
    clientEmail,
    setClientEmail,
    shipToSame,
    setShipToSame,
    shipToAddress,
    setShipToAddress,
    poNumber,
    setPoNumber,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    taxRate,
    setTaxRate,
    shippingHandling,
    setShippingHandling,
    items,
    updateItem,
    addItem,
    removeItem,
    subtotal,
    taxAmount,
    total,
    formError,
    genStatus,
    generateInvoice,
    generating,
    currentInvoice,
    downloadPdf,
    downloadXlsx,
  } = props;

  return (
    <div>
      <h1 className="text-[23px] font-bold text-ink mb-1">New invoice</h1>
      <p className="text-slate text-[13.5px] mb-5">
        Fill in the client and line items. Your business details are pulled in
        automatically.
      </p>

      <div className={cardCls}>
        <h2 className={cardTitleCls}>Invoice</h2>
        <Field
          label='Invoice name (optional, e.g. "CPS Forklift Purchase")'
          hint="Used in the downloaded filename and shown in History, alongside the invoice number."
        >
          <input
            className={inputCls}
            value={invoiceName}
            onChange={(e) => setInvoiceName(e.target.value)}
            placeholder="CPS Forklift Purchase"
          />
        </Field>
      </div>

      <div className={cardCls}>
        <h2 className={cardTitleCls}>Client</h2>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Client name">
            <input
              className={inputCls}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Jeff Stark"
            />
          </Field>
          <Field label="Company name">
            <input
              className={inputCls}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Relitorin international inc."
            />
          </Field>
          <Field label="Client email (optional)">
            <input
              className={inputCls}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="billing@client.com"
            />
          </Field>
        </div>
        <Field label="Client / billing address">
          <textarea
            className={textareaCls}
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder={"1920 Rankin Rd, Studio 145\nHouston, TX 77073"}
          />
        </Field>

        <label className="flex items-center gap-2 text-[12.5px] text-slate mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={shipToSame}
            onChange={(e) => setShipToSame(e.target.checked)}
            className="accent-teal"
          />
          Ship-to address is the same as billing address
        </label>
        {!shipToSame && (
          <Field label="Ship-to address">
            <textarea
              className={textareaCls}
              value={shipToAddress}
              onChange={(e) => setShipToAddress(e.target.value)}
              placeholder="Delivery address, if different"
            />
          </Field>
        )}

        <div className="grid grid-cols-3 gap-3.5">
          <Field label="Invoice date">
            <input
              type="date"
              className={inputCls}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              className={inputCls}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label="PO / Reference (optional)">
            <input
              className={inputCls}
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="Bid No. 802-26-72561"
            />
          </Field>
        </div>
        {formError && (
          <div className="text-[12px] text-red-700 mt-1.5">{formError}</div>
        )}
      </div>

      <div className={cardCls}>
        <h2 className={cardTitleCls}>Line items</h2>
        <table className="w-full border-collapse mb-2.5">
          <thead>
            <tr>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[12%]">
                P/N
              </th>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[12%]">
                Model
              </th>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[32%]">
                Description
              </th>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[10%]">
                Qty
              </th>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[14%]">
                Unit price
              </th>
              <th className="text-left text-[11px] uppercase text-slate px-2 py-1.5 border-b border-line w-[14%]">
                Amount
              </th>
              <th className="w-[6%] border-b border-line"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className={idx % 2 === 1 ? "bg-slate-50" : ""}>
                <td className="px-2 py-1.5">
                  <input
                    className={inputCls}
                    value={it.partNumber}
                    onChange={(e) =>
                      updateItem(it.id, "partNumber", e.target.value)
                    }
                    placeholder="P/N"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={inputCls}
                    value={it.model}
                    onChange={(e) => updateItem(it.id, "model", e.target.value)}
                    placeholder="Model"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={inputCls}
                    value={it.desc}
                    onChange={(e) => updateItem(it.id, "desc", e.target.value)}
                    placeholder="Description of work"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    className={inputCls}
                    value={it.qty}
                    min="0"
                    step="1"
                    onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    className={inputCls}
                    value={it.price}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => updateItem(it.id, "price", e.target.value)}
                  />
                </td>
                <td className="px-2 py-2.5 font-mono text-[13px]">
                  {money(it.amount)}
                </td>
                <td className="text-center pt-3">
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-red-700"
                    title="Remove line"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className={secondaryBtnCls} onClick={addItem}>
          <Plus size={14} /> Add line item
        </button>

        <div className="flex justify-end mt-3.5">
          <div className="w-72 font-mono text-[13.5px]">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span>
                Tax{" "}
                <input
                  type="number"
                  value={taxRate}
                  min="0"
                  step="0.1"
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-12 px-1 py-0.5 font-mono text-[12px] ml-1 border border-line rounded"
                />
                %
              </span>
              <span>{money(taxAmount)}</span>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span>Shipping / handling</span>
              <input
                type="number"
                value={shippingHandling}
                min="0"
                step="0.01"
                onChange={(e) => setShippingHandling(e.target.value)}
                className="w-20 px-1 py-0.5 font-mono text-[12px] border border-line rounded text-right"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between border-t border-line mt-1 pt-2 font-bold text-[15px]">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h2 className={cardTitleCls}>Notes / payment terms</h2>
        <textarea
          className={textareaCls + " min-h-[76px]"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2.5 mt-1 mb-[5.5px]">
        <button
          className={primaryBtnCls}
          onClick={generateInvoice}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate invoice"}
        </button>
        <span className="text-[12px] text-slate px-3 py-2">{genStatus}</span>
      </div>

      {currentInvoice && (
        <div>
          <div className="flex gap-2.5 mb-4">
            <button
              className={secondaryBtnCls}
              onClick={() => downloadPdf(currentInvoice)}
            >
              <FileText size={15} /> Download PDF
            </button>
            <button
              className={secondaryBtnCls}
              onClick={() => downloadXlsx(currentInvoice)}
            >
              <FileSpreadsheet size={15} /> Download Excel
            </button>
          </div>
          <InvoicePreview inv={currentInvoice} />
        </div>
      )}
    </div>
  );
}
