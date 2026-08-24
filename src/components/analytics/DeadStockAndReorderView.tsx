import React, { useState, useMemo } from 'react';
import { AlertOctagon, Download, RefreshCw, Layers, ShieldAlert, ArrowRight } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { calculateReorderMatrix, analyzeDeadStock, exportSupplierOrderCSV } from '../../utils/stockAnalyticsEngine';

export const DeadStockAndReorderView: React.FC = () => {
  const { items } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'REORDER' | 'DEAD_STOCK'>('REORDER');

  const reorderList = useMemo(() => calculateReorderMatrix(items), [items]);
  const deadStockList = useMemo(() => analyzeDeadStock(items), [items]);

  const totalReorderCapital = useMemo(
    () => reorderList.reduce((acc, curr) => acc + curr.estimatedCost, 0),
    [reorderList]
  );

  const totalDeadCapital = useMemo(
    () => deadStockList.reduce((acc, curr) => acc + curr.lockedCapital, 0),
    [deadStockList]
  );

  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 md:p-6 rounded-2xl border border-zinc-900 max-w-6xl mx-auto">
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Stock Intelligence & Supplier Engine
          </h2>
          <p className="text-xs text-zinc-400">Manage low-stock purchases and identify stagnant warehouse capital</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('REORDER')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'REORDER' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Re-order Required ({reorderList.length})
          </button>
          <button
            onClick={() => setActiveTab('DEAD_STOCK')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'DEAD_STOCK' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dead Stock Diagnostics ({deadStockList.length})
          </button>
        </div>
      </div>

      {activeTab === 'REORDER' ? (
        /* REORDER VIEW */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl mb-4 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-indigo-400 uppercase block tracking-wider">Estimated Purchase Cost</span>
              <span className="text-2xl font-black text-white">₹{totalReorderCapital.toLocaleString()}</span>
            </div>
            <button
              onClick={() => exportSupplierOrderCSV(reorderList)}
              disabled={reorderList.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-950"
            >
              <Download className="w-4 h-4" /> Download Supplier CSV PO
            </button>
          </div>

          <div className="space-y-2">
            {reorderList.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">All accessory models are currently at healthy stock levels.</p>
              </div>
            ) : (
              reorderList.map(({ item, suggestedReorderUnits, estimatedCost, urgency }) => {
                const primaryModel = item.compatible_models?.find((m) => m.is_primary) || item.compatible_models?.[0];
                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/70 border border-zinc-800/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                          {primaryModel?.brand_name} • {primaryModel?.model_name}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                            urgency === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {urgency}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-200">{item.variant_name}</p>
                      <span className="text-[11px] text-zinc-500 font-mono">SKU: {item.barcode} | Rack: {item.storage_rack}</span>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Stock / Min</span>
                        <span className="text-xs font-mono font-bold text-red-400">{item.current_stock} / {item.min_alert_threshold}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Order Qty</span>
                        <span className="text-sm font-black text-indigo-400">+{suggestedReorderUnits} pcs</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Est. PO Value</span>
                        <span className="text-xs font-bold text-zinc-100">₹{estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* DEAD STOCK VIEW */
        <div>
          <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl mb-4 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase block tracking-wider">Locked Stagnant Capital</span>
              <span className="text-2xl font-black text-white">₹{totalDeadCapital.toLocaleString()}</span>
            </div>
            <span className="text-xs text-zinc-400 max-w-[240px] text-right">Accessories with no sales recorded for 30+ days</span>
          </div>

          <div className="space-y-2">
            {deadStockList.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No stagnant or dead inventory detected.</p>
              </div>
            ) : (
              deadStockList.map(({ item, daysWithoutSale, lockedCapital, agingTier }) => {
                const primaryModel = item.compatible_models?.find((m) => m.is_primary) || item.compatible_models?.[0];
                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900/70 border border-zinc-800/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                          {primaryModel?.brand_name} • {primaryModel?.model_name}
                        </span>
                        <span className="text-[9.5px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          {daysWithoutSale} Days Inactive
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-200">{item.variant_name}</p>
                      <span className="text-[11px] text-zinc-500">Rack: {item.storage_rack} • Box: {item.storage_box}</span>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Unsold Stock</span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{item.current_stock} units</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Blocked Cash</span>
                        <span className="text-sm font-black text-amber-400">₹{lockedCapital.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
