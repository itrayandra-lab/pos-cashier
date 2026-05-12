"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import OrderCard, { Order } from "@/components/admin/OrderCard";
import {
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  QrCode,
  History,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type Tab = "active" | "history";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/orders");
      setOrders(res.data.orders);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdate = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Pisah pesanan aktif vs riwayat
  const activeOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING",
  );
  const historyOrders = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "CANCELLED",
  );

  const displayOrders = tab === "active" ? activeOrders : historyOrders;

  // Statistik
  const stats = {
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    revenue: orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-orange-400" />
            <h1 className="font-bold text-lg">Dashboard Kasir</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            >
              <Package size={14} /> Produk
            </Link>
            <Link
              href="/admin/qr-codes"
              className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            >
              <QrCode size={14} /> QR Code
            </Link>
            <span className="text-xs text-zinc-400">
              {lastRefresh.toLocaleTimeString("id-ID")}
            </span>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="p-2 rounded-full hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-yellow-500" />
              <span className="text-xs text-zinc-500">Menunggu</span>
            </div>
            <p className="text-2xl font-bold text-zinc-800">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw size={16} className="text-blue-500" />
              <span className="text-xs text-zinc-500">Diproses</span>
            </div>
            <p className="text-2xl font-bold text-zinc-800">
              {stats.processing}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-xs text-zinc-500">Selesai Hari Ini</span>
            </div>
            <p className="text-2xl font-bold text-zinc-800">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-orange-500" />
              <span className="text-xs text-zinc-500">Pendapatan</span>
            </div>
            <p className="text-lg font-bold text-orange-500">
              {formatRupiah(stats.revenue)}
            </p>
          </div>
        </div>

        {/* Tab: Aktif vs Riwayat */}
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "active"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <ShoppingBag size={15} />
            Pesanan Aktif
            {activeOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "history"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <History size={15} />
            Riwayat
            {historyOrders.length > 0 && (
              <span className="bg-zinc-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {historyOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-zinc-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            {tab === "active" ? (
              <>
                <ShoppingBag size={48} className="mx-auto mb-3 text-zinc-300" />
                <p className="font-medium">Tidak ada pesanan aktif</p>
                <p className="text-sm mt-1">
                  Pesanan baru akan muncul di sini secara otomatis
                </p>
              </>
            ) : (
              <>
                <History size={48} className="mx-auto mb-3 text-zinc-300" />
                <p className="font-medium">Belum ada riwayat pesanan</p>
                <p className="text-sm mt-1">
                  Pesanan yang selesai atau dibatalkan akan muncul di sini
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-zinc-400 pb-4">
          Auto-refresh setiap 30 detik
        </p>
      </div>
    </div>
  );
}
