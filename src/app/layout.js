import { Suspense } from 'react';
import './globals.css';
import { VenueProvider } from '../context/VenueContext';
import { CartProvider } from '../context/CartContext';
import { SocketProvider } from '../context/SocketContext';
import NavigationProgressBar from '../components/NavigationProgressBar';

export const metadata = {
  title: "The Royal's — Luxury QR Dine-In Ordering",
  description: "Experience royal culinary perfection. Scan, order from table, and indulge in gourmet delights at The Royal's Cafe & Restaurant.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0B0C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0B0B0C] text-[#F4F1EA] min-h-screen antialiased selection:bg-[#D4AF37] selection:text-black">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <SocketProvider>
          <VenueProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </VenueProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
