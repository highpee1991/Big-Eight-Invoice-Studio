import React from "react";
import { fmt, money } from "../utils.js";
import { LOGO_DATA_URI } from "../logoAsset.js";

export default function InvoicePreview({ inv }) {
  const shipTo = inv.shipToAddress && inv.shipToAddress.trim() ? inv.shipToAddress : inv.clientAddress;

  return (
    <div className="flex justify-center">
      <div className="relative bg-white w-full max-w-3xl px-10 py-9 shadow-lg rounded-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex gap-3">
            <img src={LOGO_DATA_URI} alt="" className="w-14 h-14 shrink-0" />
            <div>
              <div className="text-lg font-bold text-ink">
                {inv.business.name}
              </div>
              <div className="text-[11.5px] italic text-teal mb-1">
                {inv.business.tagline}
              </div>
              <div className="text-[12px] text-slate leading-relaxed whitespace-pre-line">
                {inv.business.address}
                {inv.business.email ? "\n" + inv.business.email : ""}
                {inv.business.phone ? "\n" + inv.business.phone : ""}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="bg-navy text-white font-bold text-[13px] tracking-wide px-3.5 py-2 rounded-sm inline-block">
              INVOICE {inv.number}
            </div>
            {inv.invoiceName && (
              <div className="text-[12px] text-slate mt-2">
                {inv.invoiceName}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-[1px] bg-navy rounded-sm overflow-hidden mb-6 text-[12px]">
          <div className="bg-navy px-3 py-2">
            <div className="text-[10px] uppercase text-white/70 tracking-wide">
              Date
            </div>
            <div className="font-mono font-bold text-white">
              {inv.invoiceDate || "—"}
            </div>
          </div>
          <div className="bg-navy px-3 py-2">
            <div className="text-[10px] uppercase text-white/70 tracking-wide">
              Terms
            </div>
            <div className="font-bold text-white">{inv.terms || "—"}</div>
          </div>
          <div className="bg-navy px-3 py-2">
            <div className="text-[10px] uppercase text-white/70 tracking-wide">
              Due date
            </div>
            <div className="font-mono font-bold text-white">
              {inv.dueDate || "—"}
            </div>
          </div>
          <div className="bg-navy px-3 py-2">
            <div className="text-[10px] uppercase text-white/70 tracking-wide">
              PO / Reference
            </div>
            <div className="font-mono font-bold text-white">
              {inv.poNumber || "—"}
            </div>
          </div>
          <div className="bg-navy px-3 py-2">
            <div className="text-[10px] uppercase text-white/70 tracking-wide">
              Prepared by
            </div>
            <div className="font-bold text-white">
              {inv.business.repName || "—"}
            </div>
          </div>
        </div>

        {/* Bill to / Ship to */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-slate mb-1">
              Bill to
            </div>
            <div className="text-[13.5px] leading-relaxed whitespace-pre-line">
              {inv.clientName}
              {"\n"}
              {inv.companyName}
              {"\n"}
              {inv.clientAddress}
              {inv.clientEmail ? "\n" + inv.clientEmail : ""}
              {inv.clientPhone ? "\n" + inv.clientPhone : ""}
            </div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-slate mb-1">
              Ship to
            </div>
            <div className="text-[13.5px] leading-relaxed whitespace-pre-line">
              {shipTo}
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full border-collapse mb-2 text-[13px]">
          <thead>
            <tr className="bg-navy text-white">
              <th className="text-left font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2 rounded-tl-sm">
                P/N
              </th>
              <th className="text-left font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2">
                Model
              </th>
              <th className="text-left font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2">
                Description
              </th>
              <th className="text-right font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2">
                Qty
              </th>
              <th className="text-right font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2">
                Unit price
              </th>
              <th className="text-right font-semibold text-[10.5px] uppercase tracking-wide px-2.5 py-2 rounded-tr-sm">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}
              >
                <td className="px-2.5 py-2 border-b border-gray-200 text-slate font-mono text-[12px]">
                  {it.partNumber || "—"}
                </td>
                <td className="px-2.5 py-2 border-b border-gray-200 text-slate font-mono text-[12px]">
                  {it.model || "—"}
                </td>
                <td className="px-2.5 py-2 border-b border-gray-200">
                  {it.desc}
                </td>
                <td className="px-2.5 py-2 border-b border-gray-200 text-right font-mono">
                  {it.qty}
                </td>
                <td className="px-2.5 py-2 border-b border-gray-200 text-right font-mono">
                  {money(it.price)}
                </td>
                <td className="px-2.5 py-2 border-b border-gray-200 text-right font-mono font-medium">
                  {money(it.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-3">
          <div className="w-64 font-mono text-[13px]">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>{money(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({inv.taxRate}%)</span>
              <span>{money(inv.tax)}</span>
            </div>
            {inv.shippingHandling > 0 && (
              <div className="flex justify-between py-1">
                <span>Shipping / Handling</span>
                <span>{money(inv.shippingHandling)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-ink mt-1 pt-2 font-bold text-[16px]">
              <span>Total</span>
              <span>{money(inv.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment details */}
        {(inv.business.bank || inv.business.account || inv.business.zelle) && (
          <div className="mt-6 text-[11.5px] text-slate border-t border-gray-200 pt-3">
            <span className="font-semibold text-ink">Payment details</span>
            <br />
            {inv.business.zelle ? "Zelle: " + inv.business.zelle + "  " : ""}
            {inv.business.bank ? "Bank: " + inv.business.bank + "  " : ""}
            {inv.business.account
              ? "Account: " + inv.business.account + "  "
              : ""}
            {inv.business.routingNumber
              ? "Routing: " + inv.business.routingNumber + "  "
              : ""}
            {inv.business.swift ? "SWIFT/BIC: " + inv.business.swift : ""}
            {inv.business.bankAddress ? (
              <>
                <br />
                Bank address: {inv.business.bankAddress}
              </>
            ) : null}
            {inv.business.remitToAddress ? (
              <>
                <br />
                Remit to: {inv.business.remitToAddress}
              </>
            ) : null}
            {inv.business.cardFeeNote ? (
              <>
                <br />
                {inv.business.cardFeeNote}
              </>
            ) : null}
          </div>
        )}

        {/* Refund / cancellation policy */}
        {inv.business.refundPolicy && (
          <div className="mt-4 text-[10.5px] text-slate border-t border-gray-200 pt-3 whitespace-pre-line">
            {inv.business.refundPolicy}
          </div>
        )}


        {/* Notes */}
        {inv.notes && (
          <div className="mt-4 text-[11.5px] text-slate border-t border-gray-200 pt-3 whitespace-pre-line">
            {inv.notes}
          </div>
        )}

        {/* Signature line */}
        <div className="mt-9 flex items-end gap-3 text-[11.5px] text-slate">
          <div className="flex-1 border-b border-gray-400 pb-1">&nbsp;</div>
          <div className="pb-1">Date: ______________</div>
        </div>
        {inv.business.repName && (
          <div className="mt-2 text-[12px] text-ink">
            {inv.business.repName}
            {inv.business.repTitle ? (
              <span className="text-slate"> — {inv.business.repTitle}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
