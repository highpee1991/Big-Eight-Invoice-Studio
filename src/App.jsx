import React, { useState, useEffect, useRef, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Settings as SettingsIcon, History as HistoryIcon, ReceiptText, LogOut } from "lucide-react";
import { auth } from "./firebase.js";
import Login from "./Login.jsx";
import NewInvoice from "./components/NewInvoice.jsx";
import History from "./components/History.jsx";
import Settings from "./components/Settings.jsx";
import { DEFAULT_BUSINESS, DEFAULT_NOTES } from "./constants.js";
import { todayISO, plusDays, invoiceFilename } from "./utils.js";
import { buildPdf } from "./pdf.js";
import { downloadWorkbook } from "./excel.js";
import { LOGO_DATA_URI } from "./logoAsset.js";
import {
  formatNumber,
  START_NUMBER,
  getBusinessProfile,
  saveBusinessProfile,
  getNextNumberPreview,
  reserveNextNumber,
  setNextNumber,
  saveInvoiceRecord,
  listInvoices,
} from "./data.js";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return "row-" + idCounter;
}
function blankItem() {
  return { id: nextId(), partNumber: "", model: "", desc: "", qty: 1, price: "" };
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-slate">Loading…</div>;
  }
  if (!user) return <Login />;
  return <InvoiceApp user={user} />;
}

