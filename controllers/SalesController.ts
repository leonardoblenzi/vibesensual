
import { InventoryController } from './InventoryController';
import { Sale, Product, SaleSource, PricingRule } from '../types';

export class SalesController {
  static async getSales(): Promise<Sale[]> {
    const res = await fetch(`/api/sales`);
    const data = await res.json();
    return data.map((s: any) => ({
      ...s,
      totalPrice: s.total_price,
      profitR: s.profit_r,
      profitP: s.profit_p,
      costAtTime: s.cost_at_time,
      customerName: s.customer_name,
      customerPhone: s.customer_phone
    }));
  }

  static async getRules(): Promise<PricingRule[]> {
    const res = await fetch(`/api/pricing-rules`);
    return res.json();
  }

  static calculateFinancials(product: Product, price: number, quantity: number, source: SaleSource, rules: PricingRule[]) {
    const rule = rules.find(r => r.source === source);
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

  static async registerSale(saleData: Partial<Sale>): Promise<void> {
    const products = await InventoryController.getProducts();
    const product = products.find(p => p.id === saleData.productId);
    if (!product) throw new Error("Produto não encontrado");

    // Aqui as regras seriam buscadas da API também
    const rulesRes = await fetch('/api/pricing-rules');
    const rules = await rulesRes.json().catch(() => []);

    const financial = this.calculateFinancials(
      product, 
      saleData.totalPrice || 0, 
      saleData.quantity || 1, 
      saleData.source || SaleSource.CATALOG,
      rules
    );

    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      profitR: financial.profitR,
      profitP: financial.profitP,
      costAtTime: product.costPrice || 0,
    } as Sale;

    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale)
    });
  }
}
