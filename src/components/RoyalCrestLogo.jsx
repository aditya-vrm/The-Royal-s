'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export default function RoyalCrestLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  venue = null, // 'cafe' | 'restaurant' | null
  showSubtitle = true,
  className = '',
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  const sizeConfig = {
    sm: {
      imgSize: 38,
      titleSize: 'text-xs',
      bannerSize: 'text-[8px]',
      gap: 'gap-1.5',
    },
    md: {
      imgSize: 56,
      titleSize: 'text-sm sm:text-base',
      bannerSize: 'text-[9px]',
      gap: 'gap-2',
    },
    lg: {
      imgSize: 84,
      titleSize: 'text-xl sm:text-2xl',
      bannerSize: 'text-[11px]',
      gap: 'gap-2.5',
    },
    xl: {
      imgSize: 130,
      titleSize: 'text-2xl sm:text-3xl',
      bannerSize: 'text-xs',
      gap: 'gap-3',
    },
  }[size] || {
    imgSize: 56,
    titleSize: 'text-base',
    bannerSize: 'text-[9px]',
    gap: 'gap-2',
  };

  const bannerText =
    venue === 'cafe'
      ? 'CAFE'
      : venue === 'restaurant'
      ? 'RESTAURANT'
      : 'CAFE & RESTAURANT';

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none text-center ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Official Trademark Lion & Crown Emblem */}
      <div className="relative group transition-transform duration-300 hover:scale-105">
        <div
          className="relative overflow-hidden rounded-full border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)] bg-black flex items-center justify-center"
          style={{
            width: sizeConfig.imgSize,
            height: sizeConfig.imgSize,
          }}
        >
          <Image
            src="/images/royal-logo.jpg"
            alt="The Royal's Trademark Lion Logo"
            width={sizeConfig.imgSize * 2}
            height={sizeConfig.imgSize * 2}
            className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-500"
            priority={size === 'xl' || size === 'lg'}
            onError={() => setImgError(true)}
          />
        </div>
      </div>

      {/* Trademark Brand Serif Wordmark & Banner */}
      <div className="mt-2 flex flex-col items-center">
        <h1
          className={`font-serif font-black tracking-widest uppercase ${sizeConfig.titleSize}`}
          style={{
            letterSpacing: '0.22em',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #FFF6D6 0%, #F5D67D 30%, #D4AF37 70%, #AA771C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          }}
        >
          THE ROYAL&apos;S
        </h1>

        {showSubtitle && (
          <div className="mt-1 flex items-center justify-center">
            <div
              className={`px-3 py-0.5 rounded-sm bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent border-y border-[#D4AF37]/50 font-serif font-bold tracking-[0.3em] uppercase text-[#F5D67D] ${sizeConfig.bannerSize}`}
            >
              — {bannerText} —
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
