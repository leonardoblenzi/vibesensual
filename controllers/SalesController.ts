
import { StorageModel } from '../models/StorageModel';
import { InventoryController } from './InventoryController';
import { Sale, Product, SaleSource, PricingRule } from '../types';

const SALES_KEY = 'vibe_sales';
const RULES_KEY = 'vibe_pricing_rules';

export class SalesController {
  static getSales(): Sale[] {
    return StorageModel.get<Sale[]>(SALES_KEY, []);
  }

  static getRules(): PricingRule[] {
    return StorageModel.get<PricingRule[]>(RULES_KEY, []);
  }

  static calculateFinancials(product: Product, price: number, quantity: number, source: SaleSource) {
    const rules = this.getRules();
    const rule = rules.find(r => r.source === source);
    
    // Se o custo não existir, assume-se 0 para não quebrar o cálculo de lucro
    const costPrice = product.costPrice || 0;
    const totalCost = costPrice * quantity;
    
    const mktFee = rule ? (price * (rule.marketplaceFee || 0) / 100) : 0;
    const commFee = rule ? (price * (rule.commission || 0) / 100) : 0;
    const fixedFee = rule ? (rule.fixedFee || 0) : 0;
    
    const totalFees = mktFee + commFee + fixedFee;
    const profitR = price - totalCost - totalFees;
    const profitP = price > 0 ? (profitR / price) * 100 : 0;

    return { profitR, profitP, totalFees };
  }

  static registerSale(saleData: Partial<Sale>): void {
    const products = InventoryController.getProducts();
    const product = products.find(p => p.id === saleData.productId);
    
    if (!product) throw new Error("Produto não encontrado");

    const financial = this.calculateFinancials(
      product, 
      saleData.totalPrice || 0, 
      saleData.quantity || 1, 
      saleData.source || SaleSource.CATALOG
    );

    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      profitR: financial.profitR,
      profitP: financial.profitP,
      costAtTime: product.costPrice || 0,
    } as Sale;

    const sales = this.getSales();
    StorageModel.set(SALES_KEY, [newSale, ...sales]);
    
    // Atualiza estoque via InventoryController
    InventoryController.updateStock(product.id, saleData.quantity || 1);
  }
}
