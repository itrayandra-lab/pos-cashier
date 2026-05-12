"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
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
        <button
          onClick={() =>
            router.push(`/menu?table=${searchParams.get("table") ?? ""}`)
          }
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-colors"
        >
          Pesan Lagi
        </button>
      </div>
    </div>
  );
}
