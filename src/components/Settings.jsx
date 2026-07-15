import React from "react";
import Field from "./Field.jsx";
import { inputCls, textareaCls, primaryBtnCls, cardCls } from "../uiClasses.js";

export default function Settings({
  business,
  setBusiness,
  saveSettings,
  settingsStatus,
  startOverride,
  setStartOverride,
  nextNumberTag,
}) {
  function upd(field, value) {
    setBusiness({ ...business, [field]: value });
  }

  return (
    <div>
      <h1 className="text-[23px] font-bold text-ink mb-1">Business details</h1>
      <p className="text-slate text-[13.5px] mb-5">
        Shared across the whole team — saved once, reused on every invoice
        anyone generates.
      </p>
      <div className={cardCls}>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Business name">
            <input
              className={inputCls}
              value={business.name}
              onChange={(e) => upd("name", e.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputCls}
              value={business.tagline}
              onChange={(e) => upd("tagline", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Business address">
          <textarea
            className={textareaCls}
            value={business.address}
            onChange={(e) => upd("address", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Email">
            <input
              className={inputCls}
              value={business.email}
              onChange={(e) => upd("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={business.phone}
              onChange={(e) => upd("phone", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Website">
            <input
              className={inputCls}
              value={business.website}
              onChange={(e) => upd("website", e.target.value)}
            />
          </Field>
          <Field label="Tax / VAT ID">
            <input
              className={inputCls}
              value={business.taxId}
              onChange={(e) => upd("taxId", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Bank name">
            <input
              className={inputCls}
              value={business.bank}
              onChange={(e) => upd("bank", e.target.value)}
              placeholder="First National Bank"
            />
          </Field>
          <Field label="Account number / IBAN">
            <input
              className={inputCls}
              value={business.account}
              onChange={(e) => upd("account", e.target.value)}
              placeholder="Account number or IBAN"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="ACH / Direct Deposit routing number">
            <input
              className={inputCls}
              value={business.routingNumber}
              onChange={(e) => upd("routingNumber", e.target.value)}
              placeholder="For domestic wire/ACH"
            />
          </Field>
          <Field label="Wire transfer routing number">
            <input
              className={inputCls}
              value={business.wireRoutingNumber}
              onChange={(e) => upd("wireRoutingNumber", e.target.value)}
              placeholder="Only if different from ACH routing number"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="SWIFT / BIC">
            <input
              className={inputCls}
              value={business.swift}
              onChange={(e) => upd("swift", e.target.value)}
              placeholder="For international wire"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Bank address">
            <input
              className={inputCls}
              value={business.bankAddress}
              onChange={(e) => upd("bankAddress", e.target.value)}
              placeholder="6228 Westline Dr, Houston TX 77036"
            />
          </Field>
          <Field label="Contact email">
            <input
              className={inputCls}
              value={business.zelle}
              onChange={(e) => upd("zelle", e.target.value)}
              placeholder="email or phone used for Bank"
            />
          </Field>
        </div>
        <Field
          label="Credit card processing fee note (optional)"
          hint="Shown near the payment section if you accept cards."
        >
          <input
            className={inputCls}
            value={business.cardFeeNote}
            onChange={(e) => upd("cardFeeNote", e.target.value)}
            placeholder="For credit card payments, there is a 4% processing fee that would be added."
          />
        </Field>
        <Field
          label="Refund / cancellation policy (optional)"
          hint="Printed on every invoice, below the payment details."
        >
          <textarea
            className={textareaCls}
            rows={5}
            value={business.refundPolicy}
            onChange={(e) => upd("refundPolicy", e.target.value)}
            placeholder="e.g. Returns accepted within 24-72 hours of delivery, 6% restocking fee applies..."
          />
        </Field>
        <Field label="Remit-to address (optional, if different from business address)">
          <textarea
            className={textareaCls}
            value={business.remitToAddress}
            onChange={(e) => upd("remitToAddress", e.target.value)}
            placeholder="Leave blank to use your business address above"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Authorized representative">
            <input
              className={inputCls}
              value={business.repName}
              onChange={(e) => upd("repName", e.target.value)}
              placeholder="Name shown on invoice footer"
            />
          </Field>
          <Field label="Representative title">
            <input
              className={inputCls}
              value={business.repTitle}
              onChange={(e) => upd("repTitle", e.target.value)}
            />
          </Field>
        </div>
        <Field
          label="Next invoice number override (optional)"
          hint={
            <>
              Leave blank unless you need to correct the counter. Current next
              number: <span className="font-mono">{nextNumberTag}</span>
            </>
          }
        >
          <input
            type="number"
            className={inputCls}
            value={startOverride}
            onChange={(e) => setStartOverride(e.target.value)}
            placeholder="200"
          />
        </Field>
        <div className="flex items-center gap-2.5 mt-1">
          <button className={primaryBtnCls} onClick={saveSettings}>
            Save business details
          </button>
          <span className="text-[12px] text-slate">{settingsStatus}</span>
        </div>
      </div>
    </div>
  );
}
