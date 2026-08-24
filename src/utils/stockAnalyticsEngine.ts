import { InventoryItem } from '../types/database.types';

export interface ReorderRecommendation {
  item: InventoryItem;
  suggestedReorderUnits: number;
  estimatedCost: number;
  urgency: 'CRITICAL' | 'MODERATE' | 'HEALTHY';
}

export interface DeadStockMetric {
  item: InventoryItem;
  daysWithoutSale: number;
  lockedCapital: number;
  agingTier: '30_DAYS' | '60_DAYS' | '90_PLUS_DAYS';
}

// 1. Calculate Reorder Quantities Based on Min-Alert Threshold & Sales Velocity
export const calculateReorderMatrix = (
  items: InventoryItem[],
  safetyMultiplier: number = 3 // Target maintaining 3x the minimum threshold
): ReorderRecommendation[] => {
  return items
    .filter((item) => item.current_stock <= item.min_alert_threshold)
    .map((item) => {
      const targetStock = item.min_alert_threshold * safetyMultiplier;
      const deficit = Math.max(0, targetStock - item.current_stock);
      const suggestedReorderUnits = Math.ceil(deficit / 5) * 5; // Round to lot size of 5

      const urgency =
        item.current_stock === 0
          ? 'CRITICAL'
          : item.current_stock <= Math.floor(item.min_alert_threshold / 2)
          ? 'CRITICAL'
          : 'MODERATE';

      return {
        item,
        suggestedReorderUnits,
        estimatedCost: suggestedReorderUnits * item.cost_price,
        urgency,
      };
    })
    .sort((a, b) => (a.urgency === 'CRITICAL' ? -1 : 1));
};

// 2. Identify Stagnant Capital (Dead-Stock Diagnostics)
export const analyzeDeadStock = (items: InventoryItem[]): DeadStockMetric[] => {
  const now = new Date().getTime();

  return items
    .map((item) => {
      const lastActive = item.last_sold_at
        ? new Date(item.last_sold_at).getTime()
        : new Date(item.created_at).getTime();

      const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

      let agingTier: '30_DAYS' | '60_DAYS' | '90_PLUS_DAYS' = '30_DAYS';
      if (daysDiff >= 90) agingTier = '90_PLUS_DAYS';
      else if (daysDiff >= 60) agingTier = '60_DAYS';

      return {
        item,
        daysWithoutSale: daysDiff,
        lockedCapital: item.current_stock * item.cost_price,
        agingTier,
      };
    })
    .filter((metric) => metric.daysWithoutSale >= 30 && metric.item.current_stock > 0)
    .sort((a, b) => b.lockedCapital - a.lockedCapital);
};

// 3. Export Clean CSV Purchase Sheet for Wholesale Suppliers
export const exportSupplierOrderCSV = (recommendations: ReorderRecommendation[]): void => {
  const headers = ['Brand', 'Model', 'Category', 'Variant', 'Barcode', 'Current Stock', 'Suggested Order Units', 'Est. Unit Cost', 'Est. Total Cost'];
  
  const rows = recommendations.map(({ item, suggestedReorderUnits, estimatedCost }) => {
    const primaryModel = item.compatible_models?.find((m) => m.is_primary) || item.compatible_models?.[0];
    return [
      `"${primaryModel?.brand_name || 'Generic'}"`,
      `"${primaryModel?.model_name || 'All'}"`,
      `"${item.category}"`,
      `"${item.variant_name}"`,
      `"${item.barcode}"`,
      item.current_stock,
      suggestedReorderUnits,
      item.cost_price.toFixed(2),
      estimatedCost.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Supplier_Reorder_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
