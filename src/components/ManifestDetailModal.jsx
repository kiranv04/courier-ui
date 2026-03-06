import { X, Package, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import toast from "react-hot-toast";

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

export default function ManifestDetailModal({ isOpen, onClose, manifestId }) {
  const queryClient = useQueryClient();

  const { data: manifest, isLoading } = useQuery({
    queryKey: ["manifest", manifestId],
    queryFn: () => api.get(`/api/manifests/${manifestId}`).then(r => r.data.data),
    enabled: isOpen && !!manifestId,
    staleTime: 0,
  });

  const closeMutation = useMutation({
    mutationFn: () => api.post(`/api/manifests/${manifestId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries(["manifests"]);
      queryClient.invalidateQueries(["manifest", manifestId]);
      toast.success("Manifest closed");
    },
    onError: () => toast.error("Failed to close manifest"),
  });

  if (!isOpen) return null;

  const totalBoxes = manifest?.shipments?.reduce((sum, s) =>
    sum + (s.parcels?.reduce((ps, p) => ps + p.num_boxes, 0) ?? 0), 0) ?? 0;

  const totalWeight = manifest?.shipments?.reduce((sum, s) =>
    sum + (s.parcels?.reduce((ps, p) => ps + (p.weight * p.num_boxes), 0) ?? 0), 0) ?? 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {manifest ? manifest.manifest_number : "Loading..."}
            </h2>
            {manifest && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[manifest.type]}`}>
                  {TYPE_LABELS[manifest.type]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  manifest.status === "closed"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {manifest.status}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              Loading...
            </div>
          ) : manifest ? (
            <div className="space-y-6">

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Shipments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{manifest.shipments?.length ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Total Boxes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalBoxes}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Total Weight</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalWeight.toFixed(2)} kg</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Created By</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{manifest.created_by?.name ?? "—"}</p>
                </div>
              </div>

              {/* Manifest info */}
              <div className="border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created At</span>
                  <span className="font-medium">
                    {new Date(manifest.created_at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
                {manifest.delivery_agent && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Agent</span>
                    <span className="font-medium">{manifest.delivery_agent.name}</span>
                  </div>
                )}
                {manifest.destination_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destination</span>
                    <span className="font-medium">{manifest.destination_type?.split("\\").pop()} #{manifest.destination_id}</span>
                  </div>
                )}
                {manifest.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-medium">{manifest.notes}</span>
                  </div>
                )}
                {manifest.closed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Closed At</span>
                    <span className="font-medium">
                      {new Date(manifest.closed_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Shipments table */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Shipments in this Manifest</h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium text-gray-600">AWB</th>
                        <th className="text-left p-3 font-medium text-gray-600">Consignee</th>
                        <th className="text-left p-3 font-medium text-gray-600">Destination</th>
                        <th className="text-left p-3 font-medium text-gray-600">Boxes</th>
                        <th className="text-left p-3 font-medium text-gray-600">Weight</th>
                        <th className="text-left p-3 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manifest.shipments?.map((s) => {
                        const boxes  = s.parcels?.reduce((sum, p) => sum + p.num_boxes, 0) ?? 0;
                        const weight = s.parcels?.reduce((sum, p) => sum + (p.weight * p.num_boxes), 0) ?? 0;
                        return (
                          <tr key={s.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-mono font-medium">{s.awb_number}</td>
                            <td className="p-3">{s.consignee_name}</td>
                            <td className="p-3 text-gray-500">{s.consignee_city || "—"}</td>
                            <td className="p-3">{boxes}</td>
                            <td className="p-3">{weight.toFixed(2)} kg</td>
                            <td className="p-3">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">Manifest not found</p>
          )}
        </div>

        {/* Footer */}
        {manifest?.status === "open" && (
          <div className="px-6 py-4 border-t shrink-0">
            <button
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {closeMutation.isPending && <Loader2 size={18} className="animate-spin" />}
              {closeMutation.isPending ? "Closing..." : "Close Manifest"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}