function InvoiceApp({ user }) {
  const [view, setView] = useState("new");
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [nextNumber, setNextNumberState] = useState(START_NUMBER);

  const [invoiceName, setInvoiceName] = useState("");
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [shipToSame, setShipToSame] = useState(true);
  const [shipToAddress, setShipToAddress] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(plusDays(todayISO(), 14));
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingHandling, setShippingHandling] = useState("");
  const [items, setItems] = useState([blankItem()]);

  const [formError, setFormError] = useState("");
  const [genStatus, setGenStatus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [startOverride, setStartOverride] = useState("");
  const [toast, setToast] = useState("");

  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [historyIndex, setHistoryIndex] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => {
    (async () => {
      const profile = await getBusinessProfile();
      if (profile) setBusiness({ ...DEFAULT_BUSINESS, ...profile });
      else await saveBusinessProfile(DEFAULT_BUSINESS);
      const n = await getNextNumberPreview();
      setNextNumberState(n);
    })();
  }, []);

  async function refreshHistory() {
    setHistoryLoading(true);
    try {
      setHistoryIndex(await listInvoices());
    } finally {
      setHistoryLoading(false);
    }
  }

  function goToView(v) {
    setView(v);
    if (v === "history") refreshHistory();
  }

  function updateItem(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
  }
  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const computedItems = items.map((it) => {
    const qty = parseFloat(it.qty) || 0;
    const price = parseFloat(it.price) || 0;
    return { ...it, qty, price, amount: qty * price };
  });
  const subtotal = computedItems.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const shippingAmount = parseFloat(shippingHandling) || 0;
  const total = subtotal + taxAmount + shippingAmount;

  async function generateInvoice() {
    setFormError("");
    const cleanItems = computedItems.filter((i) => i.desc.trim() || i.partNumber.trim() || i.model.trim() || i.qty || i.price);

    if (!clientName.trim()) return setFormError("Enter a client name to continue.");
    if (!companyName.trim()) return setFormError("Enter a client company name to continue.");
    if (!clientAddress.trim()) return setFormError("Enter a client address to continue.");
    if (cleanItems.length === 0) return setFormError("Add at least one line item with a description and price.");
    if (!business.name.trim()) return setFormError("Add your business details first, in the Business Details tab.");

    setGenerating(true);
    try {
      const reserved = await reserveNextNumber();
      const number = formatNumber(reserved);

      const record = {
        number,
        invoiceName: invoiceName.trim(),
        clientName: clientName.trim(),
        companyName: companyName.trim(),
        clientAddress: clientAddress.trim(),
        clientEmail: clientEmail.trim(),
        shipToAddress: shipToSame ? "" : shipToAddress.trim(),
        poNumber: poNumber.trim(),
        invoiceDate,
        dueDate,
        notes,
        taxRate: parseFloat(taxRate) || 0,
        shippingHandling: shippingAmount,
        items: cleanItems.map((i) => ({ partNumber: i.partNumber, model: i.model, desc: i.desc, qty: i.qty, price: i.price, amount: i.amount })),
        subtotal,
        tax: taxAmount,
        total,
        business: { ...business },
      };

      await saveInvoiceRecord(record, user.email);
      setNextNumberState(reserved + 1);
      setCurrentInvoice({ ...record, createdBy: user.email });
      setGenStatus(`Saved as ${number}.`);
      showToast(`Invoice ${number} generated`);
    } catch (e) {
      setFormError("Something went wrong saving this invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function downloadPdf(inv) {
    buildPdf(inv).save(invoiceFilename(inv, "pdf"));
  }
  async function downloadXlsx(inv) {
    await downloadWorkbook(inv);
  }
  async function handleHistoryDownload(record, type) {
    if (type === "pdf") downloadPdf(record);
    else await downloadXlsx(record);
  }

  async function saveSettings() {
    await saveBusinessProfile(business);
    if (startOverride) {
      await setNextNumber(parseInt(startOverride, 10));
      setNextNumberState(parseInt(startOverride, 10));
      setStartOverride("");
    }
    setSettingsStatus("Saved.");
    showToast("Business details saved");
    setTimeout(() => setSettingsStatus(""), 2500);
  }

  const nextNumberTag = formatNumber(nextNumber);

  return (
    <div className="min-h-screen bg-paper p-6 font-sans text-ink">
      <div className="flex min-h-[640px] max-w-6xl mx-auto bg-paper rounded-xl overflow-hidden border border-line">
        {/* Sidebar */}
        <div className="w-56 shrink-0 bg-navy text-paper flex flex-col py-2">
          <div className="px-5 pb-4 border-b border-white/10 mb-2 flex items-center gap-2.5">
            <img
              src={LOGO_DATA_URI}
              alt="Big Eight Integrated logo"
              className="w-[3.5em] h-[3.5em]"
            />
            <div>
              <div className="text-sm font-bold leading-tight">Big Eight</div>
              <div className="font-mono text-[9.5px] text-teal tracking-wide uppercase">
                Invoice Studio
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <NavButton
              active={view === "new"}
              onClick={() => goToView("new")}
              icon={<ReceiptText size={16} />}
              label="New Invoice"
            />
            <NavButton
              active={view === "history"}
              onClick={() => goToView("history")}
              icon={<HistoryIcon size={16} />}
              label="History"
            />
            <NavButton
              active={view === "settings"}
              onClick={() => goToView("settings")}
              icon={<SettingsIcon size={16} />}
              label="Business Details"
            />
          </div>
          <div className="mt-auto px-5 pt-4">
            <div className="text-[11px] text-white/45 leading-relaxed mb-3.5">
              Next number
              <br />
              <span className="font-mono text-[#EAD9BC] text-[12px]">
                {nextNumberTag}
              </span>
            </div>
            <div className="text-[11.5px] text-white/55 mb-2 break-all">
              {user.email}
            </div>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 px-[7.5px] py-[6.5px] overflow-y-auto">
          {view === "new" && (
            <NewInvoice
              invoiceName={invoiceName}
              setInvoiceName={setInvoiceName}
              clientName={clientName}
              setClientName={setClientName}
              companyName={companyName}
              setCompanyName={setCompanyName}
              clientAddress={clientAddress}
              setClientAddress={setClientAddress}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              shipToSame={shipToSame}
              setShipToSame={setShipToSame}
              shipToAddress={shipToAddress}
              setShipToAddress={setShipToAddress}
              poNumber={poNumber}
              setPoNumber={setPoNumber}
              invoiceDate={invoiceDate}
              setInvoiceDate={setInvoiceDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              notes={notes}
              setNotes={setNotes}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              shippingHandling={shippingHandling}
              setShippingHandling={setShippingHandling}
              items={computedItems}
              updateItem={updateItem}
              addItem={addItem}
              removeItem={removeItem}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
              formError={formError}
              genStatus={genStatus}
              generating={generating}
              generateInvoice={generateInvoice}
              currentInvoice={currentInvoice}
              downloadPdf={downloadPdf}
              downloadXlsx={downloadXlsx}
            />
          )}
          {view === "history" && (
            <History
              historyIndex={historyIndex}
              loading={historyLoading}
              onDownload={handleHistoryDownload}
            />
          )}
          {view === "settings" && (
            <Settings
              business={business}
              setBusiness={setBusiness}
              saveSettings={saveSettings}
              settingsStatus={settingsStatus}
              startOverride={startOverride}
              setStartOverride={setStartOverride}
              nextNumberTag={nextNumberTag}
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-ink text-white px-4.5 py-2.5 rounded-md text-[13px] shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-5 py-3 text-sm border-l-[3px] transition-colors ${
        active
          ? "bg-teal/20 text-white border-[#2FA84F] font-semibold"
          : "text-white/70 border-transparent hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}
