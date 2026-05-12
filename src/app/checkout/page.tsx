"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, Banknote, Smartphone } from "lucide-react";
import axios from "axios";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const router = useRouter();

  const { items, getTotalPrice, clearCart, tableNumber } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("CASH");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const totalPrice = getTotalPrice();
  const table = tableNumber ?? (tableParam ? parseInt(tableParam) : null);

  // Fix: jangan panggil router.push di render, pakai useEffect
  useEffect(() => {
    if (items.length === 0) {
      setIsEmpty(true);
    }
  }, [items]);

  useEffect(() => {
    if (isEmpty) {
      router.push(`/menu?table=${table}`);
    }
  }, [isEmpty, router, table]);

  const handleOrder = async () => {
    if (!table || items.length === 0) return;
    setLoading(true);

    try {
      const res = await axios.post("/api/orders", {
        tableNumber: table,
        paymentMethod,
        notes,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      if (paymentMethod === "CASH") {
        clearCart();
        router.push(
          `/order-success?orderId=${res.data.order.id}&method=CASH&table=${table}`,
        );
      } else {
        // Midtrans Snap
        const snapToken = res.data.snapToken;
        // @ts-expect-error snap is loaded via CDN script
        window.snap.pay(snapToken, {
          onSuccess: () => {
            clearCart();
            router.push(
              `/order-success?orderId=${res.data.order.id}&method=QRIS&table=${table}`,
            );
          },
          onPending: () => {
            clearCart();
            router.push(
              `/order-success?orderId=${res.data.order.id}&method=QRIS&table=${table}`,
            );
          },
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            setLoading(false);
          },
        });
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  if (isEmpty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-full hover:bg-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg text-zinc-800">Konfirmasi Pesanan</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-zinc-700 mb-3">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-zinc-600">
                  {item.name}{" "}
                  <span className="text-zinc-400">x{item.quantity}</span>
                </span>
                <span className="font-medium text-zinc-800">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-500">{formatRupiah(totalPrice)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-zinc-700 mb-3">
            Metode Pembayaran
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === "CASH"
                  ? "border-orange-500 bg-orange-50"
                  : "border-zinc-200"
              }`}
            >
              <Banknote
                size={28}
                className={
                  paymentMethod === "CASH" ? "text-orange-500" : "text-zinc-400"
                }
              />
              <span
                className={`text-sm font-medium ${
                  paymentMethod === "CASH" ? "text-orange-500" : "text-zinc-600"
                }`}
              >
                Bayar di Kasir
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod("QRIS")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === "QRIS"
                  ? "border-orange-500 bg-orange-50"
                  : "border-zinc-200"
              }`}
            >
              <Smartphone
                size={28}
                className={
                  paymentMethod === "QRIS" ? "text-orange-500" : "text-zinc-400"
                }
              />
              <span
                className={`text-sm font-medium ${
                  paymentMethod === "QRIS" ? "text-orange-500" : "text-zinc-600"
                }`}
              >
                QRIS / E-Wallet
              </span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-zinc-700 mb-2">
            Catatan (opsional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: tidak pedas, tanpa bawang..."
            className="w-full border border-zinc-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={3}
          />
        </div>

        {/* Table Info */}
        <p className="text-center text-sm text-zinc-400">
          Meja <span className="font-semibold text-zinc-600">{table}</span>
        </p>

        {/* Submit */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-2xl transition-colors text-base"
        >
          {loading
            ? "Memproses..."
            : `Pesan Sekarang • ${formatRupiah(totalPrice)}`}
        </button>
      </div>
    </div>
  );
}
