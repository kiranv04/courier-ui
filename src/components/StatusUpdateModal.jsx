import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  picked_up:        "Picked Up",
  in_transit:       "In Transit",
  at_hub:           "At Hub",
  at_branch:        "At Branch",         
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  exception:        "Exception",
  cancelled:        "Cancelled",
};

const STATUS_COLORS = {
  picked_up:        "bg-blue-100 text-blue-700 border-blue-300",
  in_transit:       "bg-purple-100 text-purple-700 border-purple-300",
  at_hub:           "bg-orange-100 text-orange-700 border-orange-300",
  at_branch:        "bg-teal-100 text-teal-700 border-teal-300",
  out_for_delivery: "bg-yellow-100 text-yellow-700 border-yellow-300",
  delivered:        "bg-green-100 text-green-700 border-green-300",
  exception:        "bg-red-100 text-red-700 border-red-300",
  cancelled:        "bg-gray-100 text-gray-700 border-gray-300",
};

export default function StatusUpdateModal({ isOpen, onClose, shipment }) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [destinationType, setDestinationType] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [deliveryAgentId, setDeliveryAgentId] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const resetForm = () => {
    setSelectedStatus(null);
    setDestinationType("");
    setDestinationId("");
    setDeliveryAgentId("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Fetch allowed transitions
  const { data: transitionData, isLoading: loadingTransitions } = useQuery({
    queryKey: ["transitions", shipment?.id],
    queryFn: () => api.get(`/api/shipments/${shipment.id}/transitions`).then(r => r.data),
    enabled: isOpen && !!shipment?.id,
    staleTime: 0,
  });

  // Fetch destinations for in_transit
  const { data: destinationsData } = useQuery({ 
    queryKey: ["shipment-destinations"],
    queryFn: () => api.get("/api/shipments/destinations").then(r => r.data.data ?? r.data),
    enabled: isOpen && (selectedStatus === "in_transit" || selectedStatus === "at_branch"),
    staleTime: Infinity,
  });

  const destinations = Array.isArray(destinationsData) ? destinationsData : [];
  // console.log("Destinations Data:", destinationsData);
  // console.log("Selected Status:", selectedStatus);

  // Fetch delivery agents for out_for_delivery
  const { data: agentsData } = useQuery({
    queryKey: ["delivery-agents", shipment?.branch_id],
    queryFn: () => api.get(`/api/shipments/delivery-agents?branch_id=${shipment.branch_id}`).then(r => r.data.data),
    enabled: isOpen && selectedStatus === "out_for_delivery" && !!shipment?.branch_id,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (payload) => api.patch(`/api/shipments/${shipment.id}/statusUpdate`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["shipment", String(shipment.id)]); 
      toast.success("Status updated successfully");
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  const handleSubmit = () => {
    if (!selectedStatus) return;

    const payload = { status: selectedStatus, notes: notes || undefined };

    if (selectedStatus === "in_transit" || selectedStatus === "at_branch") {
      if (!destinationType || !destinationId) {
        toast.error("Please select a destination");
        return;
      }
      payload.destination_type = destinationType;
      payload.destination_id   = Number(destinationId);
    }

    if (selectedStatus === "out_for_delivery") {
      if (!deliveryAgentId) {
        toast.error("Please select a delivery agent");
        return;
      }
      payload.delivery_agent_id = Number(deliveryAgentId);
    }

    if ((selectedStatus === "exception" || selectedStatus === "cancelled") && !notes.trim()) {
      toast.error("Notes are required for this status");
      return;
    }

    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  const transitions = transitionData?.transitions ?? [];
  const notesRequired = selectedStatus === "exception" || selectedStatus === "cancelled";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Update Shipment Status</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Current status */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[shipment?.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[shipment?.status] ?? shipment?.status}
            </span>
          </div>

          {/* Step 1 — Select next status */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select Next Status</p>
            {loadingTransitions ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : transitions.length === 0 ? (
              <p className="text-sm text-gray-400">No transitions available for your role.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transitions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setDestinationType("");
                      setDestinationId("");
                      setDeliveryAgentId("");
                      setNotes("");
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer
                      ${selectedStatus === status
                        ? STATUS_COLORS[status]
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                  >
                    {STATUS_LABELS[status] ?? status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 — Dynamic fields based on selected status */}
          {(selectedStatus === "in_transit" || selectedStatus === "at_branch") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <select
                value={`${destinationType}::${destinationId}`}
                onChange={(e) => {
                  const [type, id] = e.target.value.split("::");
                  setDestinationType(type);
                  setDestinationId(id);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="::">Select destination</option>
                {destinations.map((dest) => (
                  <option key={`${dest.type}-${dest.id}`} value={`${dest.type}::${dest.id}`}>
                    [{dest.label}] {dest.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedStatus === "out_for_delivery" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Agent <span className="text-red-500">*</span>
              </label>
              {agentsData?.length === 0 ? (
                <p className="text-sm text-red-500">No delivery agents found for this branch.</p>
              ) : (
                <select
                  value={deliveryAgentId}
                  onChange={(e) => setDeliveryAgentId(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select delivery agent</option>
                  {(agentsData ?? []).map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} — {agent.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Notes */}
          {selectedStatus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes {notesRequired && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={notesRequired ? "Required — describe the reason" : "Optional notes"}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                  ${notesRequired && !notes.trim() ? "border-red-300 bg-red-50" : ""}`}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={!selectedStatus || mutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
            {mutation.isPending ? "Updating..." : "Confirm Update"}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}