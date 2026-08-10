import { useEffect, useState } from "react";
import { X, Loader2, Banknote, Landmark, Smartphone, CheckCircle2, NotebookText, PartyPopper, WalletCards } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import toast from "react-hot-toast";

const PAYMENT_TYPES = [
  { value: "cash", label: "Cash",  icon: Banknote },
  { value: "neft", label: "NEFT",  icon: Landmark },
  { value: "upi",  label: "UPI",   icon: Smartphone },
  { value: "cheque",  label: "Cheque",   icon: NotebookText },
  { value: "dd",  label: "Demand Draft",   icon: WalletCards },
];

// shipment: the shipment object (needs at least id; charges/collectable_amount used to prefill amount)
// onRecorded: optional callback fired after a successful save (e.g. to refresh a parent list)
export default function PaymentModal({ isOpen, onClose, shipment, onRecorded }) {
  const [paymentType, setPaymentType]   = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount]             = useState("");
  const [notes, setNotes]               = useState("");
  const queryClient = useQueryClient();

  const shipmentId = shipment?.id;

  // Existing payment, if one was already recorded — pre-fills the form
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["shipment-payment", shipmentId],
    queryFn: () => api.get(`/api/shipments/${shipmentId}/payment`).then(r => r.data.data),
    enabled: isOpen && !!shipmentId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (existing) {
      setPaymentType(existing.payment_type);
      setTransactionId(existing.transaction_id || "");
      setAmount(String(existing.amount));
      setNotes(existing.notes || "");
    } else if (shipment) {
      const suggested = shipment.charges?.grand_total ?? shipment.collectable_amount ?? "";
      setPaymentType("cash");
      setTransactionId("");
      setAmount(suggested ? String(suggested) : "");
      setNotes("");
    }
  }, [isOpen, existing, shipment]);

  const resetForm = () => {
    setPaymentType("cash");
    setTransactionId("");
    setAmount("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (payload) => api.post(`/api/shipments/${shipmentId}/payment`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["shipment-payment", shipmentId]);
      queryClient.invalidateQueries(["shipment", String(shipmentId)]);
      toast.success("Payment recorded successfully");
      onRecorded?.();
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record payment");
    },
  });

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (paymentType !== "cash" && !transactionId.trim()) {
      toast.error("Transaction ID is required for NEFT/UPI");
      return;
    }

    mutation.mutate({
      payment_type:   paymentType,
      transaction_id: paymentType === "cash" ? undefined : transactionId.trim(),
      amount:         Number(amount),
      notes:          notes || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {shipment?.awb_number && (
            <p className="text-sm text-gray-500 -mt-2">
              AWB <span className="font-mono font-medium text-gray-700">{shipment.awb_number}</span>
            </p>
          )}

          {existing && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
              <CheckCircle2 size={16} />
              A payment is already on record — saving will update it.
            </div>
          )}

          {loadingExisting ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <>
              {/* Payment type */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Payment Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentType(value)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-sm font-medium transition cursor-pointer
                        ${paymentType === value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID — only for NEFT/UPI */}
              {paymentType !== "cash" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UTR / Reference number"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || loadingExisting}
            className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-teal-700 to-teal-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition cursor-pointer"
          >
            {mutation.isPending && <Loader2 size={18} className="animate-spin" />}
            {mutation.isPending ? "Saving..." : existing ? "Update Payment" : "Record Payment"}
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