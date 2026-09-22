'use client';
import React, { useState, useEffect, useRef, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, UtensilsCrossed, Sparkles, MapPin, Loader2, Coffee, Utensils } from 'lucide-react';
import Header from '../../components/Header';
import CategoryChips from '../../components/CategoryChips';
import VegFilterToggle from '../../components/VegFilterToggle';
import FoodCard from '../../components/FoodCard';
import CartBottomBar from '../../components/CartBottomBar';
import CartDrawer from '../../components/CartDrawer';
import { useVenue } from '../../context/VenueContext';

const CHUNK_SIZE = 9;

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { venue, setVenue, tableNumber } = useVenue();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Progressive Chunk Loading (Instagram Reels style)
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const sentinelRef = useRef(null);

  // Sync venue from query param if available on load
  useEffect(() => {
    const urlVenue = searchParams.get('venue');
    if ((urlVenue === 'cafe' || urlVenue === 'restaurant') && urlVenue !== venue) {
      setVenue(urlVenue);
    }
  }, [searchParams]);

  const handleSwitchVenue = (newVenue) => {
    if (newVenue === venue) return;
    setVenue(newVenue);
    setActiveCategory(null);
    setSearchQuery('');
    setDebouncedSearch('');
    const currentTable = searchParams.get('table') || tableNumber;
    const newUrl = `/menu?venue=${newVenue}${currentTable ? `&table=${currentTable}` : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  // Debounce search query (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Menu data
  useEffect(() => {
    let isCancelled = false;
    async function fetchMenuData() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('venue', venue);
        if (activeCategory) params.set('category', activeCategory);
        if (vegFilter !== 'all') params.set('type', vegFilter);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await fetch(`/api/menu?${params.toString()}`);
        const data = await res.json();

        if (!isCancelled && data.success) {
          setCategories(data.categories || []);
          setItems(data.items || []);
          setVisibleCount(CHUNK_SIZE); // Reset pagination on data change
        }
      } catch (err) {
        console.error('Error loading menu:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchMenuData();

    return () => {
      isCancelled = true;
    };
  }, [venue, activeCategory, vegFilter, debouncedSearch]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, items.length));
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [items.length]);

  const venueTitle = venue === 'cafe' ? "The Royal's Cafe" : "The Royal's Restaurant";
  const venueTagline =
    venue === 'cafe'
      ? 'Cold Coffee, Momos, Pizza, Burgers & Quick Bites'
      : 'Authentic Indian Curries, Biryani & Chinese Specials';

  const visibleItems = items.slice(0, visibleCount);
  const hasMoreItems = visibleCount < items.length;

  return (
    <div
      className="min-h-screen pb-28 transition-colors duration-500"
      style={{
        backgroundColor: venue === 'cafe' ? '#0D0A08' : '#0E0808',
      }}
    >
      {/* Persistent Header */}
      <Header onOpenCart={() => setIsCartDrawerOpen(true)} />

      {/* Hero Venue Strip & Quick Switcher */}
      <div className="w-full border-b border-white/5 bg-gradient-to-b from-[#16120F] via-[#100C0A] to-transparent py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F4F1EA]">
              {venueTitle}
            </h1>
            <p className="text-xs text-[#9A958C]">{venueTagline}</p>
          </div>

          {/* Venue Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[#141418] border border-[#D4AF37]/30 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => handleSwitchVenue('cafe')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                venue === 'cafe'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-md'
                  : 'text-[#9A958C] hover:text-white'
              }`}
            >
              <Coffee size={13} />
              <span>The Royal&apos;s Cafe</span>
            </button>
            <button
              onClick={() => handleSwitchVenue('restaurant')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                venue === 'restaurant'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-md'
                  : 'text-[#9A958C] hover:text-white'
              }`}
            >
              <Utensils size={13} />
              <span>The Royal&apos;s Restaurant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Search and Category Filters */}
      <div className="sticky top-[49px] z-30 glass-panel border-x-0 py-2.5 px-4 shadow-md backdrop-blur-xl">
        <div className="max-w-6xl mx-auto space-y-2.5">
          {/* Search bar + Veg Filter in one responsive row */}
          <div className="flex items-center gap-2.5">
            {/* Debounced Search input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${venue === 'cafe' ? 'momos, cold coffee, burgers, pizza...' : 'biryani, paneer, tandoori, roti...'}`}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#18181D] border border-white/10 focus:border-[#D4AF37] text-white text-xs placeholder-[#9A958C]/70 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[#9A958C] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Veg / Non-Veg filter toggle */}
            <VegFilterToggle
              currentFilter={vegFilter}
              onFilterChange={(val) => {
                startTransition(() => {
                  setVegFilter(val);
                });
              }}
            />
          </div>

          {/* Category scrolling chips */}
          <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(id) => setActiveCategory(id)}
            totalItemsCount={items.length}
          />
        </div>
      </div>

      {/* Food Items Grid Section */}
      <main className="max-w-6xl mx-auto px-4 mt-4">
        {/* Results count bar */}
        <div className="flex items-center justify-between py-2 text-xs text-[#9A958C]">
          <span>
            Showing <strong className="text-[#F5D67D]">{visibleItems.length}</strong> of {items.length} dishes
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-[#D4AF37] hover:underline text-xs"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-[#151519] border border-white/5 p-4 flex flex-col justify-between skeleton"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="py-16 text-center max-w-sm mx-auto flex flex-col items-center">
            <div className="p-4 rounded-full bg-white/5 border border-[#D4AF37]/20 text-[#D4AF37] mb-3">
              <UtensilsCrossed size={32} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F4F1EA]">No Dishes Found</h3>
            <p className="text-xs text-[#9A958C] mt-1 leading-relaxed">
              We couldn&apos;t find any items matching your active search or diet filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setVegFilter('all');
                setActiveCategory(null);
              }}
              className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Progressive Food Grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
              {visibleItems.map((item) => (
                <FoodCard key={item._id} item={item} />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-10 flex items-center justify-center my-6">
              {hasMoreItems && (
                <div className="flex items-center gap-2 text-xs text-[#F5D67D]">
                  <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                  <span>Loading more dishes...</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer address */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center space-y-1.5 text-xs text-[#9A958C]">
          <p className="flex items-center justify-center gap-1.5 text-[#F5D67D] font-semibold">
            <MapPin size={13} className="text-[#D4AF37]" />
            <span>2nd Floor, K.R.Modi Mall, Gandhi Chowk, Barganda, Giridih, Jharkhand 815301</span>
          </p>
          <p className="text-[11px] text-[#9A958C]/70">
            The Royal&apos;s Cafe & Restaurant · Pure Luxury Dining
          </p>
        </div>
      </main>

      {/* Floating Bottom Cart Pill */}
      <CartBottomBar onOpenCart={() => setIsCartDrawerOpen(true)} />

      {/* Slide-up Cart Review Sheet */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
          <div className="text-center">
            <span className="font-serif text-[#F5D67D] text-lg font-bold">
              Loading The Royal&apos;s Menu...
            </span>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
