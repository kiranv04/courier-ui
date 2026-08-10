import { CheckCircle2, Clock, Ban } from "lucide-react";

/**
 * At-a-glance payment status for a shipment row.
 * - Cash customer + payment recorded  -> Paid
 * - Cash customer + no payment yet    -> Unpaid
 * - Corporate customer                -> Billed Monthly (paid via batch invoicing, not per-shipment)
 */
export default function PaymentStatusBadge({ shipment }) {
  const isCorporate = shipment?.customer?.customer_type === "corporate";

  if (isCorporate) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Clock size={12} />
        Billed Monthly
      </span>
    );
  }

  if (shipment?.payment) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 size={12} />
        Paid
      </span>
    );
  }

  if (shipment?.status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <Ban size={12} />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <Clock size={12} />
      Unpaid
    </span>
  );
}