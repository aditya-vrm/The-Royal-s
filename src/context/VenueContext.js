'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const VenueContext = createContext(null);

export function VenueProvider({ children }) {
  const [venue, setVenueState] = useState('cafe'); // 'cafe' | 'restaurant'
  const [tableNumber, setTableNumberState] = useState(null);
  const [qrToken, setQrTokenState] = useState(null);
  const [guestName, setGuestNameState] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // 1. Check URL parameters for table / venue if in browser
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTable = urlParams.get('table');
        const urlVenue = urlParams.get('venue');

        const savedVenue = localStorage.getItem('theroyals_venue');
        const savedTable = localStorage.getItem('theroyals_table');
        const savedQr = localStorage.getItem('theroyals_qr_token');
        const savedName = localStorage.getItem('theroyals_guest_name');

        if (urlVenue === 'cafe' || urlVenue === 'restaurant') {
          setVenueState(urlVenue);
          localStorage.setItem('theroyals_venue', urlVenue);
        } else if (savedVenue) {
          setVenueState(savedVenue);
        }

        if (urlTable) {
          const num = parseInt(urlTable, 10);
          if (!isNaN(num)) {
            setTableNumberState(num);
            localStorage.setItem('theroyals_table', String(num));
          }
        } else if (savedTable) {
          setTableNumberState(parseInt(savedTable, 10));
        }

        if (savedQr) setQrTokenState(savedQr);
        if (savedName) setGuestNameState(savedName);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setVenue = (newVenue) => {
    if (newVenue === 'cafe' || newVenue === 'restaurant') {
      setVenueState(newVenue);
      if (typeof window !== 'undefined') {
        localStorage.setItem('theroyals_venue', newVenue);
      }
    }
  };

  const setTableNumber = (num, token = null) => {
    const parsed = parseInt(num, 10);
    setTableNumberState(parsed || null);
    if (token) setQrTokenState(token);

    if (typeof window !== 'undefined') {
      if (parsed) localStorage.setItem('theroyals_table', String(parsed));
      else localStorage.removeItem('theroyals_table');

      if (token) localStorage.setItem('theroyals_qr_token', token);
    }
  };

  const setGuestName = (name) => {
    setGuestNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theroyals_guest_name', name);
    }
  };

  const themeTokens = {
    cafe: {
      key: 'cafe',
      name: "The Royal's Cafe",
      accentBg: '#2A1810',
      accentBorder: 'rgba(212, 175, 55, 0.25)',
      badgeTint: 'rgba(42, 24, 16, 0.9)',
      tagline: 'Cold Coffee, Momos, Pizza, Burgers & Quick Bites',
    },
    restaurant: {
      key: 'restaurant',
      name: "The Royal's Restaurant",
      accentBg: '#3D0C0C',
      accentBorder: 'rgba(245, 214, 125, 0.28)',
      badgeTint: 'rgba(61, 12, 12, 0.9)',
      tagline: 'Authentic Indian Curries, Biryani & Chinese Specials',
    },
  }[venue];

  return (
    <VenueContext.Provider
      value={{
        venue,
        setVenue,
        tableNumber,
        setTableNumber,
        qrToken,
        guestName,
        setGuestName,
        themeTokens,
        isLoaded,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const ctx = useContext(VenueContext);
  if (!ctx) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return ctx;
}
