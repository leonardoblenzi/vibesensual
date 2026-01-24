
import { Product, Category } from '../types';

const API_URL = ''; // Em produção no Render, caminhos relativos funcionam

export class InventoryController {
  static async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    return data.map((p: any) => ({
      ...p,
      categoryId: p.category_id,
      promoPrice: p.promo_price,
      costPrice: p.cost_price,
      minStock: p.min_stock,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      variations: typeof p.variations === 'string' ? JSON.parse(p.variations) : p.variations
    }));
  }

  static async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/api/categories`);
    return res.json();
  }

  static async saveProduct(product: Product): Promise<void> {
    await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
  }
}
