import { useState } from "react";
import { FileText, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const TYPE_LABELS = {
  cash: "Cash",
  corporate: "Corporate",
};

// ── Drill-down modal ──────────────────────────────────────────────────────────

function DrillDownModal({ open, onClose, filters, drillParams, title }) {
  const [page, setPage] = useState(1);

  const params = { ...filters, ...drillParams, page };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices-detail", params],
    queryFn: () =>
      api.get("/api/reports/invoices/detail", { params }).then((res) => res.data.data),
    enabled: open,
  });

  if (!open) return null;

  const invoices = data?.data || [];
  const meta = data;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4">
        <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={() => { onClose(); setPage(1); }} className="hover:text-gray-200 transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          )}

          {isError && (
            <div className="text-center text-red-500 py-8">Failed to load invoices.</div>
          )}

          {!isLoading && !isError && invoices.length === 0 && (
            <div className="text-center text-gray-400 py-8">No invoices found.</div>
          )}

          {invoices.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 uppercase text-xs">
                      <th className="px-3 py-2">Invoice No.</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Grand Total</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={inv.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="px-3 py-2 border-t font-mono">{inv.invoice_number}</td>
                        <td className="px-3 py-2 border-t">{TYPE_LABELS[inv.type] || inv.type}</td>
                        <td className="px-3 py-2 border-t">{inv.customer?.company_name || "—"}</td>
                        <td className="px-3 py-2 border-t">
                          ₹{parseFloat(inv.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 border-t whitespace-nowrap">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta?.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <span>
                    Page {meta.current_page} of {meta.last_page} ({meta.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={meta.current_page === 1}
                      className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                      disabled={meta.current_page === meta.last_page}
                      className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InvoiceReport() {
  const { data: user } = useAuth();
  const isSuperAdmin =
    user?.roles?.[0]?.name === "super-admin" || user?.roles?.[0]?.name === "admin";

  const [branchId, setBranchId] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [drillParams, setDrillParams] = useState({});
  const [drillTitle, setDrillTitle] = useState("");

  const { data: allBranches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/api/branches").then((res) => res.data.data || []),
    enabled: isSuperAdmin,
    staleTime: Infinity,
  });

  const buildParams = () => {
    const params = {};
    if (isSuperAdmin && branchId) params.branch_id = branchId;
    if (customerType) params.customer_type = customerType;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  };

  const reportQuery = useQuery({
    queryKey: ["invoice-report", submittedFilters],
    queryFn: () =>
      api
        .get("/api/reports/invoices", { params: submittedFilters })
        .then((res) => res.data.data),
    enabled: !!submittedFilters,
  });

  const handleGenerate = () => setSubmittedFilters(buildParams());

  const handleDownloadPdf = () => {
    const params = new URLSearchParams(buildParams());
    const base = api.defaults.baseURL || "";
    window.open(`${base}/api/reports/invoices/pdf?${params.toString()}`, "_blank");
  };

  const handleDownloadExcel = async () => {
    const report = reportQuery.data;
    if (!report) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "VK Enterprises";
    workbook.created = new Date();

    // ── Sheet 1: Type Breakdown ──
    const sheet1 = workbook.addWorksheet("Type Breakdown");
    sheet1.columns = [
      { header: "Type", key: "type", width: 20 },
      { header: "Count", key: "count", width: 12 },
    ];

    sheet1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet1.getRow(1).fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FF0F766E" },
    };

    Object.entries(report.by_type).forEach(([type, count]) => {
      sheet1.addRow({ type: TYPE_LABELS[type] || type, count });
    });

    const totalRow = sheet1.addRow({ type: "Total", count: report.total });
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FFF0FDF4" },
    };

    // ── Sheet 2: Branch Breakdown ──
    if (report.by_branch?.length) {
      const typeKeys = Object.keys(report.by_branch[0].by_type);

      const sheet2 = workbook.addWorksheet("Branch Breakdown");
      sheet2.columns = [
        { header: "Branch", key: "branch", width: 28 },
        ...typeKeys.map((t) => ({
          header: TYPE_LABELS[t] || t,
          key: t,
          width: 16,
        })),
        { header: "Total", key: "total", width: 12 },
      ];

      sheet2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet2.getRow(1).fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: "FF0F766E" },
      };

      report.by_branch.forEach((branch) => {
        sheet2.addRow({
          branch: `${branch.branch_name} (${branch.branch_code})`,
          ...branch.by_type,
          total: branch.total,
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "invoice-report.xlsx");
  };

  const openDrill = (extraParams, title) => {
    setDrillParams(extraParams);
    setDrillTitle(title);
    setModalOpen(true);
  };

  const report = reportQuery.data;

  return (
    <div className="p-6 md:p-8 bg-white rounded-2xl shadow-2xl max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice Report</h1>

      {/* Filters */}
      <div className="border rounded-xl overflow-hidden mb-8">
        <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">
          Filters
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2">Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Branches</option>
                  {allBranches
                    .filter((b) => b.is_active)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.code}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleGenerate}
              className="flex-1 min-w-35 bg-linear-to-r from-blue-500 to-teal-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              Generate Report
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={!submittedFilters}
              className={`flex-1 min-w-35 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                submittedFilters
                  ? "bg-linear-to-r from-orange-500 to-amber-400 text-white hover:opacity-90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FileText size={20} />
              Download PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={!report}
              className={`flex-1 min-w-35 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                report
                  ? "bg-linear-to-r from-green-600 to-emerald-500 text-white hover:opacity-90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FileText size={20} />
              Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {reportQuery.isLoading && (
        <div className="text-center text-gray-400 py-8">Loading report...</div>
      )}

      {reportQuery.isError && (
        <div className="text-center text-red-500 py-8">Failed to load report. Please try again.</div>
      )}

      {report && (
        <div className="space-y-8">
          {/* Type Breakdown */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">
              Type Breakdown
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 uppercase text-xs">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.by_type).map(([type, count], i) => (
                    <tr
                      key={type}
                      onClick={() =>
                        openDrill({ type }, `${TYPE_LABELS[type] || type} Invoices`)
                      }
                      className={`cursor-pointer hover:bg-teal-50 transition ${
                        i % 2 === 1 ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-3 py-2 border-t">{TYPE_LABELS[type] || type}</td>
                      <td className="px-3 py-2 border-t font-medium text-teal-700 underline underline-offset-2">
                        {count}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-semibold">
                    <td className="px-3 py-2 border-t">Total</td>
                    <td className="px-3 py-2 border-t">{report.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Branch Breakdown */}
          {report.by_branch && (
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 font-semibold">
                Branch Breakdown
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 uppercase text-xs">
                      <th className="px-3 py-2">Branch</th>
                      {Object.keys(report.by_branch[0]?.by_type || {}).map((type) => (
                        <th key={type} className="px-3 py-2 whitespace-nowrap">
                          {TYPE_LABELS[type] || type}
                        </th>
                      ))}
                      <th className="px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.by_branch.map((branch, i) => (
                      <tr
                        key={branch.branch_id}
                        onClick={() =>
                          openDrill(
                            { branch_id: branch.branch_id },
                            `${branch.branch_name} (${branch.branch_code}) — All Invoices`
                          )
                        }
                        className={`cursor-pointer hover:bg-teal-50 transition ${
                          i % 2 === 1 ? "bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-3 py-2 border-t whitespace-nowrap font-medium">
                          {branch.branch_name} ({branch.branch_code})
                        </td>
                        {Object.entries(branch.by_type).map(([type, count]) => (
                          <td
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrill(
                                { branch_id: branch.branch_id, type },
                                `${branch.branch_name} — ${TYPE_LABELS[type] || type} Invoices`
                              );
                            }}
                            className="px-3 py-2 border-t font-medium text-teal-700 underline underline-offset-2 cursor-pointer"
                          >
                            {count}
                          </td>
                        ))}
                        <td className="px-3 py-2 border-t font-semibold">{branch.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !reportQuery.isLoading && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center text-gray-400">
          <p className="text-lg">Set your filters and click "Generate Report" to view results</p>
        </div>
      )}

      <DrillDownModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        filters={submittedFilters || {}}
        drillParams={drillParams}
        title={drillTitle}
      />
    </div>
  );
}