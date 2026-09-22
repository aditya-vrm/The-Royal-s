'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coffee, Utensils, MapPin, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import RoyalCrestLogo from '../components/RoyalCrestLogo';
import AnimatedLoader from '../components/AnimatedLoader';
import TableSelectorModal from '../components/TableSelectorModal';
import { useVenue } from '../context/VenueContext';

export default function HomePage() {
  const router = useRouter();
  const { setVenue, tableNumber } = useVenue();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);

  const handleSelectVenue = (venueKey) => {
    setVenue(venueKey);
    router.push(`/menu?venue=${venueKey}${tableNumber ? `&table=${tableNumber}` : ''}`);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0C] flex flex-col justify-between relative overflow-hidden">
      {/* Opening Animated Loader */}
      {!loaderComplete && (
        <AnimatedLoader onComplete={() => setLoaderComplete(true)} />
      )}

      {/* Ambient background lighting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-4 py-4 max-w-6xl mx-auto flex items-center justify-between">
        {/* Table indicator */}
        <button
          onClick={() => setIsTableModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181D] hover:bg-[#222228] border border-[#D4AF37]/30 text-xs font-semibold text-[#F5D67D] transition-colors"
        >
          <MapPin size={13} className="text-[#D4AF37]" />
          <span>{tableNumber ? `Table #${tableNumber}` : 'Select Table'}</span>
        </button>

        {/* Right actions: Staff Login */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/staff')}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 text-xs font-medium text-[#9A958C] hover:text-white transition-colors"
          >
            <ShieldCheck size={14} className="text-[#D4AF37]" />
            <span>Staff Portal</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome & Brand Crest */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-4 sm:py-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <RoyalCrestLogo size="lg" showSubtitle={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 sm:mt-6"
        >
          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-wide text-[#F4F1EA]">
            Welcome to <span className="gold-text-gradient">The Royal&apos;s</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#9A958C] max-w-md mx-auto leading-relaxed">
            Choose Cafe or Restaurant to view the menu and order fresh food right to your table.
          </p>
        </motion.div>
      </section>

      {/* Venue Selection Cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-4 w-full flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {/* Card 1: The Royal's Cafe */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectVenue('cafe')}
            className="group relative cursor-pointer rounded-3xl overflow-hidden bg-[#16120F] border border-[#D4AF37]/25 hover:border-[#D4AF37] transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_rgba(42,24,16,0.8)] flex flex-col justify-between min-h-[300px] sm:min-h-[360px]"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
                alt="The Royal's Cafe"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-45 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D0A] via-[#120D0A]/70 to-transparent" />
            </div>

            {/* Top Badge */}
            <div className="relative z-10 p-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A1810]/90 border border-[#D4AF37]/40 text-[#F5D67D] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Coffee size={13} />
                <span>Cafe & Fast Food</span>
              </span>
              <span className="text-xs text-[#F5D67D] font-mono">
                {tableNumber ? `Table #${tableNumber}` : 'Dine-In'}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-5 sm:p-6">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F1EA] group-hover:text-[#F5D67D] transition-colors">
                The Royal&apos;s Cafe
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                Cold Coffee, Momos, Crispy Burgers, Cheese Pizzas, Sandwiches, Fries & Shakes.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D67D] group-hover:text-white transition-colors">
                <span>View Cafe Menu</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: The Royal's Restaurant */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectVenue('restaurant')}
            className="group relative cursor-pointer rounded-3xl overflow-hidden bg-[#180A0A] border border-[#D4AF37]/25 hover:border-[#D4AF37] transition-all duration-300 shadow-xl hover:shadow-[0_12px_40px_rgba(61,12,12,0.8)] flex flex-col justify-between min-h-[300px] sm:min-h-[360px]"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                alt="The Royal's Restaurant"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-45 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140808] via-[#140808]/70 to-transparent" />
            </div>

            {/* Top Badge */}
            <div className="relative z-10 p-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D0C0C]/90 border border-[#F5D67D]/40 text-[#F5D67D] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Utensils size={13} />
                <span>Family Restaurant</span>
              </span>
              <span className="text-xs text-[#F5D67D] font-mono">
                {tableNumber ? `Table #${tableNumber}` : 'Full Menu'}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-5 sm:p-6">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F1EA] group-hover:text-[#F5D67D] transition-colors">
                The Royal&apos;s Restaurant
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-[#9A958C] leading-relaxed">
                Paneer Butter Masala, Chicken Biryani, Tandoori Roti, Starters, Chinese & Indian Sweets.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D67D] group-hover:text-white transition-colors">
                <span>View Restaurant Menu</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer info & Official Address */}
      <footer className="relative z-10 max-w-4xl mx-auto px-4 py-6 text-center space-y-2 border-t border-white/5 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#9A958C]">
          <span className="flex items-center gap-1.5 text-[#F5D67D] font-semibold">
            <MapPin size={13} className="text-[#D4AF37]" />
            <span>2nd Floor, K.R.Modi Mall, Gandhi Chowk, Barganda, Giridih, Jharkhand 815301</span>
          </span>
        </div>
        <p className="text-[11px] text-[#9A958C]/70">
          The Royal&apos;s Cafe & Restaurant · Pure Luxury Dining Experience
        </p>
      </footer>

      {/* Modals */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </main>
  );
}
