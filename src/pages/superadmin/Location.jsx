// src/pages/masters/Location.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, RefreshCw, Filter } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// Reusable Modal
const LocationModal = ({ isOpen, onClose, location = null }) => {
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [pincode, setPincode] = useState("");
  const queryClient = useQueryClient();

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen) {
      setName(location?.name || "");
      setStateId(location?.state_id?.toString() || "");
      setShortCode(location?.short_code || "");
      setPincode(location?.pincode || "");
    }
  }, [isOpen, location]);

  // Fetch states for dropdown
  const { data: states = [] } = useQuery({
    queryKey: ["states"],
    queryFn: () => api.get("/api/states").then(res => res.data.data || res.data),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      location
        ? api.put(`/api/locations/${location.id}`, data)
        : api.post("/api/locations", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      toast.success(location ? "Location updated!" : "Location created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSave = () => {
    if (!name.trim() || !stateId || !shortCode.trim()) return;
    mutation.mutate({
      name: name.trim(),
      state_id: Number(stateId),
      short_code: shortCode.trim().toUpperCase(),
      pincode: pincode.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">
          {location ? "Edit Location" : "Add New Location"}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Location name (e.g. Bangalore, Mumbai)"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value.toUpperCase())}
            placeholder="Short code (e.g. BLR, MUM)"
            maxLength={4}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Pin code (e.g. 560032, 560040)"
            maxLength={6}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!name.trim() || !stateId || !shortCode.trim() || mutation.isPending}
            className="flex-1 bg-linear-to-r from-green-800 to-green-300 text-white cursor-pointer py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Modal
const ConfirmModal = ({ isOpen, onClose, title, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-linear-to-r from-red-700 to-red-400 cursor-pointer text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 py-3 cursor-pointer rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Location() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, location: null });

  const queryClient = useQueryClient();

  // Fetch locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.get("/api/locations").then(res => res.data.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch state mapping
  const { data: rawStates = [] } = useQuery({
		queryKey: ["states"],
		queryFn: () => api.get("/api/states").then(res => res.data.data || res.data || []),
		staleTime: Infinity,
	});

	const stateMap = {};
	rawStates.forEach(state => {
		if (state?.id && state?.name) {
			stateMap[state.id] = state.name;
		}
	});

  const filteredLocations = locations.filter(loc => {
    if (filter === "active") return loc.is_active;
    if (filter === "inactive") return !loc.is_active;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      toast.success("Location deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/locations/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["locations"]);
      toast.success("Location reactivated");
      setConfirmModal({ open: false });
    },
  });

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <button
          onClick={() => {
            setEditingLocation(null);
            setModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading locations...</div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">Nothing to show here</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === "active" && "No active locations"}
            {filter === "inactive" && "No inactive locations"}
            {filter === "all" && "No locations found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">ID</th>
                <th className="text-left p-4 font-medium text-gray-700">Location</th>
                <th className="text-left p-4 font-medium text-gray-700">State</th>
                <th className="text-left p-4 font-medium text-gray-700">Short Code</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc) => (
                <tr key={loc.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{loc.id}</td>
                  <td className="p-4 font-medium">{loc.name}</td>
                  <td className="p-4">{stateMap[loc.state_id] || "Unknown State"}</td>
                  <td className="p-4 font-mono text-sm">{loc.short_code}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      loc.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {loc.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {loc.is_active ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingLocation(loc);
                            setModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, action: "delete", location: loc })}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "reactivate", location: loc })}
                        className="text-green-600 hover:text-green-800 cursor-pointer"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        location={editingLocation}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={confirmModal.action === "delete" ? "Delete location?" : "Reactivate location?"}
        onConfirm={() => {
          if (confirmModal.action === "delete") {
            deleteMutation.mutate(confirmModal.location.id);
          } else {
            reactivateMutation.mutate(confirmModal.location.id);
          }
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}