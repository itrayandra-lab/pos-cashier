"use client";

import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatRupiah } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const {
    items,
    increaseQty,
    decreaseQty,
    removeItem,
    getTotalItems,
    getTotalPrice,
    tableNumber,
  } = useCartStore();
  const router = useRouter();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    setOpen(false);
    router.push(`/checkout?table=${tableNumber}`);
  };

  return (
    <>
      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 transition-all"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-semibold text-sm">Lihat Pesanan</span>
          <span className="font-bold text-sm">{formatRupiah(totalPrice)}</span>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-zinc-800">
              Keranjang Pesanan
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-zinc-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="overflow-y-auto flex-1 space-y-3 pr-1">
            {items.length === 0 ? (
              <p className="text-center text-zinc-400 py-8">Keranjang kosong</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-800">
                      {item.name}
                    </p>
                    <p className="text-orange-500 text-sm font-semibold">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="bg-zinc-100 hover:bg-zinc-200 rounded-full p-1 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex justify-between font-bold text-zinc-800">
                <span>Total</span>
                <span className="text-orange-500">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-colors"
              >
                Pesan Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
