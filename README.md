# 📱 Mobile Stock Matrix & Quick POS Engine

An enterprise-grade, high-performance offline-first inventory management and quick point-of-sale (POS) progressive web application tailored specifically for mobile cases, tempered glass, camera protectors, and phone accessories.

---

## 🚀 Key Features

- **Cross-Model Compatibility Graph:** Automatically link 1 physical accessory (e.g., tempered glass) to multiple compatible smartphone models without data duplication.
- **Zero-Latency Camera Barcode Scanner:** Continuous scanning using device camera with instant visual, audio, and haptic feedback.
- **Custom 50mm x 30mm Barcode Sticker Printer:** Built-in Code-128 label rendering and direct thermal label printing support.
- **Offline-First Data Architecture:** Local persistence (IndexedDB / LocalStorage) ensures zero lag in basements and network-dead shop environments.
- **Quick POS & Live Profit Tracker:** 1-tap stock deduction upon retail sale with real-time gross/net profit tracking.
- **WhatsApp & 58mm Thermal Invoicing:** Generate instant formatted WhatsApp receipt links and printable 58mm thermal slips.
- **Dead-Stock & Re-Order Intelligence:** Diagnostic reporting for 30/60/90+ day stagnant items and auto-generated supplier purchase order (PO) CSVs.
- **Role-Based Access Control (RBAC):** Admin Mode (Full access to costs and profit margins) vs Staff Mode (Stock check, deduct sale, restricted cost prices).

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Next.js 14 / React with Tailwind CSS
- **State Management:** Zustand with local persistent caching
- **Database:** Supabase (PostgreSQL with Row Level Security & Compatibility Tables)
- **Scanning & Barcodes:** `html5-qrcode`, `bwip-js`
- **Icons:** `lucide-react`
- **PWA & Offline Service:** Native Service Worker (`sw.js`) + Web App Manifest

---

## 📂 Repository Structure

```text
stock-matrix-engine/
├── public/
│   ├── manifest.json              # PWA Web App Manifest
│   └── sw.js                      # Offline Caching Service Worker
├── supabase/
│   ├── migrations/
│   │   └── 20260824000000_init_stock_schema.sql  # Database schema & indexes
│   └── seed.sql                   # Sample brand and shared SKU seed data
├── src/
│   ├── types/
│   │   └── database.types.ts      # TypeScript definitions
│   ├── hooks/
│   │   └── useBarcodeScanner.ts   # Camera barcode scanner engine
│   ├── store/
│   │   └── useInventoryStore.ts   # Offline-first Zustand store
│   ├── utils/
│   │   ├── receiptGenerator.ts    # WhatsApp & thermal receipt formatter
│   │   ├── stockAnalyticsEngine.ts# Dead-stock and re-order algorithms
│   │   └── registerServiceWorker.ts # PWA registration helper
│   ├── context/
│   │   └── AuthRoleContext.tsx    # Admin vs Staff access context
│   └── components/
│       ├── BarcodeLabelPrinter.tsx # Thermal sticker designer
│       ├── inventory/
│       │   ├── StockItemCard.tsx   # Item card with quick counters
│       │   └── InventoryDashboard.tsx # Main inventory interface
│       ├── pos/
│       │   └── QuickPOSModal.tsx   # 1-tap checkout modal
│       └── analytics/
│           └── DeadStockAndReorderView.tsx # Analytics dashboard
├── package.json
└── README.md
