'use client';
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, Sparkles, AlertCircle, Utensils, ArrowRight, ShieldCheck, MapPin, User, Receipt } from 'lucide-react';
import Header from '../../../components/Header';
import { useSocket } from '../../../context/SocketContext';

const STATUS_CONFIG = {
  pending: {
    label: 'Order Transmitted',
    headline: 'Awaiting Staff Confirmation',
    subtext: 'Your order has been sent to our dining team. A server is reviewing your table order now.',
    color: '#D4AF37',
    badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Order Confirmed',
    headline: 'Order Confirmed — Being Prepared',
    subtext: 'Our team has verified your order. Dishes are now queued in the master kitchen.',
    color: '#22C55E',
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    icon: CheckCircle,
  },
  preparing: {
    label: 'In Kitchen',
    headline: 'Chefs are Cooking Your Feast',
    subtext: 'Fresh ingredients are simmering and sizzled over authentic spices and flame.',
    color: '#3B82F6',
    badgeBg: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
    icon: ChefHat,
  },
  served: {
    label: 'Dishes Served',
    headline: 'Served at Your Table — Bon Appétit!',
    subtext: 'Your dishes have arrived at your table. Please enjoy your royal feast.',
    color: '#10B981',
    badgeBg: 'bg-emerald-900/80 border-emerald-400 text-emerald-200',
    icon: Utensils,
  },
  cancelled: {
    label: 'Order Cancelled',
    headline: 'Order Was Cancelled',
    subtext: 'This order was cancelled. Please speak to our floor captain if you have questions.',
    color: '#EF4444',
    badgeBg: 'bg-red-950/70 border-red-500/40 text-red-300',
    icon: AlertCircle,
  },
};

export default function OrderStatusPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial order details
  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    if (!socket || !orderId) return;

    // Join rooms
    socket.emit('join:order', orderId);
    if (order?.table) {
      socket.emit('join:table', order.table);
    }

    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder && (updatedOrder._id === orderId || updatedOrder.id === orderId)) {
        console.log('⚡ [Live Update] Order status changed:', updatedOrder.status);
        setOrder(updatedOrder);
      }
    };

    socket.on('order:status', handleStatusUpdate);

    return () => {
      socket.off('order:status', handleStatusUpdate);
    };
  }, [socket, orderId, order?.table]);

  // Polling fallback every 6 seconds if socket is disconnected
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isConnected && orderId) {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          const data = await res.json();
          if (data.success) {
            setOrder(data.order);
          }
        } catch (e) {}
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isConnected, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mb-4" />
        <p className="font-serif text-lg font-bold text-[#F5D67D]">Loading Your Order Status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={48} className="text-red-400 mb-3" />
        <h2 className="font-serif text-xl font-bold text-white">{error || 'Order Not Found'}</h2>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs"
        >
          Return to The Royal&apos;s
        </button>
      </div>
    );
  }

  const currentConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = currentConfig.icon;

  const steps = [
    { key: 'pending', title: 'Received' },
    { key: 'confirmed', title: 'Confirmed' },
    { key: 'preparing', title: 'Cooking' },
    { key: 'served', title: 'Served' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'served': return 3;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F1EA] pb-16">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Status Card Banner */}
        <motion.div
          key={order.status}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-6 bg-gradient-to-b from-[#18181D] to-[#121215] border border-[#D4AF37]/30 shadow-2xl overflow-hidden text-center"
        >
          {/* Top pulse glow indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: currentConfig.color }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: currentConfig.color }}
              />
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentConfig.badgeBg}`}
            >
              {currentConfig.label}
            </span>
          </div>

          {/* Status Icon */}
          <div className="my-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-[#D4AF37]/30 shadow-inner">
            <Icon size={32} style={{ color: currentConfig.color }} />
          </div>

          {/* Headline & Subtext */}
          <h2 className="font-serif text-2xl font-bold text-[#F4F1EA]">
            {currentConfig.headline}
          </h2>
          <p className="text-xs text-[#9A958C] mt-2 max-w-sm mx-auto leading-relaxed">
            {currentConfig.subtext}
          </p>

          {/* Waiter confirmation stamp if confirmed */}
          {order.confirmedBy && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#F5D67D]">
              <ShieldCheck size={13} className="text-[#D4AF37]" />
              <span>Confirmed by Server: <strong>{order.confirmedBy}</strong></span>
            </div>
          )}

          {/* Status Timeline Stepper */}
          {order.status !== 'cancelled' && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between relative">
                {/* Connecting Track */}
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-white/10 -z-0" />
                <div
                  className="absolute left-6 top-3 h-0.5 bg-[#D4AF37] transition-all duration-700 -z-0"
                  style={{
                    width: `${(activeStepIdx / (steps.length - 1)) * 100}%`,
                  }}
                />

                {/* Steps */}
                {steps.map((step, idx) => {
                  const isDone = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                          isDone
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                            : 'bg-[#18181D] border-white/20 text-[#9A958C]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-semibold ${
                          isCurrent ? 'text-[#F5D67D]' : isDone ? 'text-white' : 'text-[#9A958C]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Details & Receipt */}
        <div className="mt-6 rounded-2xl bg-[#141417] border border-white/10 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-base text-[#F4F1EA]">
                Receipt Breakdown
              </h3>
            </div>
            <span className="font-mono text-xs text-[#F5D67D] font-bold">
              {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
            </span>
          </div>

          {/* Table & Guest info strip */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#1A1A20] text-xs">
            <div className="flex items-center gap-1.5 text-[#9A958C]">
              <MapPin size={13} className="text-[#D4AF37]" />
              <span>Table <strong>#{order.table}</strong> ({order.venue === 'cafe' ? 'Cafe' : 'Restaurant'})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#9A958C]">
              <User size={13} className="text-[#D4AF37]" />
              <span>Guest: <strong>{order.guestName}</strong></span>
            </div>
          </div>

          {/* Items itemized */}
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={item.type === 'veg' ? 'indicator-veg' : 'indicator-nonveg'} />
                  <span className="font-medium text-[#F4F1EA]">
                    {item.name} <span className="text-[#9A958C]">× {item.qty}</span>
                  </span>
                </div>
                <span className="font-serif font-bold text-[#F5D67D]">
                  ₹{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#9A958C]">Total Payable</span>
            <span className="font-serif text-xl font-bold text-[#F5D67D]">
              ₹{order.total || order.subtotal}
            </span>
          </div>

          {order.specialInstructions && (
            <div className="p-2.5 rounded-lg bg-white/5 text-[11px] text-[#9A958C]">
              <strong>Special Instructions:</strong> {order.specialInstructions}
            </div>
          )}

          {/* Official Location Address */}
          <div className="pt-3 border-t border-white/5 text-center text-[11px] text-[#9A958C]">
            <p className="text-[#F5D67D] font-medium">The Royal&apos;s Cafe & Restaurant</p>
            <p>2nd Floor, K.R.Modi Mall, Gandhi Chowk, Barganda, Giridih, Jharkhand 815301</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/menu?venue=${order.venue}&table=${order.table}`)}
            className="flex-1 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-xs font-bold text-[#F5D67D] flex items-center justify-center gap-2 transition-colors"
          >
            <span>Add More Items to Table</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </main>
    </div>
  );
}
