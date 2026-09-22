'use client';
import React, { useRef } from 'react';
import { Sparkles, Coffee, Utensils, Flame, Pizza, Sandwich, Salad, Cake, Fish, Soup, CookingPot, Wine } from 'lucide-react';

const ICON_MAP = {
  Sparkles: Sparkles,
  Coffee: Coffee,
  Utensils: Utensils,
  Flame: Flame,
  Pizza: Pizza,
  Sandwich: Sandwich,
  Salad: Salad,
  Cake: Cake,
  Fish: Fish,
  Soup: Soup,
  Bowl: CookingPot,
  Wine: Wine,
};

export default function CategoryChips({
  categories = [],
  activeCategory = null,
  onSelectCategory,
  totalItemsCount = 0,
}) {
  const scrollRef = useRef(null);

  return (
    <div className="w-full relative py-2.5">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 scroll-smooth"
      >
        {/* "All Items" Chip */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
            activeCategory === null
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-[1.02]'
              : 'bg-[#18181B] border border-white/10 text-[#9A958C] hover:text-[#F4F1EA] hover:border-[#D4AF37]/30'
          }`}
        >
          <Sparkles size={14} className={activeCategory === null ? 'text-black' : 'text-[#D4AF37]'} />
          <span>All Dishes</span>
          {totalItemsCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === null ? 'bg-black/20 text-black' : 'bg-white/10 text-[#9A958C]'
              }`}
            >
              {totalItemsCount}
            </span>
          )}
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => {
          const isSelected = activeCategory === cat._id;
          const IconComponent = ICON_MAP[cat.icon] || Utensils;

          return (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat._id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-[1.02]'
                  : 'bg-[#18181B] border border-white/10 text-[#9A958C] hover:text-[#F4F1EA] hover:border-[#D4AF37]/30'
              }`}
            >
              <IconComponent size={14} className={isSelected ? 'text-black' : 'text-[#D4AF37]'} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
