import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log('🚀 Iniciando migrations...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Tabela simples para controle de migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const { rows } = await client.query('SELECT * FROM _migrations WHERE name = $1', [file]);
      
      if (rows.length === 0) {
        console.log(`  Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      } else {
        console.log(`  Skipping migration (already executed): ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Migrations concluídas com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar migrations:', err);
    // Fix: cast process to any to access Node-specific exit method when types are incomplete
    (process as any).exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();