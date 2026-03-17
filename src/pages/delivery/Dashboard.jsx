import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, MapPin, Phone, Loader2, IndianRupee } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const FAILURE_REASONS = [
    { value: "customer_not_available", label: "Customer Not Available" },
    { value: "wrong_address",          label: "Wrong Address" },
    { value: "refused_delivery",       label: "Refused Delivery" },
    { value: "damaged",                label: "Damaged — Cannot Deliver" },
    { value: "other",                  label: "Other" },
];

const DeliverModal = ({ isOpen, onClose, assignment }) => {
    const [codAmount, setCodAmount] = useState("");
    const queryClient = useQueryClient();
    const isCOD = assignment?.shipment?.payment_mode === "COD";

    const mutation = useMutation({
        mutationFn: () => api.post(
            `/api/delivery/shipments/${assignment.shipment.id}/deliver`,
            isCOD ? { cod_amount_collected: Number(codAmount) } : {}
        ),
        onSuccess: () => {
            queryClient.invalidateQueries(["delivery-shipments"]);
            toast.success("Shipment marked as delivered!");
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed"),
    });

    if (!isOpen || !assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4">
                <h3 className="text-xl font-bold">Confirm Delivery</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold">{assignment.shipment.consignee_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{assignment.shipment.consignee_address}</p>
                    <p className="text-sm text-gray-500">
                        {assignment.shipment.consignee_city} — {assignment.shipment.consignee_pincode}
                    </p>
                </div>
                {isCOD && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            COD Amount Collected <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <IndianRupee size={16} className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="number"
                                value={codAmount}
                                onChange={(e) => setCodAmount(e.target.value)}
                                placeholder={`Expected: ₹${assignment.shipment.cod_amount}`}
                                className="w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || (isCOD && !codAmount)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
                        Confirm Delivered
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 py-4 rounded-xl font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const FailModal = ({ isOpen, onClose, assignment }) => {
    const [reason, setReason] = useState("");
    const [notes, setNotes]   = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => api.post(
            `/api/delivery/shipments/${assignment.shipment.id}/fail`,
            { reason, notes: notes }
        ),
        onSuccess: () => {
            queryClient.invalidateQueries(["delivery-shipments"]);
            toast.success("Delivery attempt recorded");
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed"),
    });

    if (!isOpen || !assignment) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4">
                <h3 className="text-xl font-bold">Report Failed Delivery</h3>
                <p className="text-sm text-gray-500">
                    {assignment.shipment.awb_number} — {assignment.shipment.consignee_name}
                </p>
                <div className="space-y-2">
                    {FAILURE_REASONS.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setReason(r.value)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition
                                ${reason === r.value
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-200 hover:border-gray-300"}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
                {reason === "other" && (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please describe the reason..."
                        rows={3}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                )}
                <div className="flex gap-3">
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={
                            mutation.isPending ||
                            !reason ||
                            (reason === "other" && !notes)
                        }
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
                        Submit
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 py-4 rounded-xl font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

function ShipmentCard({ assignment, onDeliver, onFail, isReattempt = false }) {
    const s = assignment.shipment;
    const totalBoxes  = s.parcels?.reduce((sum, p) => sum + p.num_boxes, 0) ?? 0;
    const totalWeight = s.parcels?.reduce((sum, p) => sum + (p.weight * p.num_boxes), 0) ?? 0;

    return (
      <div className={`bg-white rounded-2xl shadow-sm border-2 p-4 space-y-3
        ${isReattempt ? "border-orange-200" : "border-gray-200"}`}>

        <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono font-bold text-gray-900">{s.awb_number}</span>
            <div className="flex items-center gap-2 flex-wrap">
                {s.payment_type === "COD" && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        COD ₹{s.cod_amount}
                    </span>
                )}
                {isReattempt && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Re-attempt
                    </span>
                )}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {s.service_type} {s.service}
                </span>
            </div>
        </div>

        <div>
            <p className="font-semibold text-gray-900">{s.consignee_name}</p>
            <div className="flex items-start gap-1 mt-1">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-500">
                    {s.consignee_address}, {s.consignee_city} — {s.consignee_pincode}
                </p>
            </div>
            {s.consignee_phone && (
                <a
                    href={`tel:${s.consignee_phone}`}
                    className="flex items-center gap-1 mt-1 text-blue-600 text-sm"
                >
                    <Phone size={14} />
                    {s.consignee_phone}
                </a>
            )}
        </div>

        <div className="flex gap-3 text-xs text-gray-500">
            <span>{totalBoxes} box{totalBoxes !== 1 ? "es" : ""}</span>
            <span>•</span>
            <span>{totalWeight.toFixed(2)} kg</span>
        </div>

        {isReattempt && assignment.notes && (
            <div className="bg-orange-50 rounded-lg px-3 py-2 text-xs text-orange-700">
                Previous: {assignment.notes}
            </div>
        )}

        <div className="flex gap-2 pt-1">
            <button
                onClick={onDeliver}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
                <CheckCircle size={18} />
                Delivered
            </button>
            <button
                onClick={onFail}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
                <XCircle size={18} />
                Failed
            </button>
        </div>
      </div>
    );
}

export default function DeliveryDashboard() {
    const { data: user }  = useAuth();
    const [deliverModal, setDeliverModal] = useState(null);
    const [failModal, setFailModal]       = useState(null);

    const { data: assignments = [], isLoading } = useQuery({
        queryKey: ["delivery-shipments"],
        queryFn: () => api.get("/api/delivery/shipments").then(r => r.data.data),
        staleTime: 0,
    });

    const pending = assignments.filter(a => a.status === "pending");
    const failed  = assignments.filter(a => a.status === "failed");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-teal-500 px-4 pt-10 pb-6">
                <p className="text-blue-100 text-sm">
                    Good {new Date().getHours() < 12 ? "morning" : "afternoon"},
                </p>
                <h1 className="text-2xl font-bold text-white mt-1">{user?.name}</h1>
                <div className="flex gap-4 mt-4">
                    <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                        <p className="text-2xl font-bold text-white">{pending.length}</p>
                        <p className="text-xs text-blue-100">Pending</p>
                    </div>
                    <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                        <p className="text-2xl font-bold text-white">{failed.length}</p>
                        <p className="text-xs text-blue-100">Failed</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-gray-400" />
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16">
                        <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">All done for today!</p>
                        <p className="text-gray-400 text-sm mt-1">No pending deliveries</p>
                    </div>
                ) : (
                    <>
                        {pending.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Pending ({pending.length})
                                </h2>
                                <div className="space-y-3">
                                    {pending.map((a) => (
                                        <ShipmentCard
                                            key={a.id}
                                            assignment={a}
                                            onDeliver={() => setDeliverModal(a)}
                                            onFail={() => setFailModal(a)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {failed.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Re-attempt ({failed.length})
                                </h2>
                                <div className="space-y-3">
                                    {failed.map((a) => (
                                        <ShipmentCard
                                            key={a.id}
                                            assignment={a}
                                            onDeliver={() => setDeliverModal(a)}
                                            onFail={() => setFailModal(a)}
                                            isReattempt
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeliverModal
                isOpen={!!deliverModal}
                onClose={() => setDeliverModal(null)}
                assignment={deliverModal}
            />
            <FailModal
                isOpen={!!failModal}
                onClose={() => setFailModal(null)}
                assignment={failModal}
            />
        </div>
    );
}