import { useQuery } from "@tanstack/react-query";
import { Package, ArrowDownCircle, ArrowUpCircle, FileText } from "lucide-react";
import api from "../../services/api";

const MANIFEST_TYPE_COLORS = {
  inbound:  "bg-orange-100 text-orange-700",
  outbound: "bg-indigo-100 text-indigo-700",
};

const STATUS_COLORS = {
  at_hub:     "bg-orange-100 text-orange-700",
  in_transit: "bg-purple-100 text-purple-700",
};

export default function WarehouseDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-warehouse"],
    queryFn: () => api.get("/api/dashboard/warehouse").then(r => r.data.data),
    staleTime: 0,
    refetchInterval: 60000,
  });

  const statCards = [
    {
      label: "Currently At Hub",
      value: data?.at_hub_count ?? 0,
      icon:  Package,
      color: "bg-orange-700",
    },
    {
      label: "Inbound Today",
      value: data?.inbound_today ?? 0,
      icon:  ArrowDownCircle,
      color: "bg-blue-800",
    },
    {
      label: "Outbound Today",
      value: data?.outbound_today ?? 0,
      icon:  ArrowUpCircle,
      color: "bg-purple-800",
    },
    {
      label: "Open Manifests",
      value: data?.open_manifests ?? 0,
      icon:  FileText,
      color: "bg-yellow-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Warehouse Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <div className={`w-9 h-9 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Shipments at hub */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Shipments at Hub</h2>
          </div>
          <div className="overflow-x-auto">
            {!data?.recent_shipments?.length ? (
              <p className="text-center text-gray-400 py-8">No shipments currently at hub</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">AWB</th>
                    <th className="text-left p-4 font-medium text-gray-600">Consignee</th>
                    <th className="text-left p-4 font-medium text-gray-600">City</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_shipments.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-mono font-semibold">{s.awb_number}</td>
                      <td className="p-4">{s.consignee_name}</td>
                      <td className="p-4 text-gray-500">{s.consignee_city || "—"}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Today's manifests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Today's Manifests</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              (data?.open_manifests ?? 0) > 0
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}>
              {data?.open_manifests ?? 0} open
            </span>
          </div>
          <div className="overflow-x-auto">
            {!data?.recent_manifests?.length ? (
              <p className="text-center text-gray-400 py-8">No manifests today</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Manifest No.</th>
                    <th className="text-left p-4 font-medium text-gray-600">Type</th>
                    <th className="text-left p-4 font-medium text-gray-600">Shipments</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_manifests.map((m) => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-mono font-semibold">{m.manifest_number}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${MANIFEST_TYPE_COLORS[m.type]}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-4">{m.shipments_count}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          m.status === "closed"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}