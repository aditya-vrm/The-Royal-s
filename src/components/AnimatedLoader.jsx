'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoyalCrestLogo from './RoyalCrestLogo';

export default function AnimatedLoader({ onComplete }) {
  const [stage, setStage] = useState('initial'); // 'initial' -> 'scaleUp' -> 'hold' -> 'dock' -> 'done'
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const t1 = setTimeout(() => setStage('scaleUp'), 40);
    const t2 = setTimeout(() => setStage('hold'), 550);
    const t3 = setTimeout(() => setStage('dock'), 1050);
    const t4 = setTimeout(() => {
      setStage('done');
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (stage === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0C]"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'dock' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ pointerEvents: stage === 'dock' ? 'none' : 'auto' }}
      >
        {/* Subtle background ambient radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
          }}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ scale: 0.65, opacity: 0, y: 20 }}
          animate={
            stage === 'scaleUp'
              ? { scale: 1.15, opacity: 1, y: 0 }
              : stage === 'hold'
              ? { scale: 1.1, opacity: 1, y: 0 }
              : stage === 'dock'
              ? { scale: 0.5, opacity: 0, y: -260 }
              : { scale: 0.65, opacity: 0, y: 20 }
          }
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 14,
            mass: 0.8,
          }}
        >
          <RoyalCrestLogo size="xl" showSubtitle={true} />

          <motion.div
            className="mt-6 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'hold' ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span
              className="text-xs uppercase font-medium tracking-widest text-[#9A958C]"
              style={{ letterSpacing: '0.25em' }}
            >
              Curating Royal Dining
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
