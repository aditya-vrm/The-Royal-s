'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVenue } from '../context/VenueContext';

export default function QRScannerModal({ isOpen, onClose }) {
  const scannerRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();
  const { setTableNumber } = useVenue();

  useEffect(() => {
    let html5QrCode = null;

    async function startScanner() {
      if (!isOpen) return;

      try {
        setErrorMsg('');
        setIsScanning(true);

        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader-target');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          (decodedText) => {
            console.log('QR Code detected:', decodedText);
            // Handle URL or token
            let token = decodedText;
            if (decodedText.includes('/table/')) {
              const parts = decodedText.split('/table/');
              token = parts[1]?.split('?')[0]?.split('#')[0];
            } else if (decodedText.includes('table=' || decodedText.includes('tbl_'))) {
              const match = decodedText.match(/tbl_\d+/);
              if (match) token = match[0];
            }

            if (token) {
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(() => {});
              }
              onClose();
              router.push(`/table/${token}`);
            }
          },
          (errorMessage) => {
            // Frame parse error (ignore)
          }
        );
      } catch (err) {
        console.warn('QR camera error:', err);
        setErrorMsg(
          'Camera access not available or blocked. You can pick your table below or enter the table number directly.'
        );
        setIsScanning(false);
      }
    }

    if (isOpen) {
      // Short delay to allow DOM modal mount
      const timeout = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timeout);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(() => {});
        }
      };
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-sm bg-[#141417] border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl overflow-hidden text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-[#D4AF37]" />
              <h2 className="font-serif text-lg font-bold text-[#F4F1EA]">Scan Table QR</h2>
            </div>
            <button
              onClick={() => {
                if (scannerRef.current && scannerRef.current.isScanning) {
                  scannerRef.current.stop().catch(() => {});
                }
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#9A958C] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scanner Viewport */}
          <div className="relative my-4 flex flex-col items-center justify-center min-h-[260px] bg-black/60 rounded-xl border border-dashed border-[#D4AF37]/30 overflow-hidden">
            <div id="qr-reader-target" className="w-full h-full overflow-hidden" />

            {errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#141417] text-left">
                <AlertCircle size={32} className="text-[#D4AF37] mb-2" />
                <p className="text-xs text-[#9A958C] text-center mb-4">{errorMsg}</p>

                {/* Quick table shortcuts */}
                <p className="text-[11px] font-semibold text-[#F5D67D] mb-2 text-center uppercase tracking-wider">
                  Select Table to Simulate Scan:
                </p>
                <div className="grid grid-cols-4 gap-2 w-full max-h-[120px] overflow-y-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        const pad = String(num).padStart(2, '0');
                        setTableNumber(num, `tbl_${pad}`);
                        onClose();
                        router.push(`/table/tbl_${pad}`);
                      }}
                      className="py-1.5 px-2 bg-white/5 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 rounded-lg text-xs font-serif text-[#F4F1EA] hover:text-[#F5D67D]"
                    >
                      Table {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-[#9A958C]">
            Point camera at the QR standee on your dining table.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
