import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Filter, Eye, Edit, FileText } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const STATUS_COLORS = {
  draft:              "bg-gray-100 text-gray-600",
  booked:             "bg-blue-100 text-blue-700",
  picked_up:          "bg-yellow-100 text-yellow-700",
  in_transit:         "bg-orange-100 text-orange-700",
  at_hub:             "bg-purple-100 text-purple-700",
  out_for_delivery:   "bg-indigo-100 text-indigo-700",
  delivered:          "bg-green-100 text-green-700",
  exception:          "bg-red-100 text-red-700",
  cancelled:          "bg-red-200 text-red-800",
};

const today = new Date().toISOString().split("T")[0];

export default function BranchBookings() {
  const navigate = useNavigate();
  const { data: branchAdmin } = useAuth();
  const branchId = branchAdmin?.owner_id;
	console.log("Branch ID:", branchId);

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo]     = useState(today);
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["branch-bookings", branchId, dateFrom, dateTo, status, page],
    queryFn: () =>
      api.get("/api/shipments", {
        params: {
					branch_id: branchId,
          date_from: dateFrom,
          date_to:   dateTo,
          status:    status || undefined,
          page,
        },
      }).then(res => res.data.data),
    enabled: !!branchId,
    keepPreviousData: true,
  });

  const shipments = data?.data || [];
  const lastPage  = data?.last_page || 1;

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <button
          onClick={() => navigate("/branch/shipments")}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2"
        >
          + New Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Filter size={20} className="text-gray-500" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="booked">Booked</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="at_hub">At Hub</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="exception">Exception</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading bookings...</div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">No bookings found for this period</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">AWB</th>
                <th className="text-left p-4 font-medium text-gray-700">Shipper</th>
                <th className="text-left p-4 font-medium text-gray-700">Consignee</th>
                <th className="text-left p-4 font-medium text-gray-700">Service</th>
                <th className="text-left p-4 font-medium text-gray-700">Payment</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm font-semibold">{s.awb_number}</td>
                  <td className="p-4">{s.shipper_name}</td>
                  <td className="p-4">{s.consignee_name}</td>
                  <td className="p-4 text-sm">{s.service}</td>
                  <td className="p-4 text-sm">{s.payment_mode || "-"}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {s.status === "draft" && (
                        <button
                          onClick={() => navigate(`/branch/shipments/${s.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Edit Draft"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/branch/shipments/${s.id}`)}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}/api/shipments/${s.id}/pdf`, "_blank")}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                        title="Print"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {lastPage}</span>
          <button
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}