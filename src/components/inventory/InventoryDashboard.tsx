import React, { useMemo } from 'react';
import { Search, Package, PlusCircle, Filter } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { StockItemCard } from './StockItemCard';

export const InventoryDashboard: React.FC = () => {
  const {
    items,
    searchQuery,
    selectedCategory,
    selectedBrand,
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
    updateStockDelta,
  } = useInventoryStore();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.variant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storage_rack.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.compatible_models?.some(
          (m) =>
            m.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesBrand =
        selectedBrand === 'ALL' ||
        item.compatible_models?.some((m) => m.brand_name === selectedBrand);

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [items, searchQuery, selectedCategory, selectedBrand]);

  const totalUnits = useMemo(
    () => items.reduce((acc, curr) => acc + curr.current_stock, 0),
    [items]
  );
  
  const totalValuation = useMemo(
    () => items.reduce((acc, curr) => acc + curr.current_stock * curr.selling_price, 0),
    [items]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Total Catalog Items</span>
          <span className="text-xl font-bold text-white">{items.length} SKUs</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Total Available Stock</span>
          <span className="text-xl font-bold text-indigo-400">{totalUnits} units</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Retail Valuation</span>
          <span className="text-xl font-bold text-emerald-400">₹{totalValuation.toLocaleString()}</span>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Low Stock SKUs</span>
          <span className="text-xl font-bold text-red-400">
            {items.filter((i) => i.current_stock <= i.min_alert_threshold).length}
          </span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by device, SKU, variant or rack location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Categories', value: 'ALL' },
            { label: 'Cases', value: 'PHONE_CASE' },
            { label: 'Tempered Glass', value: 'TEMPERED_GLASS' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedCategory(tab.value)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === tab.value
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item List Container */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
            <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No matching accessories found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <StockItemCard
              key={item.id}
              item={item}
              onStockChange={updateStockDelta}
            />
          ))
        )}
      </div>
    </div>
  );
};
