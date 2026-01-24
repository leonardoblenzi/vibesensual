
export enum SaleSource {
  CATALOG = 'Catálogo',
  MARKETPLACE_ML = 'Mercado Livre',
  MARKETPLACE_SHOPEE = 'Shopee',
  MARKETPLACE_AMAZON = 'Amazon'
}

export interface VariationOption {
  id: string;
  name: string;
  priceDelta: number;
  stock: number;
  isAvailable: boolean;
  image?: string;
}

export interface VariationGroup {
  id: string;
  name: string;
  options: VariationOption[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  promoPrice?: number;
  costPrice: number;
  stock: number;
  minStock: number;
  images: string[];
  sku: string;
  variations: VariationGroup[];
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'markup' | 'discount';
  value: number;
  marketplaceFee?: number;
  commission?: number;
  fixedFee?: number;
  source: SaleSource | 'ALL';
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  source: SaleSource;
  profitR: number; // Lucro em Reais
  profitP: number; // Lucro em Percentual
  costAtTime: number; // Custo do produto no momento da venda
  customerName?: string;
  customerPhone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
}
