'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  ChefHat,
  Utensils,
  XCircle,
  LogOut,
  Bell,
  RefreshCw,
  QrCode,
  Printer,
  ChevronRight,
  Filter,
  Volume2,
  VolumeX,
} from 'lucide-react';
import RoyalCrestLogo from '../../components/RoyalCrestLogo';
import { useSocket } from '../../context/SocketContext';

export default function StaffDashboardPage() {
  const { socket } = useSocket();

  // Authentication state
  const [pin, setPin] = useState('');
  const [staffUser, setStaffUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'confirmed' | 'preparing' | 'served' | 'all'
  const [venueFilter, setVenueFilter] = useState('all'); // 'all' | 'cafe' | 'restaurant'
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Table QR modal state
  const [isTableManagerOpen, setIsTableManagerOpen] = useState(false);
  const [tableList, setTableList] = useState([]);
  const [selectedQrTable, setSelectedQrTable] = useState(null);

  // Audio tone synthesizer for new incoming orders
  const playAlertSound = () => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  };

  // Check saved staff session
  useEffect(() => {
    try {
      const savedStaff = localStorage.getItem('theroyals_staff_session');
      if (savedStaff) {
        setStaffUser(JSON.parse(savedStaff));
      }
    } catch (e) {}
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (venueFilter !== 'all') params.set('venue', venueFilter);

      const res = await fetch(`/api/staff/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (staffUser) {
      fetchOrders();
    }
  }, [staffUser, activeTab, venueFilter]);

  // Fetch tables for QR manager
  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch('/api/tables');
        const data = await res.json();
        if (data.success) {
          setTableList(data.tables || []);
        }
      } catch (e) {}
    }
    if (staffUser) loadTables();
  }, [staffUser]);

  // Real-time socket events for staff
  useEffect(() => {
    if (!socket || !staffUser) return;

    socket.emit('join:staff');

    const handleNewOrder = (newOrder) => {
      console.log('🔔 [Staff] Received new order:', newOrder.orderNumber);
      playAlertSound();
      setNewOrderAlert(newOrder);

      // Prepend or update in state
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);

      // Auto dismiss banner after 5s
      setTimeout(() => setNewOrderAlert(null), 6000);
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status', handleStatusUpdate);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status', handleStatusUpdate);
    };
  }, [socket, staffUser, audioEnabled]);

  // Handle PIN Login
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStaffUser(data.staff);
        localStorage.setItem('theroyals_staff_session', JSON.stringify(data.staff));
      } else {
        setLoginError(data.error || 'Invalid Staff PIN. Please check and try again.');
      }
    } catch (err) {
      setLoginError('Server connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setStaffUser(null);
    localStorage.removeItem('theroyals_staff_session');
    setPin('');
  };

  // Action: Confirm Order
  const handleConfirmOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/staff/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedBy: staffUser?.name || 'Staff' }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
      }
    } catch (err) {
      console.error('Error confirming order:', err);
    }
  };

  // Action: Update Order Status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/staff/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          confirmedBy: staffUser?.name || 'Staff',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // If not logged in, render the luxury PIN Keypad Login
  if (!staffUser) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-3xl bg-[#141418] border border-[#D4AF37]/30 p-6 shadow-2xl text-center"
        >
          <RoyalCrestLogo size="md" showSubtitle={true} />

          <div className="my-4">
            <h1 className="font-serif text-xl font-bold text-[#F4F1EA]">
              Staff & Waiter Portal
            </h1>
            <p className="text-xs text-[#9A958C] mt-1">
              Enter your 4-digit staff PIN to access the table order feed.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="• • • •"
                className="w-full text-center text-3xl font-mono tracking-[0.6em] py-3 rounded-2xl bg-[#0B0B0C] border border-white/10 focus:border-[#D4AF37] text-[#F5D67D] outline-none shadow-inner"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-950/60 p-2 rounded-xl border border-red-500/30">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || pin.length < 4}
              className="w-full py-3 px-6 rounded-xl btn-gold text-black font-bold text-sm shadow-lg disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F1EA] pb-12">
      {/* Top Staff Navbar */}
      <header className="sticky top-0 z-40 glass-header px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand / Staff Identity */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] bg-black flex-shrink-0">
              <img
                src="/images/royal-logo.jpg"
                alt="The Royal's Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#F5D67D] truncate">
                  Floor Portal
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono uppercase flex-shrink-0">
                  {staffUser.role}
                </span>
              </div>
              <p className="text-[11px] text-[#9A958C] truncate max-w-[100px] sm:max-w-none">
                {staffUser.name}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-1.5 sm:p-2 rounded-full border transition-colors flex-shrink-0 ${
                audioEnabled
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#F5D67D]'
                  : 'bg-white/5 border-white/10 text-[#9A958C]'
              }`}
              title={audioEnabled ? 'Mute Alert Chime' : 'Unmute Alert Chime'}
            >
              {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Table QR manager */}
            <button
              onClick={() => setIsTableManagerOpen(true)}
              className="flex items-center gap-1 py-1.5 px-2 sm:px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 text-xs font-semibold text-[#F5D67D] transition-colors flex-shrink-0"
              title="Table QR Codes"
            >
              <QrCode size={13} />
              <span className="hidden sm:inline">QRs</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchOrders}
              className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-colors flex-shrink-0"
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={isLoadingOrders ? 'animate-spin' : ''} />
            </button>

            {/* Prominent Red Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 rounded-full bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white transition-all text-xs font-bold active:scale-95 shadow-sm flex-shrink-0"
              title="Logout"
            >
              <LogOut size={13} />
              <span className="text-[11px] sm:text-xs">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Banner for incoming new order */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="sticky top-[60px] z-50 max-w-xl mx-auto px-4 mt-2"
          >
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-2">
                <Bell size={20} className="animate-bounce" />
                <div>
                  <p className="text-sm font-serif">
                    NEW ORDER from Table #{newOrderAlert.table}!
                  </p>
                  <p className="text-xs font-sans font-medium text-black/80">
                    {newOrderAlert.guestName} · {newOrderAlert.items?.length} items · ₹{newOrderAlert.total}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleConfirmOrder(newOrderAlert._id);
                  setNewOrderAlert(null);
                }}
                className="py-1.5 px-3 rounded-xl bg-black text-[#F5D67D] text-xs font-bold uppercase tracking-wider"
              >
                1-Tap Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { key: 'pending', label: 'Pending Approval', count: pendingCount, pulse: true },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'preparing', label: 'Cooking' },
              { key: 'served', label: 'Served' },
              { key: 'all', label: 'All Orders' },
            ].map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-[#18181D] text-[#9A958C] hover:text-white border border-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-black text-[#F5D67D]' : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Venue Segment Filter */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#141418] border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setVenueFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                venueFilter === 'all' ? 'bg-white/15 text-white' : 'text-[#9A958C]'
              }`}
            >
              All Venues
            </button>
            <button
              onClick={() => setVenueFilter('cafe')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                venueFilter === 'cafe' ? 'bg-[#2A1810] text-[#F5D67D] border border-[#D4AF37]/30' : 'text-[#9A958C]'
              }`}
            >
              Cafe
            </button>
            <button
              onClick={() => setVenueFilter('restaurant')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                venueFilter === 'restaurant' ? 'bg-[#3D0C0C] text-[#F5D67D] border border-[#D4AF37]/30' : 'text-[#9A958C]'
              }`}
            >
              Restaurant
            </button>
          </div>
        </div>

        {/* Orders Feed */}
        {isLoadingOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-[#16161B] skeleton" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle size={40} className="text-[#D4AF37] mx-auto mb-2 opacity-50" />
            <h3 className="font-serif text-lg font-bold text-[#F4F1EA]">No Orders in This Queue</h3>
            <p className="text-xs text-[#9A958C] mt-1">
              New table orders will appear here in real-time as guests place them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {orders.map((order) => {
              const isPending = order.status === 'pending';
              const isConfirmed = order.status === 'confirmed';
              const isPreparing = order.status === 'preparing';
              const isServed = order.status === 'served';

              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl bg-[#141418] border p-5 flex flex-col justify-between shadow-xl transition-all ${
                    isPending
                      ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-gradient-to-b from-[#1C1810] to-[#141418]'
                      : 'border-white/10'
                  }`}
                >
                  {/* Card Top */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-2xl font-bold text-[#F5D67D]">
                            Table #{order.table}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.venue === 'cafe'
                                ? 'bg-[#2A1810] text-[#F5D67D] border border-[#D4AF37]/30'
                                : 'bg-[#3D0C0C] text-[#F5D67D] border border-red-500/30'
                            }`}
                          >
                            {order.venue}
                          </span>
                        </div>
                        <p className="text-xs text-[#F4F1EA] font-semibold mt-0.5">
                          Guest: {order.guestName}
                        </p>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                            : isConfirmed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isPreparing
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                            : isServed
                            ? 'bg-emerald-900/60 text-emerald-200'
                            : 'bg-red-950 text-red-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="py-3 divide-y divide-white/5 space-y-1.5 max-h-[180px] overflow-y-auto pr-1 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="pt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={item.type === 'veg' ? 'indicator-veg' : 'indicator-nonveg'} />
                            <span className="text-[#F4F1EA] font-medium">
                              <strong>{item.qty}×</strong> {item.name}
                            </span>
                          </div>
                          <span className="font-mono text-[#F5D67D]">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions Note */}
                    {order.specialInstructions && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-200">
                        <strong>Note:</strong> {order.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-[#9A958C] mb-3">
                      <span>Total: <strong className="text-white font-serif text-sm">₹{order.total}</strong></span>
                      <span className="font-mono">{order.orderNumber}</span>
                    </div>

                    {/* Action Flow Stepper */}
                    {isPending && (
                      <button
                        onClick={() => handleConfirmOrder(order._id)}
                        className="w-full py-2.5 px-4 rounded-xl btn-gold text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={15} />
                        <span>Confirm Order</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'preparing')}
                        className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <ChefHat size={15} />
                        <span>Send to Kitchen (Cooking)</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'served')}
                        className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Utensils size={15} />
                        <span>Mark Dishes Served</span>
                      </button>
                    )}

                    {isServed && (
                      <div className="text-center py-1 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle size={14} />
                        <span>Completed & Served</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Table QR Generator & Manager Modal */}
      {isTableManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#141418] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#F4F1EA]">
                  Dining Tables & QR Standees
                </h2>
                <p className="text-xs text-[#9A958C]">
                  Tables 1–20 active in database. Click any table to view or test its QR link.
                </p>
              </div>
              <button
                onClick={() => setIsTableManagerOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 overflow-y-auto flex-1 p-1">
              {tableList.map((t) => (
                <div
                  key={t.number}
                  onClick={() => setSelectedQrTable(t)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedQrTable?.number === t.number
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F5D67D]'
                      : 'bg-[#18181D] border-white/10 hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-lg">T-{t.number}</span>
                    <span className="text-[10px] font-mono text-[#9A958C]">{t.qrToken}</span>
                  </div>
                  <p className="text-[11px] text-[#9A958C] mt-1">{t.section}</p>
                </div>
              ))}
            </div>

            {selectedQrTable && (
              <div className="p-4 rounded-2xl bg-[#191920] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-serif font-bold text-lg text-[#F5D67D]">
                    Table #{selectedQrTable.number} ({selectedQrTable.section})
                  </p>
                  <p className="text-xs text-[#9A958C] font-mono">
                    Token: {selectedQrTable.qrToken}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    URL: /table/{selectedQrTable.qrToken}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/table/${selectedQrTable.qrToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs flex items-center gap-1.5"
                  >
                    <span>Launch Guest QR</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
