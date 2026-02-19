// src/pages/masters/Location.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, RefreshCw, Filter } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// Reusable Modal
const CftModal = ({ isOpen, onClose, cft = null }) => {
const [cftValue, setCftValue] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && cft) {
      setCftValue(cft.cft_value);
    }else if (isOpen){
      setCftValue("");
    }
  }, [isOpen, cft]);

  const mutation = useMutation({
    mutationFn: (data) =>
        cft
        ? api.put(`/api/cfts/${cft.id}`, data)
        : api.post("/api/cfts", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cfts"]);
      toast.success(cft ? "CFT updated!" : "CFT created!");
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSave = () => {
    if (!cftValue.trim()){
      toast.error("CFT value is required!");
      return;
    } 
    const payload = {
      cft_value: cftValue,
    };
    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl my-8 max-h-[90vh] overflow-y-auto w-full">
        <h2 className="text-2xl font-bold mb-6">
          {cft ? "Edit CFT" : "Add New CFT"}
        </h2>
        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
          CFT Value <span className="text-red-700">*</span>
        </label>
        <input
          type="text"
          value={cftValue}
          onChange={(e) => setCftValue(e.target.value)}
          placeholder="CFT Value (e.g. 6, 7, etc.)"
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

export default function Cft() {
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCft, setEditingCft] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, cft: null });
  const queryClient = useQueryClient();

  // Fetch branches
  const { data: cfts = [], isLoading } = useQuery({
    queryKey: ["cfts"],
    queryFn: () => api.get("/api/cfts").then(res => res.data.data || res.data),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filteredCfts = cfts.filter(cft => {
    if (filter === "active") return cft.is_active;
    if (filter === "inactive") return !cft.is_active;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/cfts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["cfts"]);
      toast.success("CFT deleted");
      setConfirmModal({ open: false });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/cfts/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["cfts"]);
      toast.success("CFT reactivated");
      setConfirmModal({ open: false });
    },
  });

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CFTs</h1>
        <button
          onClick={() => {
            setEditingCft(null);
            setModalOpen(true);
          }}
          className="bg-linear-to-r from-blue-500 to-teal-300 text-black cursor-pointer px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add CFT
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
        <div className="text-center py-12 text-gray-500">Loading CFTs...</div>
      ) : filteredCfts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border text-center py-16">
          <p className="text-gray-500 text-lg">Nothing to show here</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === "active" && "No active CFTs"}
            {filter === "inactive" && "No inactive CFTs"}
            {filter === "all" && "No CFTs found"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Cft Value</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCfts.map((cft) => (
                <tr key={cft.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{cft.cft_value}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cft.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {cft.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {cft.is_active ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingCft(cft);
                            setModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, action: "delete", cft: cft })}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ open: true, action: "reactivate", cft: cft })}
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

      <CftModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cft={editingCft}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false })}
        title={confirmModal.action === "delete" ? "Delete CFT?" : "Reactivate CFT?"}
        onConfirm={() => {
          if (confirmModal.action === "delete") {
            deleteMutation.mutate(confirmModal.cft.id);
          } else {
            reactivateMutation.mutate(confirmModal.cft.id);
          }
        }}
        loading={deleteMutation.isPending || reactivateMutation.isPending}
      />
    </div>
  );
}