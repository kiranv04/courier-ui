import { useState } from "react";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const TYPE_LABELS = {
  cash: "Cash",
  corporate: "Corporate",
};

export default function InvoiceReport() {
  const { data: user } = useAuth();
  const isSuperAdmin = user?.roles?.[0]?.name === "super-admin" || user?.roles?.[0]?.name === "admin";

  const [branchId, setBranchId] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Submitted filters — only updated when "Generate Report" is clicked
  const [submittedFilters, setSubmittedFilters] = useState(null);

  const { data: allBranches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/api/branches").then(res => res.data.data || []),
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
    queryFn: () => api.get("/api/reports/invoices", { params: submittedFilters }).then(res => res.data.data),
    enabled: !!submittedFilters,
  });

  const handleGenerate = () => {
    setSubmittedFilters(buildParams());
  };

  const handleDownloadPdf = () => {
    const params = new URLSearchParams(buildParams());
    const base = api.defaults.baseURL || "";
    const url = `${base}/api/reports/invoices/pdf?${params.toString()}`;
    window.open(url, "_blank");
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
                  {allBranches.filter(b => b.is_active).map(b => (
                    <option key={b.id} value={b.id}>{b.name} — {b.code}</option>
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
                    <tr key={type} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                      <td className="px-3 py-2 border-t">{TYPE_LABELS[type] || type}</td>
                      <td className="px-3 py-2 border-t">{count}</td>
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
                      {Object.keys(report.by_branch[0]?.by_type || {}).map(type => (
                        <th key={type} className="px-3 py-2 whitespace-nowrap">{TYPE_LABELS[type] || type}</th>
                      ))}
                      <th className="px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.by_branch.map((branch, i) => (
                      <tr key={branch.branch_id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="px-3 py-2 border-t whitespace-nowrap">
                          {branch.branch_name} ({branch.branch_code})
                        </td>
                        {Object.values(branch.by_type).map((count, idx) => (
                          <td key={idx} className="px-3 py-2 border-t">{count}</td>
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
    </div>
  );
}