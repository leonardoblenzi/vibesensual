
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// --- PRODUTOS ---
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/products', async (req, res) => {
  const p = req.body;
  try {
    const query = `
      INSERT INTO products (id, name, description, category_id, price, promo_price, cost_price, stock, min_stock, sku, images, variations)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
      name = $2, description = $3, category_id = $4, price = $5, promo_price = $6, cost_price = $7, stock = $8, min_stock = $9, sku = $10, images = $11, variations = $12
      RETURNING *`;
    const values = [p.id, p.name, p.description, p.categoryId, p.price, p.promoPrice, p.costPrice || 0, p.stock || 0, p.minStock || 2, p.sku, JSON.stringify(p.images || []), JSON.stringify(p.variations || [])];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- CATEGORIAS ---
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { id, name } = req.body;
  try {
    const result = await pool.query('INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2 RETURNING *', [id, name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- REGRAS DE PREÇO ---
app.get('/api/pricing-rules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pricing_rules ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/pricing-rules', async (req, res) => {
  const r = req.body;
  try {
    const query = `
      INSERT INTO pricing_rules (id, name, type, value, marketplace_fee, commission, fixed_fee, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
      name = $2, type = $3, value = $4, marketplace_fee = $5, commission = $6, fixed_fee = $7, source = $8
      RETURNING *`;
    const values = [r.id, r.name, r.type, r.value, r.marketplaceFee || 0, r.commission || 0, r.fixedFee || 0, r.source];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/pricing-rules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pricing_rules WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- VENDAS ---
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/sales', async (req, res) => {
  const s = req.body;
  try {
    const query = `
      INSERT INTO sales (id, product_id, product_name, quantity, total_price, date, source, profit_r, profit_p, cost_at_time, customer_name, customer_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`;
    const values = [s.id, s.productId, s.productName, s.quantity, s.totalPrice, s.date, s.source, s.profitR, s.profitP, s.costAtTime, s.customerName, s.customerPhone];
    const result = await pool.query(query, values);
    
    // Baixa de estoque
    await pool.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [s.quantity, s.productId]);
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sales WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Estáticos
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
