'use client';
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Coffee, Utensils, CheckCircle, ArrowRight } from 'lucide-react';
import RoyalCrestLogo from '../../../components/RoyalCrestLogo';
import { useVenue } from '../../../context/VenueContext';

export default function TableResolverPage({ params }) {
  const unwrappedParams = use(params);
  const qrToken = unwrappedParams.qrToken;
  const router = useRouter();
  const { setTableNumber, setVenue } = useVenue();

  const [table, setTable] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function resolveToken() {
      try {
        const res = await fetch(`/api/tables/${qrToken}`);
        const data = await res.json();
        if (data.success && data.table) {
          setTable(data.table);
          setTableNumber(data.table.number, data.table.qrToken);
          if (data.table.venue && data.table.venue !== 'both') {
            setVenue(data.table.venue);
          }
        } else {
          setError(data.error || 'Invalid or inactive Table QR code.');
        }
      } catch (err) {
        console.error('Resolve error:', err);
        setError('Failed to resolve dining table QR code.');
      } finally {
        setIsLoading(false);
      }
    }

    if (qrToken) {
      resolveToken();
    }
  }, [qrToken, setTableNumber, setVenue]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-[#F5D67D]">Connecting to Table...</p>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-sm rounded-3xl bg-[#141418] border border-red-500/30 p-6">
          <h2 className="font-serif text-xl font-bold text-red-400">QR Code Error</h2>
          <p className="text-xs text-[#9A958C] mt-2">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs"
          >
            Go to Home & Pick Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-[#141418] border border-[#D4AF37]/30 p-6 sm:p-8 shadow-2xl text-center"
      >
        <RoyalCrestLogo size="md" showSubtitle={true} />

        <div className="my-6 p-4 rounded-2xl bg-[#1C1C22] border border-[#D4AF37]/20 flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black font-bold">
            <MapPin size={22} className="stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-[#9A958C] font-semibold">
              Seated At Table
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#F5D67D] leading-none">
              Table #{table.number}
            </h2>
            <p className="text-xs text-white/70 mt-0.5">{table.section}</p>
          </div>
        </div>

        <p className="text-xs text-[#9A958C] mb-6 leading-relaxed">
          Your dining session is locked to Table #{table.number}. Choose your venue to begin ordering:
        </p>

        {/* Venue choices */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setVenue('cafe');
              router.push(`/menu?venue=cafe&table=${table.number}`);
            }}
            className="p-4 rounded-2xl bg-[#20150F] hover:bg-[#2A1810] border border-[#D4AF37]/30 hover:border-[#D4AF37] flex flex-col items-center gap-2 group transition-all"
          >
            <Coffee size={22} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span className="font-serif font-bold text-sm text-[#F4F1EA]">
              The Royal&apos;s Cafe
            </span>
            <span className="text-[10px] text-[#9A958C]">Brews, Dimsum, Pizzas</span>
          </button>

          <button
            onClick={() => {
              setVenue('restaurant');
              router.push(`/menu?venue=restaurant&table=${table.number}`);
            }}
            className="p-4 rounded-2xl bg-[#240B0B] hover:bg-[#3D0C0C] border border-[#D4AF37]/30 hover:border-[#D4AF37] flex flex-col items-center gap-2 group transition-all"
          >
            <Utensils size={22} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span className="font-serif font-bold text-sm text-[#F4F1EA]">
              The Royal&apos;s Dining
            </span>
            <span className="text-[10px] text-[#9A958C]">Biryani, Kebabs, Curries</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
