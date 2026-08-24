import React from 'react';
import { Smartphone, Shield, Plus, Minus, AlertTriangle, MapPin, Tag } from 'lucide-react';
import { InventoryItem } from '../../types/database.types';

interface ItemCardProps {
  item: InventoryItem;
  onStockChange: (id: string, delta: number) => void;
  onOpenLabelPrinter?: (item: InventoryItem) => void;
}

export const StockItemCard: React.FC<ItemCardProps> = ({
  item,
  onStockChange,
  onOpenLabelPrinter,
}) => {
  const isLowStock = item.current_stock <= item.min_alert_threshold;
  const primaryModel = item.compatible_models?.find((m) => m.is_primary) || item.compatible_models?.[0];
  const sharedFits = item.compatible_models?.filter((m) => !m.is_primary) || [];

  return (
    <div
      className={`bg-zinc-900/80 border ${
        isLowStock ? 'border-red-900/60 bg-red-950/10' : 'border-zinc-800/80'
      } rounded-xl p-4 transition-all hover:border-zinc-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Category Icon */}
        <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-zinc-300 mt-1 sm:mt-0 flex-shrink-0">
          {item.category === 'PHONE_CASE' ? (
            <Smartphone className="w-5 h-5 text-indigo-400" />
          ) : (
            <Shield className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        {/* Item Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
              {primaryModel?.brand_name || 'Generic'}
            </span>
            <span className="text-xs font-semibold text-zinc-200">
              {primaryModel?.model_name}
            </span>
            {isLowStock && (
              <span className="flex items-center gap-1 text-[10px] bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-300 font-medium truncate mb-1">
            {item.variant_name}
          </p>

          {/* Shared Compatibility Chips */}
          {sharedFits.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-medium">Also fits:</span>
              {sharedFits.map((fit) => (
                <span
                  key={fit.model_id}
                  className="text-[9.5px] bg-zinc-800/90 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/40"
                >
                  {fit.model_name}
                </span>
              ))}
            </div>
          )}

          {/* Location & Pricing */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
            <span className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              <MapPin className="w-3 h-3 text-amber-400" />
              {item.storage_rack} • {item.storage_box}
            </span>
            <span className="text-emerald-400 font-bold">
              ₹{item.selling_price.toFixed(2)}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 font-mono text-[10px]">
              {item.barcode}
            </span>
          </div>
        </div>
      </div>

      {/* Stock Adjuster & Label Trigger */}
      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
        <div className="text-left sm:text-right">
          <span className="text-[10px] text-zinc-500 font-medium block uppercase tracking-wider">
            Available
          </span>
          <span
            className={`text-base font-extrabold ${
              isLowStock ? 'text-red-400' : 'text-zinc-100'
            }`}
          >
            {item.current_stock} <span className="text-xs font-normal text-zinc-500">pcs</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onStockChange(item.id, -1)}
              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
              title="Stock Out (-1)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-bold font-mono text-zinc-200">
              {item.current_stock}
            </span>
            <button
              onClick={() => onStockChange(item.id, 1)}
              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
              title="Stock In (+1)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {onOpenLabelPrinter && (
            <button
              onClick={() => onOpenLabelPrinter(item)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700/60 transition-colors"
              title="Print Thermal Label"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
