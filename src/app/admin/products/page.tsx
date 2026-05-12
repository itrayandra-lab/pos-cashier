"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  category: Category;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  image: string;
  isAvailable: boolean;
  categoryId: string;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  image: "",
  isAvailable: true,
  categoryId: "",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const res = await axios.get("/api/admin/products");
    setProducts(res.data.products);
    setCategories(res.data.categories);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id.toString() ?? "" });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price.toString(),
      image: p.image ?? "",
      isAvailable: p.isAvailable,
      categoryId: p.category.id.toString(),
    });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post("/api/admin/upload", fd);
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      alert("Nama, harga, dan kategori wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        const res = await axios.patch(
          `/api/admin/products/${editProduct.id}`,
          form,
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === editProduct.id ? res.data.product : p)),
        );
      } else {
        const res = await axios.post("/api/admin/products", form);
        setProducts((prev) => [res.data.product, ...prev]);
      }
      setShowModal(false);
    } catch {
      alert("Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Gagal menghapus produk");
    }
  };

  const handleToggle = async (p: Product) => {
    try {
      const res = await axios.patch(`/api/admin/products/${p.id}`, {
        isAvailable: !p.isAvailable,
      });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? res.data.product : x)),
      );
    } catch {
      alert("Gagal update status");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="p-1 hover:bg-zinc-700 rounded-full"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-lg">Manajemen Produk</h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-zinc-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <ImageIcon size={48} className="mx-auto mb-3 text-zinc-300" />
            <p>Belum ada produk. Klik Tambah untuk mulai.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm flex overflow-hidden"
              >
                {/* Gambar */}
                <div className="relative w-24 h-24 shrink-0 bg-zinc-100 self-center ml-3 rounded-xl overflow-hidden">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-300">
                      <ImageIcon size={28} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-zinc-400">{p.category.name}</p>
                      <p className="text-orange-500 font-bold text-sm mt-0.5">
                        {formatRupiah(p.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(p)}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        {p.isAvailable ? (
                          <ToggleRight size={22} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={22} className="text-zinc-300" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {!p.isAvailable && (
                    <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Tidak tersedia
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">
                  {editProduct ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Upload Gambar */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Gambar Produk
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors"
                  >
                    {form.image ? (
                      <div className="relative w-full h-32">
                        <Image
                          src={form.image}
                          alt="preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-zinc-400 space-y-1">
                        <ImageIcon size={32} className="mx-auto" />
                        <p className="text-sm">
                          {uploading
                            ? "Mengupload..."
                            : "Klik untuk upload gambar"}
                        </p>
                        <p className="text-xs">JPG, PNG, WebP • Maks 2MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  {form.image && (
                    <button
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      className="text-xs text-red-400 mt-1"
                    >
                      Hapus gambar
                    </button>
                  )}
                </div>

                {/* Nama */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Nama Produk *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Contoh: Nasi Goreng Spesial"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Deskripsi singkat produk..."
                    rows={2}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Harga */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="15000"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">
                    Kategori *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, categoryId: e.target.value }))
                    }
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tersedia */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    Tersedia di Menu
                  </label>
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isAvailable ? "bg-green-500" : "bg-zinc-300"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAvailable ? "translate-x-7" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-3 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition-colors"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
