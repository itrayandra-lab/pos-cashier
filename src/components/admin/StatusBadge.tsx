type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "Diproses", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Selesai", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  UNPAID: { label: "Belum Bayar", className: "bg-orange-100 text-orange-700" },
  PAID: { label: "Lunas", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Gagal", className: "bg-red-100 text-red-700" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status];
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status];
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
