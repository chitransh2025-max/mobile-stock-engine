-- Insert Core Brands
INSERT INTO brands (id, name) VALUES 
('a1000000-0000-0000-0000-000000000001', 'Apple'),
('a1000000-0000-0000-0000-000000000002', 'Samsung'),
('a1000000-0000-0000-0000-000000000003', 'OnePlus');

-- Insert Common Models
INSERT INTO device_models (id, brand_id, model_name) VALUES 
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'iPhone 13'),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'iPhone 14'),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'iPhone 15 Pro'),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Galaxy S24 Ultra');

-- Insert Shared Tempered Glass (1 SKU fits iPhone 13 and iPhone 14)
INSERT INTO inventory_items (
    id, category, variant_name, barcode, cost_price, selling_price, current_stock, min_alert_threshold, storage_rack, storage_box
) VALUES (
    'c1000000-0000-0000-0000-000000000001', 
    'TEMPERED_GLASS', 
    '11D Super D Clear Edge-to-Edge', 
    'SKU-IP13-14-11D-CLR', 
    25.00, 
    149.00, 
    45, 
    10, 
    'RACK-01', 
    'BOX-11D'
);

-- Map Shared Compatibility
INSERT INTO product_compatibilities (inventory_item_id, device_model_id, is_primary_model) VALUES 
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', TRUE),
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', FALSE);
