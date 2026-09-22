'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowLeft, Camera } from 'lucide-react';
import Header from '../../components/Header';
import QRScannerModal from '../../components/QRScannerModal';
import { useVenue } from '../../context/VenueContext';

export default function ScanPage() {
  const router = useRouter();
  const { setTableNumber } = useVenue();
  const [isScannerOpen, setIsScannerOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F1EA]">
      <Header />

      <main className="max-w-md mx-auto px-4 py-8 text-center">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A958C] hover:text-[#F5D67D] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Welcome</span>
        </button>

        <div className="p-6 rounded-3xl bg-[#141418] border border-[#D4AF37]/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Camera size={32} className="stroke-[2.2]" />
          </div>

          <h1 className="font-serif text-2xl font-bold text-[#F4F1EA]">
            Scan Table Standee QR
          </h1>
          <p className="text-xs text-[#9A958C] mt-2 leading-relaxed">
            Hold your smartphone camera steadily in front of the acrylic QR standee placed at your dining table.
          </p>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="mt-6 w-full py-3.5 px-6 rounded-2xl btn-gold text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            <span>Open Camera Scanner</span>
          </button>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-semibold text-[#F5D67D] uppercase tracking-wider mb-3">
              Or pick your table number directly:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    const pad = String(num).padStart(2, '0');
                    setTableNumber(num, `tbl_${pad}`);
                    router.push(`/table/tbl_${pad}`);
                  }}
                  className="py-2 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37] text-xs font-serif font-bold text-white transition-all"
                >
                  T-{num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
