import { useState } from "react";
import { Plus, Eye, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import CreateManifestModal from "../../components/CreateManifestModal";
import ManifestDetailModal from "../../components/ManifestDetailModal";

const TYPE_LABELS = {
  pickup:   "Pickup",
  dispatch: "Dispatch",
  inbound:  "Inbound",
  outbound: "Outbound",
  delivery: "Delivery",
};

const TYPE_COLORS = {
  pickup:   "bg-blue-100 text-blue-700",
  dispatch: "bg-purple-100 text-purple-700",
  inbound:  "bg-orange-100 text-orange-700",
  outbound: "bg-indigo-100 text-indigo-700",
  delivery: "bg-green-100 text-green-700",
};

const today = () => new Date().toISOString().split("T")[0];

export default function Manifests() {
  const { data: user } = useAuth();
  const userRole = user?.roles?.[0]?.name;

  const [createOpen, setCreateOpen]     = useState(false);
  const [detailId, setDetailId]         = useState(null);
  const [filterType, setFilterType]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom]         = useState(today());
  const [dateTo, setDateTo]             = useState(today());

  const isWarehouse = userRole === "warehouse-admin" || userRole === "warehouse-employee";
  const isAdmin     = userRole === "super-admin" || userRole === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["manifests", filterType, filterStatus, dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterType)   params.append("type", filterType);
      if (filterStatus) params.append("status", filterStatus);
      if (dateFrom)     params.append("date_from", dateFrom);
      if (dateTo)       params.append("date_to", dateTo);
      return api.get(`/api/manifests?${params}`).then(r => r.data.data);
    },
    staleTime: 0,
  });

  const manifests = data?.data ?? [];

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">

      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manifests</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isWarehouse ? "Inbound & outbound manifests" : "Pickup, dispatch & delivery manifests"}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Create Manifest
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Filter size={20} className="text-gray-500" />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {isWarehouse ? (
            <>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </>
          ) : (
            <>
              <option value="pickup">Pickup</option>
              <option value="dispatch">Dispatch</option>
              <option value="delivery">Delivery</option>
            </>
          )}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading manifests...</div>
      ) : manifests.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-lg">No manifests found</p>
          <p className="text-gray-300 text-sm mt-1">
            {!isAdmin && "Create a new manifest to get started"}
          </p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Manifest No.</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Shipments</th>
                <th className="text-left p-4 font-medium text-gray-700">Created By</th>
                <th className="text-left p-4 font-medium text-gray-700">Created At</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manifests.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-mono font-semibold text-gray-900">{m.manifest_number}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[m.type]}`}>
                      {TYPE_LABELS[m.type]}
                    </span>
                  </td>
                  <td className="p-4">{m.shipments_count}</td>
                  <td className="p-4 text-gray-600">{m.created_by?.name ?? "—"}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(m.created_at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.status === "closed"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDetailId(m.id)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateManifestModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        userRole={userRole}
      />

      <ManifestDetailModal
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        manifestId={detailId}
      />
    </div>
  );
}