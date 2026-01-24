
-- Execute este script no console do seu banco PostgreSQL no Render

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
    cost_price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 2,
    sku TEXT UNIQUE,
    images JSONB,
    variations JSONB
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

CREATE TABLE IF NOT EXISTS pricing_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    marketplace_fee DECIMAL(10,2),
    commission DECIMAL(10,2),
    fixed_fee DECIMAL(10,2),
    source TEXT NOT NULL
);

-- Inserir categorias iniciais
INSERT INTO categories (id, name) VALUES 
('cat1', 'Cosméticos'), 
('cat2', 'Acessórios'), 
('cat3', 'Lingeries'), 
('cat4', 'Fetiche')
ON CONFLICT DO NOTHING;
