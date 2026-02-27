import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings2, RotateCcw, Save, Info } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const TOGGLE_GROUPS = [
  {
    label: "Shipper",
    fields: [
      { key: "show_shipper_details", label: "Shipper Details" },
      { key: "show_shipper_gst",     label: "Shipper GST Number" },
    ],
  },
  {
    label: "Consignee",
    fields: [
      { key: "show_consignee_details", label: "Consignee Details" },
      { key: "show_consignee_gst",     label: "Consignee GST Number" },
    ],
  },
  {
    label: "Shipment Info",
    fields: [
      { key: "show_parcel_dimensions",    label: "Parcel Dimensions" },
      { key: "show_special_instructions", label: "Special Instructions" },
    ],
  },
  {
    label: "Documents",
    fields: [
      { key: "show_invoice_details", label: "Invoice Details" },
      { key: "show_eway_bill",       label: "E-Way Bill Number" },
    ],
  },
  {
    label: "Charges",
    fields: [
      { key: "show_charges_breakdown", label: "Full Charges Breakdown" },
      { key: "show_grand_total_only",  label: "Grand Total Only (Total + GST)" },
    ],
  },
];

// Toggle switch component
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? "bg-teal-500" : "bg-gray-300"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
        ${checked ? "translate-x-6" : "translate-x-1"}
      `} />
    </button>
  );
}

// Confirm reset modal
function ConfirmResetModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Reset to Defaults?</h3>
        <p className="text-gray-500 text-sm mb-6">
          This will delete the custom print config for this customer. 
          All their shipments will use the default template going forward.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
          >
            {loading ? "Resetting..." : "Yes, Reset"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 py-2.5 rounded-lg hover:bg-gray-300 cursor-pointer transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrintConfigPanel({ customer }) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(null);
  const [savedConfig, setSavedConfig] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Only relevant for corporate customers
  if (customer?.customer_type !== "corporate") return null;

  const { data, isLoading } = useQuery({
    queryKey: ["print-config", customer.id],
    queryFn: () =>
      api.get(`/api/customers/${customer.id}/print-config`).then(res => res.data),
    staleTime: Infinity,
  });

  // Sync fetched data into local state
  useEffect(() => {
    if (!data) return;
    setConfig({ ...data.data });
    setSavedConfig({ ...data.data });
  }, [data]);

  const isDefault = data?.is_default ?? true;

  // Dirty check — has anything changed from what was last saved?
  const isDirty = config && savedConfig &&
    Object.keys(config).some(k => config[k] !== savedConfig[k]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      api.post(`/api/customers/${customer.id}/print-config`, payload),
    onSuccess: (res) => {
      toast.success("Print config saved!");
      setSavedConfig({ ...config });
      queryClient.invalidateQueries(["print-config", customer.id]);
    },
    onError: () => toast.error("Failed to save config"),
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      api.delete(`/api/customers/${customer.id}/print-config`),
    onSuccess: (res) => {
      toast.success("Reset to defaults");
      setConfirmReset(false);
      queryClient.invalidateQueries(["print-config", customer.id]);
    },
    onError: () => toast.error("Reset failed"),
  });

  const handleToggle = (key, value) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };

      // Dependency logic for charges section
      if (key === "show_grand_total_only" && value === true) {
        // Grand total only → force breakdown off
        next.show_charges_breakdown = false;
      }
      if (key === "show_charges_breakdown" && value === true) {
        // Full breakdown → force grand total only off
        next.show_grand_total_only = false;
      }
      if (key === "show_charges_breakdown" && value === false) {
        // If both are being turned off, that's fine — 
        // means charges section hidden entirely
      }

      // If shipper details hidden, GST also hidden
      if (key === "show_shipper_details" && value === false) {
        next.show_shipper_gst = false;
      }
      // If consignee details hidden, GST also hidden
      if (key === "show_consignee_details" && value === false) {
        next.show_consignee_gst = false;
      }
      // If invoice details hidden, eway bill also hidden
      if (key === "show_invoice_details" && value === false) {
        next.show_eway_bill = false;
      }

      return next;
    });
  };

  const isFieldDisabled = (key) => {
    if (!config) return false;
    // GST fields disabled if parent section is off
    if (key === "show_shipper_gst"   && !config.show_shipper_details)   return true;
    if (key === "show_consignee_gst" && !config.show_consignee_details) return true;
    if (key === "show_eway_bill"     && !config.show_invoice_details)   return true;
    // Charges mutual exclusion
    if (key === "show_grand_total_only"  && !config.show_charges_breakdown && !config.show_grand_total_only) return false;
    return false;
  };

  if (isLoading || !config) {
    return (
      <div className="border rounded-xl p-6 text-gray-400 text-sm">
        Loading print config...
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={20} />
            <span className="font-semibold">Print Configuration</span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium
            ${isDefault
              ? "bg-white/20 text-white"
              : "bg-yellow-300 text-yellow-900"
            }`}
          >
            {isDefault ? "Using Defaults" : "Custom Config"}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Info note */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>
              This config controls what fields appear on printed documents for this customer. 
              Individual shipments can still be overridden at print time.
            </p>
          </div>

          {/* Toggle groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOGGLE_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {group.label}
                </p>
                <div className="space-y-3">
                  {group.fields.map(field => (
                    <div key={field.key} className="flex items-center justify-between">
                      <label className={`text-sm ${isFieldDisabled(field.key) ? "text-gray-400" : "text-gray-700"}`}>
                        {field.label}
                      </label>
                      <Toggle
                        checked={!!config[field.key]}
                        onChange={(val) => handleToggle(field.key, val)}
                        disabled={isFieldDisabled(field.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t gap-4">
            <button
              onClick={() => setConfirmReset(true)}
              disabled={isDefault || resetMutation.isPending}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            <button
              onClick={() => saveMutation.mutate(config)}
              disabled={!isDirty || saveMutation.isPending}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Save size={16} />
              {saveMutation.isPending ? "Saving..." : "Save Config"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmResetModal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => resetMutation.mutate()}
        loading={resetMutation.isPending}
      />
    </>
  );
}