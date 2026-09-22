'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useVenue } from '../context/VenueContext';

export default function CartBottomBar({ onOpenCart }) {
  const { itemCount, subtotal } = useCart();
  const { tableNumber } = useVenue();

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center"
      >
        <button
          onClick={onOpenCart}
          className="pointer-events-auto w-full max-w-md flex items-center justify-between p-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D67D] to-[#D4AF37] text-black shadow-[0_10px_35px_rgba(212,175,55,0.45)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.6)] active:scale-[0.98] transition-all duration-200"
        >
          {/* Left info */}
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-black/15 text-black">
              <ShoppingBag size={20} className="stroke-[2.5]" />
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-black text-[#F5D67D] font-bold text-[10px]">
                {itemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="font-serif font-bold text-base leading-none text-black">
                ₹{subtotal}
              </p>
              <p className="text-[11px] font-semibold text-black/75 mt-0.5">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                {tableNumber ? ` · Table ${tableNumber}` : ''}
              </p>
            </div>
          </div>

          {/* Right action */}
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider bg-black text-[#F5D67D] px-3.5 py-2 rounded-xl shadow-inner">
            <span>View Cart</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
