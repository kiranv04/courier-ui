import { useQuery } from "@tanstack/react-query";
import { Package, Truck, MapPin, CheckCircle, FileText, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const STATUS_COLORS = {
  booked:           "bg-gray-100 text-gray-700",
  picked_up:        "bg-blue-100 text-blue-700",
  in_transit:       "bg-purple-100 text-purple-700",
  at_branch:        "bg-teal-100 text-teal-700",
  out_for_delivery: "bg-yellow-100 text-yellow-700",
  delivered:        "bg-green-100 text-green-700",
  exception:        "bg-red-100 text-red-700",
  cancelled:        "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  booked:           "Booked",
  picked_up:        "Picked Up",
  in_transit:       "In Transit",
  at_branch:        "At Branch",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  exception:        "Exception",
  cancelled:        "Cancelled",
};

const MANIFEST_TYPE_LABELS = {
  pickup:   "Pickup",
  dispatch: "Dispatch",
  delivery: "Delivery",
};

const MANIFEST_TYPE_COLORS = {
  pickup:   "bg-blue-100 text-blue-700",
  dispatch: "bg-purple-100 text-purple-700",
  delivery: "bg-green-100 text-green-700",
};

export default function BranchDashboard() {
  const { data: user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-branch"],
    queryFn: () => api.get("/api/dashboard/branch").then(r => r.data.data),
    staleTime: 0,
    refetchInterval: 60000, // refresh every minute
  });

  const statCards = [
    {
      label:  "Bookings Today",
      value:  data?.bookings_today ?? 0,
      icon:   Package,
      color:  "bg-blue-800",
    },
    {
      label:  "Pending Pickup",
      value:  data?.pending_pickup ?? 0,
      icon:   Clock,
      color:  "bg-yellow-700",
    },
    {
      label:  "In Transit",
      value:  data?.in_transit ?? 0,
      icon:   Truck,
      color:  "bg-purple-800",
    },
    {
      label:  "At Branch",
      value:  data?.at_branch ?? 0,
      icon:   MapPin,
      color:  "bg-teal-700",
    },
    {
      label:  "Out for Delivery",
      value:  data?.out_for_delivery ?? 0,
      icon:   Truck,
      color:  "bg-orange-700",
    },
    {
      label:  "Delivered Today",
      value:  data?.delivered_today ?? 0,
      icon:   CheckCircle,
      color:  "bg-green-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Branch Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      {/* Stat cards */}
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
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Shipments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          </div>
          <div className="overflow-x-auto">
            {!data?.recent_shipments?.length ? (
              <p className="text-center text-gray-400 py-8">No shipments today</p>
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
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
                          {STATUS_LABELS[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Manifests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Today's Manifests</h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                (data?.open_manifests ?? 0) > 0
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {data?.open_manifests ?? 0} open
              </span>
            </div>
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
                          {MANIFEST_TYPE_LABELS[m.type]}
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