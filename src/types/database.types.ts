export type AccessoryCategory =
  | 'PHONE_CASE'
  | 'TEMPERED_GLASS'
  | 'CAMERA_LENS_PROTECTOR'
  | 'CHARGER_ADAPTER'
  | 'DATA_CABLE'
  | 'SKIN_WRAP';

export type StockMovementType =
  | 'STOCK_IN_PURCHASE'
  | 'STOCK_OUT_SALE'
  | 'DAMAGE_WRITE_OFF'
  | 'AUDIT_ADJUSTMENT';

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface DeviceModel {
  id: string;
  brand_id: string;
  model_name: string;
  screen_size_inches?: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  category: AccessoryCategory;
  variant_name: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_alert_threshold: number;
  storage_rack: string;
  storage_box: string;
  is_dead_stock: boolean;
  last_sold_at?: string;
  created_at: string;
  updated_at: string;
  // Computed / Joined relations
  compatible_models?: {
    model_id: string;
    brand_name: string;
    model_name: string;
    is_primary: boolean;
  }[];
}

export interface StockLedgerEntry {
  id: string;
  inventory_item_id: string;
  movement_type: StockMovementType;
  quantity_changed: number;
  unit_cost_price: number;
  unit_selling_price: number;
  total_net_profit: number;
  invoice_ref?: string;
  created_at: string;
}
