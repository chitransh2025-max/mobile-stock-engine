import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InventoryItem } from '../types/database.types';

interface InventoryState {
  items: InventoryItem[];
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  isLoading: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brand: string) => void;
  updateStockDelta: (id: string, delta: number) => void;
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
}

const initialMockData: InventoryItem[] = [
  {
    id: 'item-1',
    category: 'TEMPERED_GLASS',
    variant_name: '11D Super D Clear Edge-to-Edge',
    barcode: 'SKU-IP13-14-11D-CLR',
    cost_price: 25.00,
    selling_price: 149.00,
    current_stock: 42,
    min_alert_threshold: 10,
    storage_rack: 'RACK-01',
    storage_box: 'BOX-11D',
    is_dead_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    compatible_models: [
      { model_id: 'm1', brand_name: 'Apple', model_name: 'iPhone 13', is_primary: true },
      { model_id: 'm2', brand_name: 'Apple', model_name: 'iPhone 14', is_primary: false },
    ],
  },
  {
    id: 'item-2',
    category: 'PHONE_CASE',
    variant_name: 'Frosted Smoke MagSafe Matte',
    barcode: 'SKU-IP15P-MGS-BLK',
    cost_price: 85.00,
    selling_price: 399.00,
    current_stock: 4,
    min_alert_threshold: 6,
    storage_rack: 'RACK-02',
    storage_box: 'BOX-CASE-09',
    is_dead_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    compatible_models: [
      { model_id: 'm3', brand_name: 'Apple', model_name: 'iPhone 15 Pro', is_primary: true },
    ],
  },
  {
    id: 'item-3',
    category: 'TEMPERED_GLASS',
    variant_name: 'UV Liquid Glue Curved Screen',
    barcode: 'SKU-S24U-UV-CLR',
    cost_price: 65.00,
    selling_price: 349.00,
    current_stock: 2,
    min_alert_threshold: 5,
    storage_rack: 'RACK-01',
    storage_box: 'BOX-UV',
    is_dead_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    compatible_models: [
      { model_id: 'm4', brand_name: 'Samsung', model_name: 'Galaxy S24 Ultra', is_primary: true },
    ],
  },
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      items: initialMockData,
      searchQuery: '',
      selectedCategory: 'ALL',
      selectedBrand: 'ALL',
      isLoading: false,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedBrand: (brand) => set({ selectedBrand: brand }),

      updateStockDelta: (id, delta) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  current_stock: Math.max(0, item.current_stock + delta),
                  updated_at: new Date().toISOString(),
                }
              : item
          ),
        })),

      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
    }),
    {
      name: 'mobile-stock-local-cache',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
