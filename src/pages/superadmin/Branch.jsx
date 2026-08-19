// src/pages/masters/Location.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, RefreshCw, Filter } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { mobileValidationMessage } from "../../utils/mobile";
import { emailValidationMessage } from "../../utils/email";

// Reusable Modal
const BranchModal = ({ isOpen, onClose, branch = null, locations, states }) => {
  const [form, setForm] = useState({
    name: "",
    code: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    phone: "",
    email: "",
    yieldRatioDoor: "",
    yieldRatioWarehouse: "",
    locationId: "",
    region: "",
    pincode: "",
    state: "",
    discount: "",
    discountType: "",
  });

  const phoneError = mobileValidationMessage(form.phone);
  const emailError = emailValidationMessage(form.email);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && branch) {
      setForm({
        name: branch?.name || "",
        code: branch?.code || "",
        addressLine1: branch?.address_line_1 || "",
        addressLine2: branch?.address_line_2 || "",
        addressLine3: branch?.address_line_3 || "",
        phone: branch?.phone || "",
        email: branch?.email || "",
        yieldRatioDoor: branch?.yield_ratio_door || "",
        yieldRatioWarehouse: branch?.yield_ratio_warehouse || "",
        locationId: branch?.location_id?.toString() || "",
        region: branch?.region || "",
        pincode: branch?.pincode || "",
        state: branch?.state?.toString() || "",
        discount: branch?.discount || "",
        discountType: branch?.discount_type || "",
      });
    }else if (isOpen){
      setForm({
        name: "",
        code: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        phone: "",
        email: "",
        yieldRatioDoor: "",
        yieldRatioWarehouse: "",
        locationId: "",
        region: "",
        pincode: "",
        state: "",
        discount: "",
        discountType: "",
      });
    }
  }, [isOpen, branch]);

  const mutation = useMutation({
    mutationFn: (data) =>
      branch
        ? api.put(`/api/branches/${branch.id}`, data)
        : api.post("/api/branches", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      toast.success(branch ? "Branch updated!" : "Branch created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and short code are required fields.");
      return;
    }

    if (!form.addressLine1.trim() && !form.addressLine2.trim()) {
      toast.error("Please provide complete address.");
      return;
    }

    if (!form.phone.trim() && !form.email.trim()) {
      toast.error("Please provide a phone number or an email.");
      return;
    }

    if (!form.yieldRatioDoor.trim() || !form.yieldRatioWarehouse.trim()) {
      toast.error("Both yield ratios are required");
      return;
    }

    if (!form.location_id) {
      toast.error("Please select a location.");
      return;
    }

    if (!form.state) {
      toast.error("Please select a state.");
      return;
    }

    if (!form.discount || !form.discountType) {
      toast.error("Discount fields are required.");
      return;
    }

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
          {branch ? "Edit Branch" : "Add New Branch"}
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
              placeholder="Branch name (e.g. Branch 1, etc.)"
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
              Phone Number <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value})}
              placeholder="Phone Number"
              maxLength={10}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Email <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Yield Ratio - Door to Door (%) <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.yieldRatioDoor}
              onChange={(e) => setForm({ ...form, yieldRatioDoor: e.target.value })}
              placeholder="(%)"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Yield Ratio - Warehouse to Warehouse (%) <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={form.yieldRatioWarehouse}
              onChange={(e) => setForm({ ...form, yieldRatioWarehouse: e.target.value })}
              placeholder="(%)"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 mt-4 capitalize">
          Address <span className="text-red-700">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <input
            type="text"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
            placeholder="Address Line 1"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <input
            type="text"
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
            placeholder="Address Line 2"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <input
            type="text"
            value={form.addressLine3}
            onChange={(e) => setForm({ ...form, addressLine3: e.target.value })}
            placeholder="Address Line 3"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Location <span className="text-red-700">*</span>
            </label>
            <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
                <option value="">Select Location</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Region
            </label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="Region"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Pincode
            </label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              placeholder="Pincode"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              State <span className="text-red-700">*</span>
            </label>
            <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
              <option value="">Select State</option>
              {states.map(state => <option key={state.id} value={state.id}>{state.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Discount Type
            </label>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full px-4 py-3 border rounded-lg">
              <option disabled value="">Select discount type</option>
              <option value="fixed">Fixed</option>
              <option value="percent">Percent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              Discount
            </label>
            <input
              type="text"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount  : e.target.value })}
              placeholder="Discount Value"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
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

export default function Branch() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, branch: null });
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get("/api/branches").then(res => res.data.data || res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filteredBranches = branches.filter(branch => {
    if (filter === "active") return branch.is_active;
    if (filter === "inactive") return !branch.is_active;
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

  const { data: statesData = [] } = useQuery({
    queryKey: ["states"],
    queryFn: () => api.get("/api/states").then(res => res.data.data || res.data ||  []),
    staleTime: Infinity,
  });

  const stateMap = {};
  statesData.forEach(state => {
    if (state?.id && state?.name) {
      stateMap[state.id] = state.name;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      toast.success("Branch deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/branches/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["branches"]);
      toast.success("Branch reactivated");
      setConfirmModal({ open: false });
    },
  });

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branches</h1>
        <button
          onClick={() => {
            setEditingBranch(null);
            setModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Branch
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
        <div className="text-center py-12 text-gray-500">Loading branches...</div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">Nothing to show here</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === "active" && "No active branches"}
            {filter === "inactive" && "No inactive branches"}
            {filter === "all" && "No branches found"}
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
                <th className="text-left p-4 font-medium text-gray-700">Yield Ratio (%)</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{branch.name}</td>
                  <td className="p-4 font-mono text-sm">{branch.code}</td>
                  <td className="p-4 font-mono text-sm">{locationMap[branch.location_id] || "-"}</td>
                  <td className="p-4 font-mono text-sm">{branch.yield_ratio}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      branch.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {branch.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {branch.is_active ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingBranch(branch);
                            setModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, action: "delete", branch: branch })}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "reactivate", branch: branch })}
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

      <BranchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        branch={editingBranch}
        locations={locationsData}
        states={statesData}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={confirmModal.action === "delete" ? "Delete Branch?" : "Reactivate Branch?"}
        onConfirm={() => {
          if (confirmModal.action === "delete") {
            deleteMutation.mutate(confirmModal.branch.id);
          } else {
            reactivateMutation.mutate(confirmModal.branch.id);
          }
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}