import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, RefreshCw, Filter } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { mobileValidationMessage } from "../../utils/mobile";
import { emailValidationMessage } from "../../utils/email";

// Reusable Modal
const UserModal = ({ isOpen, onClose, user = null }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    rel_id: "",
    owner_id: "",
    branch_id: "",
    phone: "",
  });

  const phoneError = mobileValidationMessage(form.phone);
  const emailError = emailValidationMessage(form.email);

  useEffect(() => {
    if (user) {
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        password_confirmation: "",
        owner_id: user?.owner_id?.toString() || "",
        warehouse_id: user?.rel_id?.toString() || "",
        phone: user?.phone || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        owner_id: "",
        warehouse_id: "",
        phone: "",
      });
    }
  }, [isOpen, user]);

  const queryClient = useQueryClient();

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/api/warehouses").then(res => res.data.data || res.data),
    select: (data) => data.filter(b => b.is_active),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      user
        ? api.put(`/api/users/${user.id}`, data)
        : api.post("/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouse-users"]);
      toast.success(user ? "User updated!" : "User created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()){
			toast.error("Name and email are required");
			return;
		}

    if (!form.warehouse_id){
			toast.error("Please select a transit hub.");
			return;
		}

    if (!form.phone){
			toast.error("Phone number is required.");
			return;
		}

    if (!user && form.password !== form.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    if (!user && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: "warehouse-admin",
      owner_type: "App\\Models\\Warehouse",
      owner_id: Number(form.warehouse_id),
      rel_id: Number(form.warehouse_id),
      rel_type: "warehouse",
      phone: form.phone,
    };
    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{user ? "Edit Transit Hub Admin" : "Add Transit Hub Admin"}</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <input
              type="text"
              value={form.phone}
              minLength={10}
              maxLength={10}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="w-full px-4 py-3 border rounded-lg"
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          {!user && (
            <>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password (min 8 chars)"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </>
          )}
          <select
            value={form.warehouse_id}
            onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Select Transit Hub</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex-1 bg-linear-to-r from-green-800 to-green-300 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const PasswordModal = ({ isOpen, onClose, user }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, user]);

  const resetMutation = useMutation({
    mutationFn: (data) => api.post(`/api/users/${user.id}/reset-password`, data),
    onSuccess: () => {
      toast.success(`Password reset for ${user.name}! User must change it on next login.`);
      queryClient.invalidateQueries(["warehouse-users"]);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Reset failed"),
  });

  const handleReset = () => {
    if (!password || password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    resetMutation.mutate({ password, password_confirmation: confirmPassword });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full">
        <h3 className="text-xl font-semibold mb-4">Reset Password</h3>
        <div className="mb-2">
          <label className="block mb-2 font-medium">New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (min 8 chars)"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending || !password || password.length < 8 || password !== confirmPassword}
            className="flex-1 bg-linear-to-r from-green-800 to-green-300 cursor-pointer text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {resetMutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirm Modal (reuse)
const ConfirmModal = ({ isOpen, onClose, title, onConfirm, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading} className="flex-1 bg-linear-to-r from-red-700 to-red-400 cursor-pointer text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WarehouseUser() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, user: null });
  const [passwordModal, setPasswordModal] = useState({ open: false, user: null });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["warehouse-users"],
    queryFn: () => api.get("/api/users?role=warehouse-admin").then(res => res.data.data || res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get("/api/warehouses").then(res => res.data.data || res.data),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

	const warehouseMap = {};
	warehouses.forEach(warehouse => {
		if (warehouse?.id && warehouse?.name) {
			warehouseMap[warehouse.id] = warehouse.name;
		}
	});

  const filteredUsers = users.filter(u => {
    if (filter === "active") return u.is_active;
    if (filter === "inactive") return !u.is_active;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouse-users"]);
      toast.success("User deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/users/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["warehouse-users"]);
      toast.success("User reactivated");
      setConfirmModal({ open: false });
    },
  });

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transit Hub Admins</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
				<Filter size={20} className="text-gray-500" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">Nothing to show here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Transit Hub</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{warehouseMap[u.owner_id] || "-"}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.is_active ? (
                      <>
                        <button title="Edit Admin" onClick={() => { setEditingUser(u); setModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer">
                          <Edit size={18} />
                        </button>
                        <button title="Delete Admin" onClick={() => setConfirmModal({ open: true, action: "delete", user: u })} className="text-red-600 hover:text-red-800 cursor-pointer mr-3">
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setPasswordModal({ open: true, user: u })}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title="Reset Password"
                        >
                          <RefreshCw size={18} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmModal({ open: true, action: "reactivate", user: u })} className="text-green-600 hover:text-green-800 cursor-pointer">
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

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} />
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={confirmModal.action === "delete" ? "Delete Transit Hub admin?" : "Reactivate Transit Hub admin?"}
        onConfirm={() => {
          if (confirmModal.action === "delete") deleteMutation.mutate(confirmModal.user.id);
          else reactivateMutation.mutate(confirmModal.user.id);
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
      <PasswordModal
        isOpen={passwordModal.open}
        onClose={() => setPasswordModal({ open: false })}
        user={passwordModal.user}
      />
    </div>
  );
}