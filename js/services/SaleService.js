// Serviço de Vendas
import config from '../config.js';
import productService from './ProductService.js';

class SaleService {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.sales = new Map(); // Cache local
        this.currentSale = null;
    }

    // Iniciar nova venda
    startSale() {
        this.currentSale = {
            id: Date.now().toString(),
            items: [],
            subtotal: 0,
            discount: {
                type: 'percentage',
                value: 0
            },
            tax: 0,
            total: 0,
            createdAt: new Date().toISOString()
        };

        return this.currentSale;
    }

    // Adicionar item ao carrinho
    async addItem(productId, quantity = 1) {
        try {
            if (!this.currentSale) {
                throw new Error('Nenhuma venda em andamento');
            }

            const product = await productService.getProduct(productId);
            
            // Verificar estoque
            if (product.stock < quantity) {
                throw new Error('Estoque insuficiente');
            }

            // Verificar se o produto já está no carrinho
            const existingItem = this.currentSale.items.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.total = existingItem.quantity * existingItem.price;
            } else {
                this.currentSale.items.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    quantity,
                    total: product.price * quantity
                });
            }

            this.updateTotals();
            return this.currentSale;
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            throw error;
        }
    }

    // Remover item do carrinho
    removeItem(productId) {
        if (!this.currentSale) {
            throw new Error('Nenhuma venda em andamento');
        }

        this.currentSale.items = this.currentSale.items.filter(item => item.productId !== productId);
        this.updateTotals();
        
        return this.currentSale;
    }

    // Atualizar quantidade de um item
    updateItemQuantity(productId, quantity) {
        if (!this.currentSale) {
            throw new Error('Nenhuma venda em andamento');
        }

        const item = this.currentSale.items.find(item => item.productId === productId);
        if (!item) {
            throw new Error('Item não encontrado');
        }

        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        item.quantity = quantity;
        item.total = item.price * quantity;
        
        this.updateTotals();
        return this.currentSale;
    }

    // Aplicar desconto
    applyDiscount(value, type = 'percentage') {
        if (!this.currentSale) {
            throw new Error('Nenhuma venda em andamento');
        }

        // Validar desconto
        if (type === 'percentage' && (value < 0 || value > config.sales.discountLimits.percentage * 100)) {
            throw new Error(`Desconto máximo permitido: ${config.sales.discountLimits.percentage * 100}%`);
        }

        if (type === 'fixed' && (value < 0 || value > config.sales.discountLimits.value)) {
            throw new Error(`Desconto máximo permitido: R$ ${config.sales.discountLimits.value}`);
        }

        this.currentSale.discount = { type, value };
        this.updateTotals();
        
        return this.currentSale;
    }

    // Atualizar totais da venda
    updateTotals() {
        if (!this.currentSale) return;

        // Calcular subtotal
        this.currentSale.subtotal = this.currentSale.items.reduce((sum, item) => sum + item.total, 0);

        // Calcular desconto
        let discountValue = 0;
        if (this.currentSale.discount.type === 'percentage') {
            discountValue = this.currentSale.subtotal * (this.currentSale.discount.value / 100);
        } else {
            discountValue = this.currentSale.discount.value;
        }

        // Aplicar limite de desconto
        discountValue = Math.min(discountValue, config.sales.discountLimits.value);

        // Calcular impostos
        const taxableAmount = this.currentSale.subtotal - discountValue;
        this.currentSale.tax = taxableAmount * config.sales.taxRate;

        // Calcular total
        this.currentSale.total = taxableAmount + this.currentSale.tax;

        return this.currentSale;
    }

    // Finalizar venda
    async finalizeSale(paymentData) {
        try {
            if (!this.currentSale) {
                throw new Error('Nenhuma venda em andamento');
            }

            if (this.currentSale.items.length === 0) {
                throw new Error('Carrinho vazio');
            }

            // Validar pagamento
            if (!paymentData.customer || !paymentData.paymentMethod) {
                throw new Error('Dados de pagamento incompletos');
            }

            // Atualizar venda com dados de pagamento
            const sale = {
                ...this.currentSale,
                customer: paymentData.customer,
                payment: {
                    method: paymentData.paymentMethod,
                    installments: paymentData.installments || 1
                },
                notes: paymentData.notes,
                status: 'completed',
                completedAt: new Date().toISOString()
            };

            // TODO: Implementar chamada real à API
            // Simulação
            this.sales.set(sale.id, sale);

            // Atualizar estoque
            for (const item of sale.items) {
                await productService.updateStock(item.productId, item.quantity, 'remove');
            }

            // Limpar venda atual
            this.currentSale = null;

            return sale;
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            throw error;
        }
    }

    // Cancelar venda
    cancelSale() {
        this.currentSale = null;
    }

    // Buscar vendas recentes
    async getRecentSales(limit = 5) {
        try {
            // TODO: Implementar chamada real à API
            // Simulação
            const sales = Array.from(this.sales.values())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);

            return sales;
        } catch (error) {
            console.error('Erro ao buscar vendas recentes:', error);
            throw new Error('Não foi possível carregar as vendas recentes');
        }
    }

    // Exportar vendas
    async exportSales(format = 'json') {
        try {
            const sales = Array.from(this.sales.values());

            switch (format) {
                case 'csv':
                    return this.exportToCSV(sales);
                case 'json':
                default:
                    return JSON.stringify(sales, null, 2);
            }
        } catch (error) {
            console.error('Erro ao exportar vendas:', error);
            throw new Error('Não foi possível exportar as vendas');
        }
    }

    // Utilitário para exportar para CSV
    exportToCSV(sales) {
        const headers = ['ID', 'Data', 'Cliente', 'Total', 'Status'];
        const rows = sales.map(s => [
            s.id,
            new Date(s.createdAt).toLocaleDateString(),
            s.customer,
            s.total.toFixed(2),
            s.status
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
}

// Criar instância global
const saleService = new SaleService();

// Exportar para uso em outros módulos
export default saleService; 