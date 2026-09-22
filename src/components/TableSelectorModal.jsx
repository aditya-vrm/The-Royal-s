'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useVenue } from '../context/VenueContext';

export default function TableSelectorModal({ isOpen, onClose, onOpenScanner }) {
  const { tableNumber, setTableNumber, venue } = useVenue();

  if (!isOpen) return null;

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-[#141417] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#F4F1EA]">Select Your Table</h2>
              <p className="text-xs text-[#9A958C] mt-0.5">
                Tables 1–8 (Cafe Lounge) · Tables 9–20 (Restaurant Hall)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#9A958C] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 my-5 max-h-[300px] overflow-y-auto pr-1">
            {tables.map((num) => {
              const isSelected = tableNumber === num;
              const isCafeSection = num <= 8;

              return (
                <button
                  key={num}
                  onClick={() => {
                    const pad = String(num).padStart(2, '0');
                    setTableNumber(num, `tbl_${pad}`);
                    onClose();
                  }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#D4AF37]/20 to-[#996515]/20 border-[#D4AF37] text-[#F5D67D] shadow-[0_0_15px_rgba(212,175,55,0.25)] scale-105'
                      : 'bg-[#1A1A1E] border-white/5 text-[#F4F1EA] hover:border-[#D4AF37]/40 hover:bg-[#222228]'
                  }`}
                >
                  <span className="text-xs text-[#9A958C] font-mono">T-</span>
                  <span className="text-lg font-bold font-serif">{num}</span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <Check size={10} className="text-black stroke-[3]" />
                    </div>
                  )}
                  <span className="text-[9px] text-[#9A958C] mt-0.5">
                    {isCafeSection ? 'Cafe' : 'Dine'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
