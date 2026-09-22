'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Trash2, Plus, Minus, User, MapPin, Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Header from '../../components/Header';
import { useCart } from '../../context/CartContext';
import { useVenue } from '../../context/VenueContext';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, subtotal, originalSubtotal, totalSavings, itemCount } = useCart();
  const { venue, tableNumber, setTableNumber, guestName, setGuestName } = useVenue();

  const [inputTable, setInputTable] = useState(tableNumber ? String(tableNumber) : '');
  const [inputName, setInputName] = useState(guestName || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (tableNumber) setInputTable(String(tableNumber));
    if (guestName) setInputName(guestName);
  }, [tableNumber, guestName]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedTable = parseInt(inputTable, 10);
    if (!parsedTable || parsedTable < 1 || parsedTable > 50) {
      setErrorMessage('Please specify your dining table number (e.g., Table 5).');
      return;
    }

    const finalGuestName = inputName.trim() || `Guest (Table ${parsedTable})`;

    if (!items.length) {
      setErrorMessage('Your cart is empty.');
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

      clearCart();
      router.push(`/order/${data.order._id}`);
    } catch (err) {
      console.error('Order error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F4F1EA]">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Navigation Back */}
        <button
          onClick={() => router.push(`/menu?venue=${venue}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A958C] hover:text-[#F5D67D] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </button>

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#F4F1EA]">
              Review Your Order
            </h1>
            <p className="text-xs text-[#9A958C] mt-0.5">
              {venue === 'cafe' ? "The Royal's Cafe" : "The Royal's Restaurant"} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="p-4 rounded-full bg-white/5 inline-flex mb-3 text-[#D4AF37]">
              <ChefHat size={32} />
            </div>
            <h3 className="font-serif text-lg font-bold">Your cart is empty</h3>
            <p className="text-xs text-[#9A958C] mt-1">
              Add some of our handcrafted delicacies to begin your royal feast.
            </p>
            <button
              onClick={() => router.push(`/menu?venue=${venue}`)}
              className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs shadow-md"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Item list */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menuItem}
                  className="p-4 rounded-2xl bg-[#141418] border border-white/5 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
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

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1F1F24] border border-white/10">
                      <button
                        onClick={() => updateQty(item.menuItem, item.qty - 1)}
                        className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-xs text-[#F5D67D] min-w-[16px] text-center font-serif">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.menuItem, item.qty + 1)}
                        className="w-7 h-7 rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black active:scale-90"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.menuItem)}
                      className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table & Guest Information */}
            <div className="p-5 rounded-2xl bg-[#16161B] border border-[#D4AF37]/25 space-y-4 shadow-xl">
              <h3 className="font-serif text-sm font-bold text-[#F5D67D] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={15} />
                <span>Table & Guest Confirmation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Table Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#9A958C] mb-1">
                    Table Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#D4AF37]" />
                    <input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="e.g. 5"
                      value={inputTable}
                      onChange={(e) => setInputTable(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#0F0F12] border border-white/10 focus:border-[#D4AF37] text-white text-sm outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Guest Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#9A958C] mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="e.g. Aditya (or leave blank)"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#0F0F12] border border-white/10 focus:border-[#D4AF37] text-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Special Cooking Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#9A958C] mb-1">
                  Special Cooking Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra lemon wedges, no onion"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F12] border border-white/10 focus:border-[#D4AF37] text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-2 text-sm shadow-md">
              <div className="flex justify-between text-[#9A958C]">
                <span>Items Subtotal</span>
                <span>₹{originalSubtotal || subtotal}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Royal Special Discount</span>
                  <span>-₹{totalSavings}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-bold">
                <span className="text-base text-[#F4F1EA]">Total to Pay at Table</span>
                <span className="text-2xl font-serif text-[#F5D67D]">₹{subtotal}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl btn-gold text-base font-bold text-black shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Submitting Order to Waiter & Kitchen...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order · ₹{subtotal}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
