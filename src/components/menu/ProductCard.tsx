"use client";

import Image from "next/image";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isAvailable: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, increaseQty, decreaseQty } = useCartStore();
  const cartItem = items.find((i) => i.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full h-40 bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-300">
            <ShoppingCart size={40} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <h3 className="font-semibold text-zinc-800 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-zinc-400 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-bold text-orange-500 text-sm">
            {formatRupiah(product.price)}
          </span>

          {qty === 0 ? (
            <button
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 transition-colors"
            >
              <Plus size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => decreaseQty(product.id)}
                className="bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={() => increaseQty(product.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
