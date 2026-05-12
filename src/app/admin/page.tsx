"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import OrderCard, { Order } from "@/components/admin/OrderCard";
import {
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

type FilterStatus =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filter === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${filter}`;
      const res = await axios.get(url);
      setOrders(res.data.orders);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdate = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Statistik ringkas
  const stats = {
    pending: orders.filter((o) => o.status === "PENDING").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    revenue: orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "PENDING", label: "Menunggu" },
    { key: "PROCESSING", label: "Diproses" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} className="text-orange-400" />
            <h1 className="font-bold text-lg">Dashboard Kasir</h1>
          </div>
          <div className="flex items-center gap-3">
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
              <span className="text-xs text-zinc-500">Selesai</span>
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

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                filter === tab.key
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {tab.label}
              {tab.key === "PENDING" && stats.pending > 0 && (
                <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full px-1.5">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
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
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <ShoppingBag size={48} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-medium">Belum ada pesanan</p>
            <p className="text-sm mt-1">
              Pesanan baru akan muncul di sini secara otomatis
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        {/* Auto refresh info */}
        <p className="text-center text-xs text-zinc-400 pb-4">
          Auto-refresh setiap 30 detik
        </p>
      </div>
    </div>
  );
}
