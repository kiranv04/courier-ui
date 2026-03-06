import { useState, useMemo } from "react";
import { X, Search, CheckSquare, Square, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import toast from "react-hot-toast";

const MANIFEST_TYPES = {
  branch: [
    { value: "pickup",   label: "Pickup Manifest",   description: "Shipments collected from customers", fromStatus: "booked" },
    { value: "dispatch", label: "Dispatch Manifest",  description: "Shipments being sent to hub or branch", fromStatus: "picked_up" },
    { value: "delivery", label: "Delivery Manifest",  description: "Shipments assigned to delivery agents", fromStatus: "at_branch" },
  ],
  warehouse: [
    { value: "inbound",  label: "Inbound Manifest",   description: "Shipments received at this hub", fromStatus: "in_transit" },
    { value: "outbound", label: "Outbound Manifest",  description: "Shipments being sent to next destination", fromStatus: "at_hub" },
  ],
};

export default function CreateManifestModal({ isOpen, onClose, userRole }) {
  const [step, setStep] = useState(1);
  const [manifestType, setManifestType] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [deliveryAgentId, setDeliveryAgentId] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const isWarehouse = userRole === "warehouse-admin" || userRole === "warehouse-employee";
  const manifestTypes = isWarehouse ? MANIFEST_TYPES.warehouse : MANIFEST_TYPES.branch;

  const resetForm = () => {
    setStep(1);
    setManifestType(null);
    setSelectedIds([]);
    setSearch("");
    setDestinationType("");
    setDestinationId("");
    setDeliveryAgentId("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Fetch eligible shipments
  const { data: eligibleShipments = [], isLoading: loadingShipments } = useQuery({
    queryKey: ["eligible-shipments", manifestType],
    queryFn: () => api.get(`/api/manifests/eligible-shipments?type=${manifestType}`).then(r => r.data.data),
    enabled: !!manifestType && step === 2,
    staleTime: 0,
  });

  // Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ["shipment-destinations"],
    queryFn: () => api.get("/api/shipments/destinations").then(r => r.data.data),
    enabled: isOpen && (manifestType === "dispatch" || manifestType === "outbound") && step === 3,
    staleTime: Infinity,
  });

  // Fetch delivery agents
  const { data: agents = [] } = useQuery({
    queryKey: ["delivery-agents-manifest"],
    queryFn: () => api.get(`/api/shipments/delivery-agents?branch_id=${queryClient.getQueryData(["auth-user"])?.owner_id}`)
      .then(r => r.data.data),
    enabled: isOpen && manifestType === "delivery" && step === 3,
    staleTime: Infinity,
  });

  const filteredShipments = useMemo(() => {
    if (!search.trim()) return eligibleShipments;
    const q = search.toLowerCase();
    return eligibleShipments.filter(s =>
      s.awb_number?.toLowerCase().includes(q) ||
      s.consignee_name?.toLowerCase().includes(q) ||
      s.consignee_city?.toLowerCase().includes(q)
    );
  }, [eligibleShipments, search]);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShipments.map(s => s.id));
    }
  };

  const needsDestination = manifestType === "dispatch" || manifestType === "outbound";
  const needsAgent = manifestType === "delivery";

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/api/manifests", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["manifests"]);
      toast.success("Manifest created successfully!");
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create manifest"),
  });

  const handleSubmit = () => {
    if (needsDestination && (!destinationType || !destinationId)) {
      toast.error("Please select a destination");
      return;
    }
    if (needsAgent && !deliveryAgentId) {
      toast.error("Please select a delivery agent");
      return;
    }

    mutation.mutate({
      type:               manifestType,
      shipment_ids:       selectedIds,
      destination_type:   needsDestination ? destinationType : undefined,
      destination_id:     needsDestination ? Number(destinationId) : undefined,
      delivery_agent_id:  needsAgent ? Number(deliveryAgentId) : undefined,
      notes:              notes || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Manifest</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Step {step} of {needsDestination || needsAgent ? 3 : 2}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 py-3 gap-2 border-b shrink-0">
          {["Type", "Shipments", "Details"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
                ${step > i + 1 ? "bg-green-500 text-white" :
                  step === i + 1 ? "bg-blue-600 text-white" :
                  "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {label}
              </span>
              {i < 2 && <ChevronRight size={16} className="text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1 — Select type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select the type of manifest you want to create:</p>
              {manifestTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setManifestType(type.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition cursor-pointer
                    ${manifestType === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"}`}
                >
                  <p className="font-semibold text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Eligible: status = {type.fromStatus}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Select shipments */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by AWB, consignee name or city..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select all */}
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {selectedIds.length === filteredShipments.length && filteredShipments.length > 0
                    ? <CheckSquare size={18} />
                    : <Square size={18} />
                  }
                  {selectedIds.length === filteredShipments.length && filteredShipments.length > 0
                    ? "Deselect All"
                    : "Select All"
                  }
                </button>
                <span className="text-sm text-gray-500">
                  {selectedIds.length} of {filteredShipments.length} selected
                </span>
              </div>

              {/* Shipment list */}
              {loadingShipments ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 size={24} className="animate-spin mr-2" />
                  Loading shipments...
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No eligible shipments found</p>
                  {search && <p className="text-sm mt-1">Try clearing the search</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredShipments.map((s) => {
                    const isSelected = selectedIds.includes(s.id);
                    const totalWeight = s.parcels?.reduce((sum, p) => sum + (p.weight * p.num_boxes), 0) ?? 0;
                    const totalBoxes = s.parcels?.reduce((sum, p) => sum + p.num_boxes, 0) ?? 0;

                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleSelect(s.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition
                          ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className={`shrink-0 ${isSelected ? "text-blue-600" : "text-gray-300"}`}>
                          {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-semibold text-gray-900">{s.awb_number}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {s.service_type} {s.service}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            To: <span className="font-medium">{s.consignee_name}</span>
                            {s.consignee_city && ` — ${s.consignee_city}`}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500 shrink-0">
                          <p>{totalBoxes} box{totalBoxes !== 1 ? "es" : ""}</p>
                          <p>{totalWeight.toFixed(2)} kg</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Destination or Agent */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">
                  {selectedIds.length} shipment{selectedIds.length !== 1 ? "s" : ""} will be included in this manifest
                </p>
              </div>

              {needsDestination && (
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

              {needsAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Agent <span className="text-red-500">*</span>
                  </label>
                  {agents.length === 0 ? (
                    <p className="text-sm text-red-500">No delivery agents found for this branch.</p>
                  ) : (
                    <select
                      value={deliveryAgentId}
                      onChange={(e) => setDeliveryAgentId(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select delivery agent</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} — {agent.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t shrink-0">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!manifestType}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => {
                if (selectedIds.length === 0) {
                  toast.error("Please select at least one shipment");
                  return;
                }
                // Skip step 3 if no destination or agent needed (pickup/inbound)
                if (!needsDestination && !needsAgent) {
                  handleSubmit();
                } else {
                  setStep(3);
                }
              }}
              disabled={selectedIds.length === 0 || mutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {mutation.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Creating...</>
                : needsDestination || needsAgent
                  ? <> Next <ChevronRight size={18} /></>
                  : "Create Manifest"
              }
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
              {mutation.isPending ? "Creating..." : "Create Manifest"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}