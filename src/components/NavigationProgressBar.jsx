'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none overflow-hidden bg-black/40">
        <motion.div
          initial={{ x: '-100%', opacity: 1 }}
          animate={{ x: '0%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-full w-full bg-gradient-to-r from-[#B8860B] via-[#F5D67D] to-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.8)]"
        />
      </div>
    </AnimatePresence>
  );
}
