import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, FileText, Package, Truck, FileCheck, X } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatDateTime } from "../../utils/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// ── Toggle (same as PrintConfigPanel) ────────────────────────────────────────
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
      { key: "show_grand_total_only",  label: "Grand Total Only" },
    ],
  },
];

const SOURCE_LABELS = {
  override: { text: "Using shipment override",  style: "bg-yellow-100 text-yellow-800" },
  customer: { text: "Using customer config",    style: "bg-blue-100 text-blue-700" },
  default:  { text: "Using default template",   style: "bg-gray-100 text-gray-600" },
};

// ── Print Options Modal ───────────────────────────────────────────────────────
function PrintOptionsModal({ isOpen, onClose, shipmentId }) {
  const [config, setConfig] = useState(null);
  const [originalConfig, setOriginalConfig] = useState(null);
  const [source, setSource] = useState("default");

  // Fetch effective config when modal opens
  const { data, isLoading } = useQuery({
    queryKey: ["shipment-print-config", shipmentId],
    queryFn: () =>
      api.get(`/api/shipments/${shipmentId}/print-config`).then(res => res.data),
    enabled: isOpen && !!shipmentId,
    staleTime: 0, // Always re-fetch — config could have changed
  });

  useEffect(() => {
    if (!data) return;
    setConfig({ ...data.data });
    setOriginalConfig({ ...data.data });
    setSource(data.source);
  }, [data]);

  const isDirty = config && originalConfig &&
    Object.keys(config).some(k => config[k] !== originalConfig[k]);

  const overrideMutation = useMutation({
    mutationFn: (payload) =>
      api.post(`/api/shipments/${shipmentId}/print-override`, payload),
  });

  const handleToggle = (key, value) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      if (key === "show_grand_total_only" && value)   next.show_charges_breakdown = false;
      if (key === "show_charges_breakdown" && value)  next.show_grand_total_only = false;
      if (key === "show_shipper_details" && !value)   next.show_shipper_gst = false;
      if (key === "show_consignee_details" && !value) next.show_consignee_gst = false;
      if (key === "show_invoice_details" && !value)   next.show_eway_bill = false;
      return next;
    });
  };

  const isFieldDisabled = (key) => {
    if (!config) return false;
    if (key === "show_shipper_gst"   && !config.show_shipper_details)   return true;
    if (key === "show_consignee_gst" && !config.show_consignee_details) return true;
    if (key === "show_eway_bill"     && !config.show_invoice_details)   return true;
    return false;
  };

  const handlePrint = async () => {
    try {
      // Save override only if user changed something
      if (isDirty) {
        await overrideMutation.mutateAsync(config);
      }
      // Open PDF in new tab
      window.open(
        `${import.meta.env.VITE_BASE_URL}/api/shipments/${shipmentId}/pdf`,
        "_blank"
      );
      onClose();
    } catch {
      toast.error("Failed to save override");
    }
  };

  if (!isOpen) return null;

  const sourceInfo = SOURCE_LABELS[source] || SOURCE_LABELS.default;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Print Options</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Source badge */}
        <div className="mb-6">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${sourceInfo.style}`}>
            {sourceInfo.text}
          </span>
          {isDirty && (
            <span className="ml-2 text-xs px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
              Modified — will save as shipment override
            </span>
          )}
        </div>

        {isLoading || !config ? (
          <div className="py-12 text-center text-gray-400">Loading config...</div>
        ) : (
          <>
            {/* Toggle groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                          onChange={val => handleToggle(field.key, val)}
                          disabled={isFieldDisabled(field.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handlePrint}
                disabled={overrideMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-teal-600 to-green-500 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer transition"
              >
                <FileText size={18} />
                {overrideMutation.isPending ? "Saving..." : "Print"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  draft:            "bg-gray-100 text-gray-600",
  booked:           "bg-blue-100 text-blue-700",
  picked_up:        "bg-yellow-100 text-yellow-700",
  in_transit:       "bg-orange-100 text-orange-700",
  at_hub:           "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered:        "bg-green-100 text-green-700",
  exception:        "bg-red-100 text-red-700",
  cancelled:        "bg-red-200 text-red-800",
};

const EVENT_ICONS = {
  created:            "🏷️",
  booked:             "📦",
  picked_up:          "🚚",
  in_transit:         "🛣️",
  arrived_at_hub:     "🏭",
  dispatched_from_hub:"📤",
  out_for_delivery:   "🛵",
  delivered:          "✅",
  exception:          "⚠️",
  cancelled:          "❌",
};

function Section({ title, children }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-linear-to-r from-teal-700 to-teal-500 text-white px-6 py-3 font-semibold">
        {title}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function LabelValue({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

export default function ShipmentView() {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user } = useAuth();

  const role = user?.roles?.[0]?.name;
  const isSuperAdmin = role === "super-admin" || role === "admin";
  const isBranchAdmin = role === "branch-admin";

  const { data: shipment, isLoading } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => api.get(`/api/shipments/${id}`).then(res => res.data.data),
    staleTime: Infinity,
  });

  const handleBack = () => {
    if (isSuperAdmin) navigate("/superadmin/bookings");
    else navigate("/branch/bookings");
  };

  const handleEdit = () => {
    navigate(`/branch/shipments/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Loading shipment...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Shipment not found.
      </div>
    );
  }

  const charges = shipment.charges;
  const events  = shipment.events || [];

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-2xl mx-auto p-6 md:p-8 space-y-6">

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Bookings
        </button>
        <div className="flex items-center gap-3">
          {shipment.status === "draft" && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Edit size={18} />
              Edit Draft
            </button>
          )}
          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-teal-600 to-green-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <FileText size={18} />
            Print
          </button>
        </div>
      </div>

      {/* AWB Header */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">AWB Number</p>
          <h1 className="text-3xl font-bold font-mono tracking-wide text-gray-900">
            {shipment.awb_number}
          </h1>
          {shipment.branch && (
            <p className="text-sm text-gray-500 mt-1">Branch: {shipment.branch.name}</p>
          )}
        </div>
        <div className="text-right space-y-2">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[shipment.status]}`}>
            {shipment.status.replace(/_/g, " ").toUpperCase()}
          </span>
          <p className="text-xs text-gray-400 mt-4">
            {shipment.booked_at
              ? `Booked: ${formatDate(shipment.booked_at)}`
              : `Created: ${formatDateTime(shipment.created_at)}`
            }
          </p>
        </div>
      </div>

      {/* Shipper and Consignee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Shipper Details">
          <div className="space-y-3">
            <LabelValue label="Name"        value={shipment.shipper_name} />
            <LabelValue label="Company"     value={shipment.shipper_company} />
            <LabelValue label="Phone"       value={shipment.shipper_phone} />
            <LabelValue label="Email"       value={shipment.shipper_email} />
            <LabelValue label="GST"         value={shipment.shipper_gst} />
            <LabelValue label="Address"     value={[
              shipment.shipper_address_line1,
              shipment.shipper_address_line2,
              shipment.shipper_city,
              shipment.shipper_state,
              shipment.shipper_pincode,
            ].filter(Boolean).join(", ")} />
          </div>
        </Section>

        <Section title="Consignee Details">
          <div className="space-y-3">
            <LabelValue label="Name"    value={shipment.consignee_name} />
            <LabelValue label="Phone"   value={shipment.consignee_phone} />
            <LabelValue label="GST"     value={shipment.consignee_gst} />
            <LabelValue label="Address" value={[
              shipment.consignee_address,
              shipment.consignee_city,
              shipment.consignee_state,
              shipment.consignee_pincode,
            ].filter(Boolean).join(", ")} />
          </div>
        </Section>
      </div>

      {/* Service Details */}
      <Section title="Service Details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LabelValue label="Service Type"     value={shipment.service_type} />
          <LabelValue label="Service"          value={shipment.service} />
          <LabelValue label="Payment Mode"     value={shipment.payment_mode} />
          <LabelValue label="Customer Ref"     value={shipment.customer_ref} />
          <LabelValue label="Parcel Content"   value={shipment.parcel_content} />
          <LabelValue label="Customer Type"    value={shipment.customer_type?.toUpperCase()} />
          {shipment.in_favour_of && (
            <LabelValue label="In Favour Of"       value={shipment.in_favour_of} />
          )}
          {shipment.payable_at && (
            <LabelValue label="Payable At"         value={shipment.payable_at} />
          )}
          {shipment.collectable_amount && (
            <LabelValue label="Collectable Amount" value={`₹${shipment.collectable_amount}`} />
          )}
          {shipment.special_instructions && (
            <div className="col-span-2 md:col-span-4">
              <LabelValue label="Special Instructions" value={shipment.special_instructions} />
            </div>
          )}
        </div>
      </Section>

      {/* Parcels */}
      {shipment.parcels?.length > 0 && (
        <Section title={shipment.service === "Document" ? "Document Dimensions" : "Parcels"}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Length</th>
                  <th className="pb-2 pr-4">Width</th>
                  <th className="pb-2 pr-4">Height</th>
                  <th className="pb-2 pr-4">Weight (kg)</th>
                  <th className="pb-2 pr-4">Vol Weight (kg)</th>
                  {shipment.service === "Parcel" && (
                    <th className="pb-2">Boxes</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {shipment.parcels.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4">{p.length}</td>
                    <td className="py-2 pr-4">{p.width}</td>
                    <td className="py-2 pr-4">{p.height}</td>
                    <td className="py-2 pr-4">{p.weight}</td>
                    <td className="py-2 pr-4">{p.vol_weight}</td>
                    {shipment.service === "Parcel" && (
                      <td className="py-2">{p.num_boxes}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Invoices */}
      {shipment.invoices?.length > 0 && (
        <Section title="Invoices">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Invoice Number</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">E-Way Bill</th>
                </tr>
              </thead>
              <tbody>
                {shipment.invoices.map((inv, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4 font-mono">{inv.invoice_number}</td>
                    <td className="py-2 pr-4">₹{inv.invoice_amount}</td>
                    <td className="py-2">{inv.eway_bill || <span className="text-gray-400">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Charges */}
      {charges && (
        <Section title="Charges">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <LabelValue label="CFT"               value={charges.cft} />
            <LabelValue label="Chargeable Weight" value={`${charges.chargeable_weight} kg`} />
            <LabelValue label="Yield"             value={charges.package_yield} />
            <LabelValue label="Insurance"         value={charges.insurance_type === "carrier" ? "Carrier's Risk" : "Owner's Risk"} />
            <LabelValue label="Freight"           value={`₹${charges.freight}`} />
            <LabelValue label="Fuel"              value={`₹${charges.fuel}`} />
            <LabelValue label="AWB Fee"           value={`₹${charges.awb_fee}`} />
            <LabelValue label="FOV"               value={`₹${charges.fov}`} />
            <LabelValue label="FOD"               value={`₹${charges.fod}`} />
            <LabelValue label="DOD"               value={`₹${charges.dod}`} />
            <LabelValue label="ODA"               value={`₹${charges.oda}`} />
            <LabelValue label="Handling"          value={`₹${charges.handling}`} />
            <LabelValue label="DCC"               value={`₹${charges.dcc}`} />
            <LabelValue label="Pickup Charges"    value={`₹${charges.pickup_charges}`} />
            <LabelValue label="Delivery Charges"  value={`₹${charges.delivery_charges}`} />
            {charges.insurance_type === "carrier" && (
              <LabelValue label="Carrier Insurance" value={`₹${charges.carrier_insurance}`} />
            )}
          </div>
          <div className="border-t pt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₹{charges.total}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">GST @18%</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₹{charges.gst}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-green-700 mt-1">₹{charges.grand_total}</p>
            </div>
          </div>
        </Section>
      )}

      {/* Tracking Timeline */}
      <Section title="Tracking">
        {events.length === 0 ? (
          <p className="text-gray-400 text-sm">No tracking events yet.</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {events.map((event, i) => (
                <div key={event.id} className="flex items-start gap-4 relative">
                  {/* Icon bubble */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 z-10
                    ${i === 0 ? "bg-green-100 border-2 border-green-400" : "bg-gray-100 border-2 border-gray-300"}`}
                  >
                    {EVENT_ICONS[event.event_type] || "📍"}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-gray-900 capitalize">
                      {event.event_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {event.entity?.name || event.entity_type}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(event.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
      <PrintOptionsModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        shipmentId={id}
      />
    </div>
  );
}