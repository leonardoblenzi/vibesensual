
-- Migration 001: Initial Schema

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    promo_price DECIMAL(10,2),
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 2,
    sku TEXT UNIQUE,
    images JSONB DEFAULT '[]',
    variations JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    marketplace_fee DECIMAL(10,2) DEFAULT 0,
    commission DECIMAL(10,2) DEFAULT 0,
    fixed_fee DECIMAL(10,2) DEFAULT 0,
    source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    source TEXT NOT NULL,
    profit_r DECIMAL(10,2) NOT NULL,
    profit_p DECIMAL(10,2) NOT NULL,
    cost_at_time DECIMAL(10,2) NOT NULL,
    customer_name TEXT,
    customer_phone TEXT
);

-- Seed Categories
INSERT INTO categories (id, name) VALUES 
('cat1', 'Cosméticos'), 
('cat2', 'Acessórios'), 
('cat3', 'Lingeries'), 
('cat4', 'Fetiche')
ON CONFLICT (id) DO NOTHING;
