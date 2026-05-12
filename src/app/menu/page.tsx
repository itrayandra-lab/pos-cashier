"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/menu/ProductCard";
import CartDrawer from "@/components/menu/CartDrawer";
import { ShoppingBag } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isAvailable: boolean;
};

type Category = {
  id: number;
  name: string;
  products: Product[];
};

export default function MenuPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const tableNumber = tableParam ? parseInt(tableParam) : null;

  const { setTable } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tableNumber) setTable(tableNumber);
  }, [tableNumber, setTable]);

  useEffect(() => {
    axios.get("/api/products").then((res) => {
      setCategories(res.data.categories);
      if (res.data.categories.length > 0) {
        setActiveCategory(res.data.categories[0].id);
      }
      setLoading(false);
    });
  }, []);

  const activeProducts =
    categories.find((c) => c.id === activeCategory)?.products ?? [];

  if (!tableNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="text-center space-y-3">
          <ShoppingBag size={48} className="mx-auto text-zinc-300" />
          <h1 className="text-xl font-bold text-zinc-700">
            QR Code Tidak Valid
          </h1>
          <p className="text-zinc-400 text-sm">
            Silakan scan QR code di meja Anda untuk mulai memesan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-28">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 pt-10 pb-6">
        <p className="text-orange-200 text-sm">Selamat datang!</p>
        <h1 className="text-2xl font-bold">Meja {tableNumber}</h1>
        <p className="text-orange-100 text-sm mt-1">Pilih menu favoritmu 🍽️</p>
      </div>

      {/* Category Tabs */}
      {loading ? (
        <div className="px-4 pt-4 flex gap-2 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-zinc-200 rounded-full animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        <div className="px-4 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white"
                  : "bg-white text-zinc-600 border border-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-52 bg-zinc-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <ShoppingBag size={40} className="mx-auto mb-3 text-zinc-300" />
            <p>Belum ada produk di kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
