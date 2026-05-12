"use client";

import { useState } from "react";
import axios from "axios";
import { formatRupiah } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Banknote,
} from "lucide-react";

type Product = { id: number; name: string };
type OrderItem = {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
};
type Table = { id: number; number: number };

export type Order = {
  id: number;
  orderNumber: string;
  table: Table;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  paymentMethod: "CASH" | "QRIS" | "E_WALLET" | null;
  paymentStatus: "UNPAID" | "PAID" | "FAILED";
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  orderItems: OrderItem[];
};

type Props = {
  order: Order;
  onUpdate: (updated: Order) => void;
};

export default function OrderCard({ order, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateOrder = async (data: {
    status?: string;
    paymentStatus?: string;
  }) => {
    setLoading(true);
    try {
      const res = await axios.patch(`/api/admin/orders/${order.id}`, data);
      onUpdate(res.data.order);
    } catch (err) {
      console.error(err);
      alert("Gagal update pesanan");
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    return `${Math.floor(diff / 3600)} jam lalu`;
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 transition-colors ${
        order.status === "PENDING"
          ? "border-yellow-300"
          : order.status === "PROCESSING"
            ? "border-blue-300"
            : order.status === "COMPLETED"
              ? "border-green-200"
              : "border-zinc-200"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-zinc-800">
                Meja {order.table.number}
              </span>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{order.orderNumber}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-orange-500">
              {formatRupiah(order.totalAmount)}
            </p>
            <p className="text-xs text-zinc-400">{timeAgo(order.createdAt)}</p>
          </div>
        </div>

        {/* Metode Bayar */}
        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
          <Banknote size={12} />
          <span>
            {order.paymentMethod === "CASH"
              ? "Bayar di Kasir"
              : order.paymentMethod === "QRIS"
                ? "QRIS / E-Wallet"
                : "-"}
          </span>
        </div>

        {/* Catatan */}
        {order.notes && (
          <div className="mt-2 bg-yellow-50 rounded-lg px-3 py-1.5 text-xs text-yellow-700">
            📝 {order.notes}
          </div>
        )}

        {/* Toggle detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Sembunyikan" : `Lihat ${order.orderItems.length} item`}
        </button>
      </div>

      {/* Detail Items */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-1.5">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-zinc-600">
                {item.product.name}
                <span className="text-zinc-400 ml-1">x{item.quantity}</span>
              </span>
              <span className="font-medium text-zinc-700">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <div className="border-t px-4 py-3 flex gap-2 flex-wrap">
          {/* Proses pesanan */}
          {order.status === "PENDING" && (
            <button
              onClick={() => updateOrder({ status: "PROCESSING" })}
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
            >
              Proses Pesanan
            </button>
          )}

          {/* Tandai selesai */}
          {order.status === "PROCESSING" && (
            <button
              onClick={() => updateOrder({ status: "COMPLETED" })}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle size={14} />
              Selesai
            </button>
          )}

          {/* Konfirmasi bayar cash */}
          {order.paymentMethod === "CASH" &&
            order.paymentStatus === "UNPAID" && (
              <button
                onClick={() => updateOrder({ paymentStatus: "PAID" })}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <Banknote size={14} />
                Terima Pembayaran
              </button>
            )}

          {/* Batalkan */}
          <button
            onClick={() => updateOrder({ status: "CANCELLED" })}
            disabled={loading}
            className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-600 text-sm font-semibold py-2 px-3 rounded-xl transition-colors flex items-center gap-1"
          >
            <XCircle size={14} />
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
