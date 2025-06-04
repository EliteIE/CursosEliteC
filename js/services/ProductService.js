// Serviço de Produtos
import config from '../config.js';

class ProductService {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.products = new Map(); // Cache local
    }

    // Buscar todos os produtos
    async getProducts(filters = {}) {
        try {
            // TODO: Implementar chamada real à API
            // Simulação de dados
            const products = [
                {
                    id: '1',
                    name: 'Smartphone XYZ',
                    category: 'eletronicos',
                    price: 1299.00,
                    stock: 45,
                    status: 'active',
                    image: 'https://via.placeholder.com/150',
                    description: 'Smartphone de última geração',
                    sku: 'PHONE-XYZ-001',
                    stats: {
                        sales: 32,
                        views: 128
                    }
                },
                // Adicionar mais produtos mock aqui
            ];

            // Aplicar filtros
            let filtered = products;
            
            if (filters.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(search) ||
                    p.sku.toLowerCase().includes(search)
                );
            }

            if (filters.category) {
                filtered = filtered.filter(p => p.category === filters.category);
            }

            if (filters.status) {
                filtered = filtered.filter(p => p.status === filters.status);
            }

            // Ordenação
            if (filters.sort) {
                filtered.sort((a, b) => {
                    switch (filters.sort) {
                        case 'name':
                            return a.name.localeCompare(b.name);
                        case 'price':
                            return a.price - b.price;
                        case 'stock':
                            return a.stock - b.stock;
                        case 'sales':
                            return b.stats.sales - a.stats.sales;
                        default:
                            return 0;
                    }
                });
            }

            // Atualizar cache
            filtered.forEach(product => {
                this.products.set(product.id, product);
            });

            return filtered;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            throw new Error('Não foi possível carregar os produtos');
        }
    }

    // Buscar um produto específico
    async getProduct(id) {
        try {
            // Verificar cache primeiro
            if (this.products.has(id)) {
                return this.products.get(id);
            }

            // TODO: Implementar chamada real à API
            // Simulação
            const product = {
                id,
                name: 'Smartphone XYZ',
                category: 'eletronicos',
                price: 1299.00,
                stock: 45,
                status: 'active',
                image: 'https://via.placeholder.com/150',
                description: 'Smartphone de última geração',
                sku: 'PHONE-XYZ-001',
                stats: {
                    sales: 32,
                    views: 128
                }
            };

            // Atualizar cache
            this.products.set(id, product);

            return product;
        } catch (error) {
            console.error(`Erro ao buscar produto ${id}:`, error);
            throw new Error('Não foi possível carregar o produto');
        }
    }

    // Criar novo produto
    async createProduct(productData) {
        try {
            // TODO: Implementar chamada real à API
            // Simulação
            const product = {
                id: Date.now().toString(),
                ...productData,
                status: 'active',
                stats: {
                    sales: 0,
                    views: 0
                }
            };

            // Atualizar cache
            this.products.set(product.id, product);

            return product;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw new Error('Não foi possível criar o produto');
        }
    }

    // Atualizar produto
    async updateProduct(id, updates) {
        try {
            // TODO: Implementar chamada real à API
            // Simulação
            const product = await this.getProduct(id);
            const updated = {
                ...product,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Atualizar cache
            this.products.set(id, updated);

            return updated;
        } catch (error) {
            console.error(`Erro ao atualizar produto ${id}:`, error);
            throw new Error('Não foi possível atualizar o produto');
        }
    }

    // Deletar produto
    async deleteProduct(id) {
        try {
            // TODO: Implementar chamada real à API
            // Simulação
            this.products.delete(id);

            return true;
        } catch (error) {
            console.error(`Erro ao deletar produto ${id}:`, error);
            throw new Error('Não foi possível deletar o produto');
        }
    }

    // Atualizar estoque
    async updateStock(id, quantity, operation = 'add') {
        try {
            const product = await this.getProduct(id);
            let newStock = product.stock;

            if (operation === 'add') {
                newStock += quantity;
            } else if (operation === 'remove') {
                newStock -= quantity;
                if (newStock < 0) {
                    throw new Error('Estoque insuficiente');
                }
            } else if (operation === 'set') {
                newStock = quantity;
            }

            return this.updateProduct(id, { stock: newStock });
        } catch (error) {
            console.error(`Erro ao atualizar estoque do produto ${id}:`, error);
            throw error;
        }
    }

    // Importar produtos em massa
    async importProducts(productsData) {
        try {
            const imported = [];
            
            for (const data of productsData) {
                const product = await this.createProduct(data);
                imported.push(product);
            }

            return imported;
        } catch (error) {
            console.error('Erro ao importar produtos:', error);
            throw new Error('Não foi possível importar os produtos');
        }
    }

    // Exportar produtos
    async exportProducts(format = 'json') {
        try {
            const products = Array.from(this.products.values());

            switch (format) {
                case 'csv':
                    return this.exportToCSV(products);
                case 'json':
                default:
                    return JSON.stringify(products, null, 2);
            }
        } catch (error) {
            console.error('Erro ao exportar produtos:', error);
            throw new Error('Não foi possível exportar os produtos');
        }
    }

    // Utilitário para exportar para CSV
    exportToCSV(products) {
        const headers = ['ID', 'Nome', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Status'];
        const rows = products.map(p => [
            p.id,
            p.name,
            p.sku,
            p.category,
            p.price,
            p.stock,
            p.status
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
}

// Criar instância global
const productService = new ProductService();

// Exportar para uso em outros módulos
export default productService; 