"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const table = searchParams.get("table");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full text-center space-y-4">
        <CheckCircle2 size={64} className="mx-auto text-green-500" />
        <h1 className="text-2xl font-bold text-zinc-800">Pesanan Masuk!</h1>
        <p className="text-zinc-500 text-sm">
          {method === "CASH"
            ? "Pesananmu sedang diproses. Silakan bayar di kasir."
            : "Pembayaran berhasil! Pesananmu sedang diproses."}
        </p>
        {orderId && (
          <div className="bg-zinc-50 rounded-xl p-3">
            <p className="text-xs text-zinc-400">Nomor Pesanan</p>
            <p className="font-bold text-zinc-700">#{orderId}</p>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-1">
          {orderId && (
            <button
              onClick={() => router.push(`/order-status/${orderId}`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-colors"
            >
              Pantau Status Pesanan
            </button>
          )}
          <button
            onClick={() => router.push(`/menu?table=${table ?? ""}`)}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-3 rounded-2xl transition-colors"
          >
            Pesan Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
