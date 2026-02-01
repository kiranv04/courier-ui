// src/pages/masters/Location.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, RefreshCw, Filter } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// Reusable Modal
const WarehouseModal = ({ isOpen, onClose, warehouse = null, locations }) => {
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    phone_no: "",
    email: "",
    location_id: "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && warehouse) {
      setForm({
        name: warehouse?.name || "",
        code: warehouse?.code || "",
        address: warehouse?.address || "",
        phone_no: warehouse?.phone_no || "",
        email: warehouse?.email || "",
        location_id: warehouse?.location_id?.toString() || "",
      });
    }else if (isOpen){
      setForm({
        name: "",
        code: "",
        address: "",
        phone_no: "",
        email: "",
        location_id: "",
      });
    }
  }, [isOpen, warehouse]);

  const mutation = useMutation({
    mutationFn: (data) =>
      warehouse
        ? api.put(`/api/warehouses/${warehouse.id}`, data)
        : api.post("/api/warehouses", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouses"]);
      toast.success(warehouse ? "Warehouse updated!" : "Warehouse created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    const payload = {
      ...form,
    };
    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-7xl my-8 max-h-[90vh] overflow-y-auto w-full">
        <h2 className="text-2xl font-bold mb-6">
          {warehouse ? "Edit Warehouse" : "Add New Warehouse"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Warehouse name"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Code <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Short code (e.g. MAIN, BR01)"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone_no}
              onChange={(e) => setForm({ ...form, phone_no: e.target.value.toUpperCase() })}
              placeholder="Phone Number"
              maxLength={10}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Email
            </label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value.toUpperCase() })}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Location <span className="text-red-700">*</span>
            </label>
            <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 mt-4 capitalize">
          Address <span className="text-red-700">*</span>
        </label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" rows={3} className="w-full mt-1 px-4 py-3 border rounded-lg" />
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.code.trim() || mutation.isPending}
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

export default function Warehouse() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, warehouse: null });
  const queryClient = useQueryClient();

  // Fetch warehouses
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/api/warehouses").then(res => res.data.data || res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filteredWarehouses = warehouses.filter(warehouse => {
    if (filter === "active") return warehouse.is_active;
    if (filter === "inactive") return !warehouse.is_active;
    return true;
  });

  const { data: locationsData = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.get("/api/locations").then(res => res.data.data || res.data ||  []),
    staleTime: Infinity,
  });

  const locationMap = {};
  locationsData.forEach(location => {
    if (location?.id && location?.name) {
      locationMap[location.id] = location.name;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouses"]);
      toast.success("Warehouse deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/warehouses/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouses"]);
      toast.success("Warehouse reactivated");
      setConfirmModal({ open: false });
    },
  });

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
        <button
          onClick={() => {
            setEditingWarehouse(null);
            setModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Warehouse
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
        <div className="text-center py-12 text-gray-500">Loading warehouses...</div>
      ) : filteredWarehouses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">Nothing to show here</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === "active" && "No active warehouses"}
            {filter === "inactive" && "No inactive warehouses"}
            {filter === "all" && "No warehouses found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Name</th>
                <th className="text-left p-4 font-medium text-gray-700">Code</th>
                <th className="text-left p-4 font-medium text-gray-700">Location</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map((warehouse) => (
                <tr key={warehouse.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{warehouse.name}</td>
                  <td className="p-4 font-mono text-sm">{warehouse.code}</td>
                  <td className="p-4 font-mono text-sm">{locationMap[warehouse.location_id] || "-"}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      warehouse.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {warehouse.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {warehouse.is_active ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingWarehouse(warehouse);
                            setModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, action: "delete", warehouse: warehouse })}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "reactivate", warehouse: warehouse })}
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

      <WarehouseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        warehouse={editingWarehouse}
        locations={locationsData}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={confirmModal.action === "delete" ? "Delete Warehouse?" : "Reactivate Warehouse?"}
        onConfirm={() => {
          if (confirmModal.action === "delete") {
            deleteMutation.mutate(confirmModal.warehouse.id);
          } else {
            reactivateMutation.mutate(confirmModal.warehouse.id);
          }
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}