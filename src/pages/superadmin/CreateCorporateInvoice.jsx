import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileText,
  CheckSquare,
  Square,
  ChevronRight,
  Download,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth"; // adjust path as needed

// ── helpers ──────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = new Date().toISOString().split("T")[0];

// First day of current month
const firstOfMonth = new Date();
firstOfMonth.setDate(1);
const firstOfMonthStr = firstOfMonth.toISOString().split("T")[0];

// ── component ─────────────────────────────────────────────────────
export default function CreateCorporateInvoice() {
  const navigate = useNavigate();

  // Auth
  const { data: user } = useAuth();
  const isSuperAdmin =
    user?.roles?.[0]?.name === "super-admin" ||
    user?.roles?.[0]?.name === "admin";
  const branchId = user?.owner_id;

  // ── Step state ────────────────────────────────────────────────
  // "filter" → user filling the form
  // "preview" → shipments fetched, user reviewing
  // "success" → invoice created
  const [step, setStep] = useState("filter");

  // ── Filter state ──────────────────────────────────────────────
  const [selectedBranch, setSelectedBranch] = useState(
    isSuperAdmin ? "" : String(branchId ?? "")
  );
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState(firstOfMonthStr);
  const [dateTo, setDateTo] = useState(today);

  // ── Preview state ─────────────────────────────────────────────
  const [shipments, setShipments] = useState([]);   // full list from API
  const [selected, setSelected] = useState({});     // { [id]: true/false }
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [pdfLoading, setPdfLoading]         = useState(false);

  // ── Reference data ────────────────────────────────────────────
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/api/branches").then((r) => r.data.data ?? []),
    staleTime: Infinity,
    enabled: isSuperAdmin,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-corporate"],
    queryFn: () =>
      api.get("/api/customers?type=corporate").then((r) => r.data.data ?? []),
    staleTime: Infinity,
  });

  // ── Preview mutation ──────────────────────────────────────────
  const previewMutation = useMutation({
    mutationFn: (params) =>
      api
        .get("/api/invoices/preview-corporate", { params })
        .then((r) => r.data),
    onSuccess: (data) => {
      const list = data.shipments ?? [];
      setShipments(list);
      // Pre-select all
      const all = {};
      list.forEach((s) => (all[s.id] = true));
      setSelected(all);
      setStep("preview");
    },
  });

  // ── Create mutation ───────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body) =>
      api.post("/api/invoices/corporate", body).then((r) => r.data),
    onSuccess: (data) => {
      setCreatedInvoice(data.data);
      setStep("success");
    },
  });

  // ── Derived: selected shipment objects ────────────────────────
  const selectedShipments = useMemo(
    () => shipments.filter((s) => selected[s.id]),
    [shipments, selected]
  );

  // ── Derived: charge summary from selected rows ────────────────
  const summary = useMemo(() => {
    let freightVas = 0, fuel = 0, fodDod = 0;

    selectedShipments.forEach((s) => {
      const c = s.charges;
      if (!c) return;
      freightVas +=
        Number(c.freight ?? 0) +
        Number(c.awb_fee ?? 0) +
        Number(c.fov ?? 0) +
        Number(c.handling ?? 0) +
        Number(c.oda ?? 0) +
        Number(c.dcc ?? 0) +
        Number(c.pickup_charges ?? 0) +
        Number(c.delivery_charges ?? 0) +
        Number(c.other_charges ?? 0) +
        Number(c.premium_charges ?? 0) +
        (c.insurance_type === "carrier" ? Number(c.carrier_insurance ?? 0) : 0);
      fuel   += Number(c.fuel ?? 0);
      fodDod += Number(c.fod ?? 0) + Number(c.dod ?? 0);
    });

    const subtotal = freightVas + fuel + fodDod;
    const gst      = Math.round(subtotal * 0.18 * 100) / 100;

    // Intra-state: compare branch state to majority consignee state
    // For UI purposes we use the summary returned by the preview API
    // but recompute here so it's reactive to row selection changes.
    // We'll pass isIntraState from the API's summary on confirm.

    return {
      freightVas: Math.round(freightVas * 100) / 100,
      fuel:       Math.round(fuel * 100)       / 100,
      fodDod:     Math.round(fodDod * 100)     / 100,
      subtotal:   Math.round(subtotal * 100)   / 100,
      gst:        gst,
      grandTotal: Math.round((subtotal + gst) * 100) / 100,
    };
  }, [selectedShipments]);

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    setPdfLoading(true);
    try {
      const response = await api.get(`/api/invoices/${invoiceId}/pdf`, {
        responseType: "blob",
      });
      const url      = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link     = document.createElement("a");
      link.href      = url;
      link.download  = `VK-CORP-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can retry
    } finally {
      setPdfLoading(false);
    }
  };
  
  // ── Handlers ──────────────────────────────────────────────────
  const handleFetch = () => {
    if (!selectedCustomer) return;
    const effectiveBranch = isSuperAdmin ? selectedBranch : branchId;
    if (!effectiveBranch) return;

    previewMutation.mutate({
      customer_id: selectedCustomer,
      branch_id:   effectiveBranch,
      from_date:   dateFrom,
      to_date:     dateTo,
    });
  };

  const toggleRow = (id) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const allSelected = selectedShipments.length === shipments.length;
    const next = {};
    shipments.forEach((s) => (next[s.id] = !allSelected));
    setSelected(next);
  };

  const handleCreate = () => {
    const effectiveBranch = isSuperAdmin ? selectedBranch : branchId;
    createMutation.mutate({
      customer_id:   Number(selectedCustomer),
      branch_id:     Number(effectiveBranch),
      from_date:     dateFrom,
      to_date:       dateTo,
      shipment_ids:  selectedShipments.map((s) => s.id),
    });
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("filter");
      setShipments([]);
    } else {
      navigate(-1);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Corporate Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {step === "filter"
              ? "Select a customer and date range to fetch uninvoiced shipments."
              : step === "preview"
              ? "Review and deselect any shipments before confirming."
              : "Invoice created successfully."}
          </p>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {["filter", "preview", "success"].map((s, i) => {
          const labels = ["Filter", "Review", "Done"];
          const active = step === s;
          const done =
            (s === "filter" && (step === "preview" || step === "success")) ||
            (s === "preview" && step === "success");
          return (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${active ? "bg-blue-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {i + 1}
              </span>
              <span className={active ? "font-semibold text-gray-900" : "text-gray-400"}>
                {labels[i]}
              </span>
              {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════
          STEP 1 — Filter form
          ════════════════════════════════════════ */}
      {step === "filter" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-xl">
          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Shipment Criteria
          </h2>

          <div className="space-y-4">
            {/* Branch — only for super-admin / admin */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select branch…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select corporate customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                    {c.contact_person ? ` — ${c.contact_person}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {previewMutation.isError && (
            <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>
                {previewMutation.error?.response?.data?.message ??
                  "Failed to fetch shipments. Please try again."}
              </span>
            </div>
          )}

          {/* Validation hint */}
          {previewMutation.data?.shipments?.length === 0 && (
            <div className="mt-4 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>No uninvoiced shipments found for this customer and period.</span>
            </div>
          )}

          <button
            onClick={handleFetch}
            disabled={
              previewMutation.isPending ||
              !selectedCustomer ||
              (isSuperAdmin && !selectedBranch)
            }
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm cursor-pointer"
          >
            <Search size={16} />
            {previewMutation.isPending ? "Fetching…" : "Fetch Shipments"}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 2 — Review shipments
          ════════════════════════════════════════ */}
      {step === "preview" && (
        <div className="space-y-5">

          {/* Info bar */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
            <span className="text-blue-800">
              <span className="font-semibold">{shipments.length}</span> uninvoiced shipment
              {shipments.length !== 1 ? "s" : ""} found.{" "}
              <span className="font-semibold">{selectedShipments.length}</span> selected.
            </span>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 text-xs underline cursor-pointer"
            >
              Change filters
            </button>
          </div>

          <div className="flex gap-5 items-start">

            {/* ── Shipment table ── */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-3 w-10">
                      <button onClick={toggleAll} className="cursor-pointer text-gray-500 hover:text-gray-800">
                        {selectedShipments.length === shipments.length
                          ? <CheckSquare size={16} className="text-blue-600" />
                          : <Square size={16} />}
                      </button>
                    </th>
                    <th className="p-3 text-left font-medium text-gray-600">S.No</th>
                    <th className="p-3 text-left font-medium text-gray-600">AWB</th>
                    <th className="p-3 text-left font-medium text-gray-600">Ship Date</th>
                    <th className="p-3 text-left font-medium text-gray-600">Destination</th>
                    <th className="p-3 text-left font-medium text-gray-600">Type</th>
                    <th className="p-3 text-right font-medium text-gray-600">Chrg Wt (kg)</th>
                    <th className="p-3 text-right font-medium text-gray-600">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s, i) => {
                    const isChecked = !!selected[s.id];
                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggleRow(s.id)}
                        className={`border-t border-gray-100 cursor-pointer transition
                          ${isChecked ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-50 hover:opacity-70"}`}
                      >
                        <td className="p-3 text-center">
                          {isChecked
                            ? <CheckSquare size={15} className="text-blue-600 mx-auto" />
                            : <Square size={15} className="text-gray-400 mx-auto" />}
                        </td>
                        <td className="p-3 text-gray-500">{i + 1}</td>
                        <td className="p-3 font-mono font-semibold text-gray-900">
                          {s.awb_number}
                        </td>
                        <td className="p-3 text-gray-600">
                          {s.booked_at
                            ? new Date(s.booked_at).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="p-3 text-gray-700">{s.consignee_city ?? "—"}</td>
                        <td className="p-3 text-gray-600">
                          {s.service_type ?? s.service ?? "—"}
                        </td>
                        <td className="p-3 text-right text-gray-700">
                          {fmt(s.charges?.chargeable_weight)}
                        </td>
                        <td className="p-3 text-right font-semibold text-gray-900">
                          {fmt(s.charges?.grand_total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                  <tr>
                    <td colSpan={7} className="p-3 text-right text-sm font-semibold text-gray-700">
                      Selected Total
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900">
                      ₹{fmt(selectedShipments.reduce((acc, s) => acc + Number(s.charges?.grand_total ?? 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Charge summary panel ── */}
            <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Charge Summary
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Freight</span>
                  <span className="font-medium">₹{fmt(summary.freightVas)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Fuel</span>
                  <span className="font-medium">₹{fmt(summary.fuel)}</span>
                </div>
                {summary.fodDod > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>FOD / DOD</span>
                    <span className="font-medium">₹{fmt(summary.fodDod)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2.5 flex justify-between font-semibold text-gray-800">
                  <span>Subtotal</span>
                  <span>₹{fmt(summary.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST @ 18%</span>
                  <span className="font-medium">₹{fmt(summary.gst)}</span>
                </div>

                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-base font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{fmt(summary.grandTotal)}</span>
                </div>
              </div>

              {/* Shipment count guard */}
              {selectedShipments.length === 0 && (
                <p className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg p-2 text-center">
                  Select at least one shipment to proceed.
                </p>
              )}

              {/* Error */}
              {createMutation.isError && (
                <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    {createMutation.error?.response?.data?.message ??
                      "Failed to create invoice."}
                  </span>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || selectedShipments.length === 0}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm cursor-pointer"
              >
                <FileText size={15} />
                {createMutation.isPending ? "Creating…" : "Create Invoice"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 3 — Success
          ════════════════════════════════════════ */}
      {step === "success" && createdInvoice && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <FileText size={22} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Invoice Created</h2>
          <p className="text-sm text-gray-500 mb-5">
            Invoice{" "}
            <span className="font-mono font-semibold text-gray-800">
              {createdInvoice.invoice_number}
            </span>{" "}
            has been finalized with{" "}
            {createdInvoice.shipments?.length ?? selectedShipments.length} shipment
            {(createdInvoice.shipments?.length ?? selectedShipments.length) !== 1 ? "s" : ""}.
          </p>

          {/* Summary recap */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{fmt(createdInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST</span>
              <span>
                ₹{fmt(
                  Number(createdInvoice.cgst ?? 0) +
                  Number(createdInvoice.sgst ?? 0) +
                  Number(createdInvoice.igst ?? 0)
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Grand Total</span>
              <span>₹{fmt(createdInvoice.grand_total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => downloadPdf(createdInvoice.id, createdInvoice.invoice_number)}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              <Download size={15} />
               {pdfLoading ? "Generating…" : "Download PDF"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition text-sm cursor-pointer"
            >
              Back to Invoices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}