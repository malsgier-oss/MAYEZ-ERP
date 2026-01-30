-- MAYEZ-ERP: Example seed data
-- Run in Supabase SQL Editor AFTER schema.sql, add_refunded_status.sql, and add_customers_debt.sql (if using returns).
-- Run once on empty DB. If re-running, clear data first (e.g. delete from products, customers, categories).

-- Categories (optional)
INSERT INTO categories (name) VALUES
  ('Beverages'),
  ('Snacks'),
  ('Dairy');

-- Customers (example; add real ones for go-live)
INSERT INTO customers (name, phone, email, address, notes) VALUES
  ('Walk-in Customer', NULL, NULL, NULL, 'Default for cash sales'),
  ('Ahmed Hassan', '+966501234567', 'ahmed@example.com', 'Riyadh', NULL),
  ('Sara Ali', '+966509876543', NULL, 'Jeddah', NULL),
  ('Omar Khalid', '+966551112233', 'omar@example.com', NULL, 'Regular'),
  ('Layla Mohammed', '+966554445566', NULL, 'Dammam', NULL),
  ('Youssef Ibrahim', '+966557778899', NULL, NULL, NULL);

-- Products (example; replace with real catalog)
INSERT INTO products (sku, name, description, unit, selling_price, current_stock, low_stock_threshold) VALUES
  ('WAT-500', 'Water 500ml', 'Bottled water', 'pcs', 1.50, 100, 20),
  ('JUICE-1', 'Orange Juice 1L', NULL, 'pcs', 4.00, 50, 10),
  ('CHIPS-150', 'Chips 150g', 'Potato chips', 'pcs', 2.50, 80, 15),
  ('MILK-1', 'Milk 1L', 'Full fat', 'pcs', 3.00, 60, 12),
  ('BREAD-1', 'White Bread', 'Loaf', 'pcs', 2.00, 40, 10),
  ('EGGS-12', 'Eggs 12pcs', NULL, 'box', 8.00, 30, 5),
  ('RICE-5', 'Rice 5kg', 'Basmati', 'bag', 25.00, 20, 5),
  ('OIL-1', 'Cooking Oil 1L', NULL, 'pcs', 12.00, 25, 5);
