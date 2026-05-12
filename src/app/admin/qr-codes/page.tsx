"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

const TABLE_COUNT = 5;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default function QRCodesPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = (tableNumber: number) => {
    const svg = document.getElementById(`qr-table-${tableNumber}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-meja-${tableNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-4 py-4 sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="p-1 hover:bg-zinc-700 rounded-full"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-lg">QR Code Meja</h1>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Printer size={16} /> Print Semua
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6" ref={printRef}>
        <p className="text-zinc-500 text-sm mb-6 print:hidden">
          QR code ini mengarah ke halaman menu dengan nomor meja yang sesuai.
          Tempel di masing-masing meja.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3">
          {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map(
            (tableNumber) => {
              const url = `${BASE_URL}/menu?table=${tableNumber}`;
              return (
                <div
                  key={tableNumber}
                  className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center gap-4 print:shadow-none print:border print:border-zinc-200"
                >
                  {/* QR Code */}
                  <div className="bg-white p-3 rounded-2xl border border-zinc-100">
                    <QRCode
                      id={`qr-table-${tableNumber}`}
                      value={url}
                      size={160}
                      level="M"
                    />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className="bg-orange-500 text-white font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      {tableNumber}
                    </div>
                    <p className="font-bold text-zinc-800">
                      Meja {tableNumber}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 break-all">
                      {url}
                    </p>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={() => handleDownloadSVG(tableNumber)}
                    className="print:hidden flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Download size={12} /> Download SVG
                  </button>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #__next,
          #__next * {
            visibility: visible;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
