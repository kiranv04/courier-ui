import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Building2, Warehouse, Truck, Package, FileText } from "lucide-react";
import api from "../../services/api";

const STATUS_COLORS = {
  booked:           "bg-gray-100 text-gray-700",
  in_transit:       "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-yellow-100 text-yellow-700",
  delivered:        "bg-green-100 text-green-700",
  exception:        "bg-red-100 text-red-700",
  cancelled:        "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  booked:           "Booked",
  in_transit:       "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  exception:        "Exception",
  cancelled:        "Cancelled",
};

const MANIFEST_TYPE_COLORS = {
  pickup:   "bg-blue-100 text-blue-700",
  dispatch: "bg-purple-100 text-purple-700",
  inbound:  "bg-orange-100 text-orange-700",
  outbound: "bg-indigo-100 text-indigo-700",
  delivery: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-superadmin"],
    queryFn: () => api.get("/api/dashboard/superadmin").then(r => r.data.data),
    staleTime: 0,
    refetchInterval: 60000,
  });

  const statCards = [
    { title: "Bookings Today",    value: data?.bookings_today   ?? 0, icon: Package,   color: "bg-blue-800"   },
    { title: "In Transit",        value: data?.total_in_transit ?? 0, icon: Truck,     color: "bg-purple-800" },
    { title: "Out for Delivery",  value: data?.out_for_delivery ?? 0, icon: Truck,     color: "bg-orange-700" },
    { title: "Delivered Today",   value: data?.delivered_today  ?? 0, icon: TrendingUp,color: "bg-green-800"  },
    { title: "Active Branches",   value: data?.total_branches   ?? 0, icon: Building2, color: "bg-teal-700"   },
    { title: "Open Manifests",    value: data?.open_manifests   ?? 0, icon: FileText,  color: "bg-yellow-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Shipments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            {!data?.recent_shipments?.length ? (
              <p className="text-center text-gray-400 py-8">No shipments yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">AWB</th>
                    <th className="text-left p-4 font-medium text-gray-600">Consignee</th>
                    <th className="text-left p-4 font-medium text-gray-600">Branch</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_shipments.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-mono font-semibold">{s.awb_number}</td>
                      <td className="p-4">{s.consignee_name}</td>
                      <td className="p-4 text-gray-500">{s.branch?.name ?? "—"}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Manifests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Manifests</h2>
          </div>
          <div className="overflow-x-auto">
            {!data?.recent_manifests?.length ? (
              <p className="text-center text-gray-400 py-8">No manifests yet</p>
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