
-- Migration 001: Initial Schema (Clean State)

-- Remove as tabelas se existirem para evitar conflitos de esquema antigo
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Criação da tabela de categorias
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Criação da tabela de produtos
CREATE TABLE products (
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

-- Criação da tabela de regras de preço
CREATE TABLE pricing_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    marketplace_fee DECIMAL(10,2) DEFAULT 0,
    commission DECIMAL(10,2) DEFAULT 0,
    fixed_fee DECIMAL(10,2) DEFAULT 0,
    source TEXT NOT NULL
);

-- Criação da tabela de vendas
CREATE TABLE sales (
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

-- Seed das categorias iniciais
INSERT INTO categories (id, name) VALUES 
('cat1', 'Cosméticos'), 
('cat2', 'Acessórios'), 
('cat3', 'Lingeries'), 
('cat4', 'Fetiche');
