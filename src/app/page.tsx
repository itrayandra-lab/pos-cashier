import { ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="text-center space-y-4">
        <div className="bg-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <ShoppingBag size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-800">POS Cashier</h1>
        <p className="text-zinc-400 text-sm max-w-xs">
          Scan QR code di meja Anda untuk mulai memesan, atau akses dashboard
          admin.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <a
            href="/admin"
            className="bg-zinc-800 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-zinc-700 transition-colors"
          >
            Dashboard Admin
          </a>
        </div>
      </div>
    </div>
  );
}
