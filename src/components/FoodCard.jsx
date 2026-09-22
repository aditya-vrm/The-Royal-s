'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ item }) {
  const { addItem, updateQty, getItemQty } = useCart();
  const [imageError, setImageError] = useState(false);
  const qty = getItemQty(item._id);

  const effectivePrice = item.discountPrice || item.price;
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  const fallbackImage =
    item.type === 'veg'
      ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#151518] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Top Media & Image Header */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#1E1E22]">
        {/* Next.js Optimized Image */}
        <Image
          src={imageError ? fallbackImage : (item.image || fallbackImage)}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => {
            if (!imageError) setImageError(true);
          }}
          priority={false}
        />

        {/* Ambient Dark Gradient on Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151518] via-transparent to-black/40 pointer-events-none" />

        {/* Veg / Non-Veg Indicator Dot */}
        <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          {item.type === 'veg' ? (
            <span className="indicator-veg" title="Vegetarian Dish" />
          ) : (
            <span className="indicator-nonveg" title="Non-Vegetarian Dish" />
          )}
        </div>

        {/* Chef Special Ribbon */}
        {item.isChefSpecial && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-[10px] font-bold shadow-md tracking-wider uppercase">
            <Sparkles size={11} className="stroke-[2.5]" />
            <span>Chef Special</span>
          </div>
        )}

        {/* Savings Ribbon */}
        {hasDiscount && (
          <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-bold text-emerald-400">
            SAVE ₹{item.price - item.discountPrice}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Dish Title */}
          <h3 className="font-serif text-base font-bold text-[#F4F1EA] group-hover:text-[#F5D67D] transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Dish Description */}
          {item.description && (
            <p className="text-xs text-[#9A958C] line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price and Cart Stepper Row */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-lg text-[#F5D67D]">
                ₹{effectivePrice}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-[#9A958C]/70">
                  ₹{item.price}
                </span>
              )}
            </div>
          </div>

          {/* Stepper / Add Button */}
          <div>
            {qty > 0 ? (
              <div className="flex items-center gap-2 p-1 rounded-full bg-[#202026] border border-[#D4AF37]/40 shadow-inner">
                <button
                  onClick={() => updateQty(item._id, qty - 1)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} className="stroke-[2.5]" />
                </button>
                <span className="font-serif font-bold text-sm text-[#F5D67D] min-w-[16px] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => updateQty(item._id, qty + 1)}
                  className="w-7 h-7 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black active:scale-90 transition-transform"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} className="stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(item)}
                className="flex items-center gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95 text-black font-sans font-bold text-xs shadow-[0_2px_12px_rgba(212,175,55,0.25)] active:scale-95 transition-all"
              >
                <Plus size={13} className="stroke-[2.5]" />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
