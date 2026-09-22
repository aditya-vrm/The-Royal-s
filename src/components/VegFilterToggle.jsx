'use client';
import React from 'react';

export default function VegFilterToggle({ currentFilter, onFilterChange }) {
  return (
    <div className="flex items-center justify-between gap-1 p-1 bg-[#141418] border border-[#D4AF37]/20 rounded-xl max-w-fit select-none">
      {/* All Option */}
      <button
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentFilter === 'all'
            ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-sm'
            : 'text-[#9A958C] hover:text-[#F4F1EA]'
        }`}
      >
        All
      </button>

      {/* Veg Option */}
      <button
        onClick={() => onFilterChange('veg')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentFilter === 'veg'
            ? 'bg-green-950/80 border border-green-500/50 text-green-400 shadow-sm'
            : 'text-[#9A958C] hover:text-green-400'
        }`}
      >
        <span className="indicator-veg" />
        <span>Veg</span>
      </button>

      {/* Non-Veg Option */}
      <button
        onClick={() => onFilterChange('non-veg')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          currentFilter === 'non-veg'
            ? 'bg-red-950/80 border border-red-500/50 text-red-400 shadow-sm'
            : 'text-[#9A958C] hover:text-red-400'
        }`}
      >
        <span className="indicator-nonveg" />
        <span>Non-Veg</span>
      </button>
    </div>
  );
}
