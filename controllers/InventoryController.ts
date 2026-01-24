
import { StorageModel } from '../models/StorageModel';
import { Product, Category } from '../types';

const PRODUCTS_KEY = 'vibe_products';
const CATEGORIES_KEY = 'vibe_categories';

export class InventoryController {
  static getProducts(): Product[] {
    return StorageModel.get<Product[]>(PRODUCTS_KEY, []);
  }

  static getCategories(): Category[] {
    return StorageModel.get<Category[]>(CATEGORIES_KEY, [
      { id: 'cat1', name: 'Cosméticos' },
      { id: 'cat2', name: 'Acessórios' },
      { id: 'cat3', name: 'Lingeries' },
      { id: 'cat4', name: 'Fetiche' },
    ]);
  }

  static saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    
    StorageModel.set(PRODUCTS_KEY, products);
  }

  static updateStock(productId: string, quantity: number): void {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock -= quantity;
      StorageModel.set(PRODUCTS_KEY, products);
    }
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    StorageModel.set(PRODUCTS_KEY, products);
  }
}
