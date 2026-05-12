"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { formatRupiah } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: { name: string };
};

type Order = {
  id: number;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  paymentMethod: "CASH" | "QRIS" | "E_WALLET" | null;
  paymentStatus: "UNPAID" | "PAID" | "FAILED";
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  table: { number: number };
  orderItems: OrderItem[];
};

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    title: "Pesanan Diterima",
    desc: "Pesananmu sedang menunggu konfirmasi dari kasir.",
  },
  PROCESSING: {
    icon: ChefHat,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "Sedang Diproses",
    desc: "Pesananmu sedang disiapkan. Mohon tunggu sebentar ya! 🍳",
  },
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    title: "Pesanan Selesai",
    desc: "Pesananmu sudah siap! Selamat menikmati 😊",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    title: "Pesanan Dibatalkan",
    desc: "Pesananmu telah dibatalkan. Silakan hubungi kasir.",
  },
};

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchOrder = useCallback(async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      setOrder(res.data.order);
      setLastUpdate(new Date());
    } catch {
      // order not found
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Auto-refresh setiap 10 detik
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <RefreshCw size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle size={48} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-zinc-500">Pesanan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 pt-10 pb-6">
        <button
          onClick={() => router.push(`/menu?table=${order.table.number}`)}
          className="flex items-center gap-1 text-orange-100 text-sm mb-3"
        >
          <ArrowLeft size={16} /> Kembali ke Menu
        </button>
        <p className="text-orange-200 text-sm">Meja {order.table.number}</p>
        <h1 className="text-2xl font-bold">Status Pesanan</h1>
        <p className="text-orange-100 text-xs mt-1">{order.orderNumber}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div
          className={`rounded-2xl border-2 p-6 text-center ${config.bg} ${config.border}`}
        >
          <StatusIcon size={56} className={`mx-auto mb-3 ${config.color}`} />
          <h2 className={`text-xl font-bold ${config.color}`}>
            {config.title}
          </h2>
          <p className="text-zinc-600 text-sm mt-1">{config.desc}</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {(["PENDING", "PROCESSING", "COMPLETED"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    order.status === "CANCELLED"
                      ? "bg-zinc-200 text-zinc-400"
                      : order.status === s ||
                          (s === "PENDING" &&
                            ["PROCESSING", "COMPLETED"].includes(
                              order.status,
                            )) ||
                          (s === "PROCESSING" && order.status === "COMPLETED")
                        ? "bg-orange-500 text-white"
                        : "bg-zinc-200 text-zinc-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 ${
                      (s === "PENDING" &&
                        ["PROCESSING", "COMPLETED"].includes(order.status)) ||
                      (s === "PROCESSING" && order.status === "COMPLETED")
                        ? "bg-orange-500"
                        : "bg-zinc-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-400 mt-1 px-2">
            <span>Diterima</span>
            <span>Diproses</span>
            <span>Selesai</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-zinc-700 mb-3">Pembayaran</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500">
              {order.paymentMethod === "CASH"
                ? "Bayar di Kasir"
                : "QRIS / E-Wallet"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-700"
                  : order.paymentStatus === "FAILED"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
              }`}
            >
              {order.paymentStatus === "PAID"
                ? "✓ Lunas"
                : order.paymentStatus === "FAILED"
                  ? "✗ Gagal"
                  : "⏳ Belum Bayar"}
            </span>
          </div>
          {order.paymentMethod === "CASH" &&
            order.paymentStatus === "UNPAID" && (
              <p className="text-xs text-orange-600 mt-2 bg-orange-50 rounded-lg p-2">
                💰 Silakan bayar{" "}
                <strong>{formatRupiah(order.totalAmount)}</strong> di kasir
              </p>
            )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-zinc-700 mb-3">Detail Pesanan</h3>
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-zinc-600">
                  {item.product.name}
                  <span className="text-zinc-400 ml-1">x{item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-500">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
          {order.notes && (
            <p className="text-xs text-zinc-400 mt-2">📝 {order.notes}</p>
          )}
        </div>

        {/* Auto refresh info */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <RefreshCw size={12} />
          <span>
            Update otomatis • {lastUpdate.toLocaleTimeString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}
