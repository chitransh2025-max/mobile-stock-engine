-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum Types for Strict Domain Consistency
CREATE TYPE accessory_category AS ENUM (
    'PHONE_CASE',
    'TEMPERED_GLASS',
    'CAMERA_LENS_PROTECTOR',
    'CHARGER_ADAPTER',
    'DATA_CABLE',
    'SKIN_WRAP'
);

CREATE TYPE stock_movement_type AS ENUM (
    'STOCK_IN_PURCHASE',
    'STOCK_OUT_SALE',
    'DAMAGE_WRITE_OFF',
    'AUDIT_ADJUSTMENT'
);

-- 2. Device Brands (Apple, Samsung, OnePlus, etc.)
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Device Models
CREATE TABLE device_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    screen_size_inches NUMERIC(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_brand_model UNIQUE(brand_id, model_name)
);

-- 4. Core Inventory Items & Physical Location
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category accessory_category NOT NULL,
    variant_name VARCHAR(100) NOT NULL, -- e.g., '11D Matte Anti-Glare', 'MagSafe Frosted Smoke'
    barcode VARCHAR(100) UNIQUE NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_alert_threshold INT NOT NULL DEFAULT 5,
    storage_rack VARCHAR(50) NOT NULL DEFAULT 'RACK-01',
    storage_box VARCHAR(50) NOT NULL DEFAULT 'BOX-A',
    is_dead_stock BOOLEAN DEFAULT FALSE,
    last_sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Shared Compatibility Mapping (Cross-Model Linking Engine)
CREATE TABLE product_compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    device_model_id UUID REFERENCES device_models(id) ON DELETE CASCADE,
    is_primary_model BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_item_model_fit UNIQUE(inventory_item_id, device_model_id)
);

-- 6. POS Sales & Inward Ledger Engine
CREATE TABLE stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE RESTRICT,
    movement_type stock_movement_type NOT NULL,
    quantity_changed INT NOT NULL, -- Positive for IN, Negative for OUT
    unit_cost_price NUMERIC(10, 2) NOT NULL,
    unit_selling_price NUMERIC(10, 2) NOT NULL,
    total_net_profit NUMERIC(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN movement_type = 'STOCK_OUT_SALE' THEN ((unit_selling_price - unit_cost_price) * ABS(quantity_changed))
            ELSE 0.00
        END
    ) STORED,
    invoice_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. High-Performance Indexes for Scanning & Filtering
CREATE INDEX idx_inventory_barcode ON inventory_items(barcode);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_compat_device ON product_compatibilities(device_model_id);
CREATE INDEX idx_ledger_created ON stock_ledger(created_at DESC);

-- 8. Automated Trigger to Update Updated_at Timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory_timestamp
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
