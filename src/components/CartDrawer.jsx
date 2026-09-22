'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ChefHat, User, MapPin, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useVenue } from '../context/VenueContext';

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, subtotal, originalSubtotal, totalSavings, itemCount } = useCart();
  const { venue, tableNumber, setTableNumber, guestName, setGuestName } = useVenue();

  const [inputTable, setInputTable] = useState(tableNumber ? String(tableNumber) : '');
  const [inputName, setInputName] = useState(guestName || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if venue context changes
  React.useEffect(() => {
    if (tableNumber) setInputTable(String(tableNumber));
    if (guestName) setInputName(guestName);
  }, [tableNumber, guestName]);

  if (!isOpen) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedTable = parseInt(inputTable, 10);
    if (!parsedTable || parsedTable < 1 || parsedTable > 50) {
      setErrorMessage('Please enter a valid table number (e.g., Table 5).');
      return;
    }

    const finalGuestName = inputName.trim() || `Guest (Table ${parsedTable})`;

    if (!items.length) {
      setErrorMessage('Your cart is empty. Please add items to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setTableNumber(parsedTable);
      if (inputName.trim()) setGuestName(inputName.trim());

      const payload = {
        table: parsedTable,
        venue,
        guestName: finalGuestName,
        specialInstructions: specialInstructions.trim(),
        items: items.map((item) => ({
          menuItem: item.menuItem,
          name: item.name,
          price: item.price,
          qty: item.qty,
          type: item.type,
          notes: item.notes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart and redirect to live order tracker
      clearCart();
      onClose();
      router.push(`/order/${data.order._id}`);
    } catch (err) {
      console.error('Order submit error:', err);
      setErrorMessage(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
        {/* Backdrop */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative z-10 w-full max-w-lg bg-[#141417] border-t sm:border border-[#D4AF37]/30 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#19191D]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black">
                <ChefHat size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F4F1EA]">
                  Your Royal Feast
                </h2>
                <p className="text-xs text-[#9A958C]">
                  {venue === 'cafe' ? "The Royal's Cafe" : "The Royal's Restaurant"} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#9A958C] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
            {/* Item List */}
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#9A958C] text-sm">Your cart is empty.</p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-2 rounded-full bg-white/10 text-xs font-semibold text-[#F5D67D]"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.menuItem}
                    className="p-3 rounded-xl bg-[#1A1A1F] border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span
                        className={item.type === 'veg' ? 'indicator-veg mt-1' : 'indicator-nonveg mt-1'}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#F4F1EA] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#F5D67D] font-serif font-bold">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#222228] border border-white/10">
                        <button
                          onClick={() => updateQty(item.menuItem, item.qty - 1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-xs active:scale-90"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-xs text-[#F5D67D] min-w-[14px] text-center font-serif">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.menuItem, item.qty + 1)}
                          className="w-6 h-6 rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black text-xs active:scale-90"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.menuItem)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guest Details Form */}
            {items.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#18181D] border border-[#D4AF37]/20 space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#F5D67D] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Table & Guest Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Table Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9A958C] mb-1">
                      Table Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-[#D4AF37]" />
                      <input
                        type="number"
                        min="1"
                        max="50"
                        placeholder="e.g. 5"
                        value={inputTable}
                        onChange={(e) => setInputTable(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111113] border border-white/10 focus:border-[#D4AF37] text-white text-sm outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Guest Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9A958C] mb-1">
                      Your Name (Optional)
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-[#D4AF37]" />
                      <input
                        type="text"
                        placeholder="e.g. Aditya (or leave blank)"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111113] border border-white/10 focus:border-[#D4AF37] text-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Cooking Instructions */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#9A958C] mb-1">
                    Special Cooking Requests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, extra lemon wedges, no onion"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111113] border border-white/10 focus:border-[#D4AF37] text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Bill Summary */}
            {items.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#17171B] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#9A958C]">
                  <span>Items Total ({itemCount})</span>
                  <span>₹{originalSubtotal || subtotal}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Royal Discount Savings</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-bold">
                  <span className="text-sm text-[#F4F1EA]">Total to Pay at Table</span>
                  <span className="text-lg font-serif text-[#F5D67D]">₹{subtotal}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#16161A]">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl btn-gold text-base font-bold text-black shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Transmitting to Captain & Kitchen...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send Order · ₹{subtotal}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-[#9A958C] mt-2">
                Dine-In Order · Pay your bill with our floor server after your meal
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
