'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import { useCart } from '../context/CartContext';
import TableSelectorModal from './TableSelectorModal';

export default function Header({ onOpenCart }) {
  const router = useRouter();
  const { venue, setVenue, tableNumber } = useVenue();
  const { itemCount } = useCart();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header px-4 py-2.5 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] bg-black flex-shrink-0">
              <Image
                src="/images/royal-logo.jpg"
                alt="The Royal's Logo"
                fill
                className="object-cover scale-110"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-serif font-black text-xs sm:text-sm uppercase tracking-widest text-[#F5D67D] group-hover:text-white transition-colors leading-none"
                style={{ letterSpacing: '0.18em' }}
              >
                THE ROYAL&apos;S
              </span>
              <span className="text-[8.5px] uppercase tracking-widest text-[#9A958C] mt-0.5 font-semibold">
                {venue === 'cafe' ? 'Cafe Lounge' : 'Royal Dining'}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Table Number Pill */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#18181D] hover:bg-[#222228] border border-[#D4AF37]/30 text-xs font-semibold text-[#F5D67D] transition-all"
              title="Select or Change Table"
            >
              <MapPin size={13} className="text-[#D4AF37]" />
              <span>{tableNumber ? `Table ${tableNumber}` : 'Table'}</span>
              <ChevronDown size={12} className="text-[#9A958C]" />
            </button>

            {/* Staff Portal Link */}
            <button
              onClick={() => router.push('/staff')}
              className="hidden sm:flex items-center gap-1 py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 text-xs font-medium text-[#9A958C] hover:text-white transition-colors"
              title="Staff Portal"
            >
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              <span>Staff</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart || (() => router.push('/cart'))}
              className="relative flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black hover:opacity-95 shadow-[0_0_15px_rgba(212,175,55,0.35)] transition-transform active:scale-95 gap-1.5"
              title="View Cart"
            >
              <ShoppingBag size={17} className="stroke-[2.2]" />
              <span className="hidden xs:inline text-xs font-bold">Cart</span>
              {itemCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-black text-[#F5D67D] font-bold text-[10px] ml-0.5">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </>
  );
}
