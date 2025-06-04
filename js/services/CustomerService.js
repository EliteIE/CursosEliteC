// Serviço de Clientes
import config from '../config.js';
import saleService from './SaleService.js';
import notifications from '../notifications.js';
import firebase from 'firebase/app';
import 'firebase/firestore';
import auth from '../auth.js';

class CustomerService {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.db = firebase.firestore();
        this.customers = new Map(); // Cache local
        this.tags = new Set(['VIP', 'Atacado', 'Varejo', 'Inadimplente', 'Parceiro', 'Fornecedor']);
        this.marketingSegments = new Set(['Potencial', 'Ativo', 'Em Risco', 'Recuperação', 'Premium']);
        this.loyaltyLevels = {
            bronze: { minPoints: 0, discount: 0 },
            prata: { minPoints: 1000, discount: 5 },
            ouro: { minPoints: 5000, discount: 10 },
            platina: { minPoints: 10000, discount: 15 },
            diamante: { minPoints: 20000, discount: 20 }
        };
        this.socialNetworks = ['facebook', 'instagram', 'twitter', 'linkedin'];
        
        // Iniciar verificações automáticas
        this.startAutoChecks();
    }

    // Buscar todos os clientes
    async getCustomers(filters = {}) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            let query = this.db.collection('customers');

            // Aplicar filtros
            if (filters.search) {
                const search = filters.search.toLowerCase();
                // Firestore não suporta pesquisa de texto completo, então faremos no cliente
                const snapshot = await query.get();
                return snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(customer => 
                        customer.name.toLowerCase().includes(search) ||
                        customer.email.toLowerCase().includes(search) ||
                        customer.phone.includes(search)
                    );
            }

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            if (filters.group) {
                query = query.where('group', '==', filters.group);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw new Error('Não foi possível carregar os clientes');
        }
    }

    // Buscar cliente por ID
    async getCustomer(id) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            const doc = await this.db.collection('customers').doc(id).get();
            if (!doc.exists) {
                throw new Error('Cliente não encontrado');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            throw error;
        }
    }

    // Criar novo cliente
    async createCustomer(data) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            // Validar dados obrigatórios
            if (!data.name || !data.email || !data.phone) {
                throw new Error('Dados incompletos');
            }

            const customerData = {
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: data.status || 'active',
                group: data.group || 'regular',
                totalPurchases: 0,
                lastPurchase: null
            };

            const docRef = await this.db.collection('customers').add(customerData);
            return { id: docRef.id, ...customerData };
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    }

    // Atualizar cliente
    async updateCustomer(id, data) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            const oldData = await this.getCustomer(id);
            if (!oldData) throw new Error('Cliente não encontrado');

            // Registrar alterações
            const changes = Object.entries(data).map(([field, value]) => ({
                type: 'field_update',
                field,
                oldValue: oldData[field],
                newValue: value
            }));

            // Atualizar dados
            const updatedData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('customers').doc(id).update(updatedData);

            // Registrar cada alteração
            for (const change of changes) {
                if (change.oldValue !== change.newValue) {
                    await this.trackChange(id, change);
                }
            }

            return { id, ...oldData, ...updatedData };
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    }

    // Excluir cliente
    async deleteCustomer(id) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            const customer = await this.getCustomer(id);
            if (!customer) {
                throw new Error('Cliente não encontrado');
            }

            await this.db.collection('customers').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            throw error;
        }
    }

    // Importar clientes
    async importCustomers(file) {
        try {
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(','));
            const headers = rows[0];
            
            const customers = rows.slice(1).map(row => {
                const customer = {};
                headers.forEach((header, index) => {
                    customer[header.trim()] = row[index]?.trim();
                });
                return customer;
            });

            // TODO: Implementar importação em lote
            for (const customer of customers) {
                await this.createCustomer(customer);
            }

            return customers.length;
        } catch (error) {
            console.error('Erro ao importar clientes:', error);
            throw new Error('Não foi possível importar os clientes');
        }
    }

    // Exportar clientes
    async exportCustomers(format = 'csv') {
        try {
            const customers = await this.getCustomers();

            switch (format) {
                case 'csv':
                    return this.exportToCSV(customers);
                case 'json':
                    return JSON.stringify(customers, null, 2);
                default:
                    throw new Error('Formato não suportado');
            }
        } catch (error) {
            console.error('Erro ao exportar clientes:', error);
            throw new Error('Não foi possível exportar os clientes');
        }
    }

    // Buscar CEP
    async fetchAddress(zipCode) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
            if (!response.ok) {
                throw new Error('CEP não encontrado');
            }
            
            const data = await response.json();
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }
            
            return {
                address: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw error;
        }
    }

    // Utilitário para exportar para CSV
    exportToCSV(customers) {
        const headers = [
            'ID',
            'Nome',
            'E-mail',
            'Telefone',
            'CPF',
            'Status',
            'Grupo',
            'Total de Compras',
            'Última Compra',
            'Data de Cadastro'
        ];

        const rows = customers.map(c => [
            c.id,
            c.name,
            c.email,
            c.phone,
            c.cpf || '',
            c.status,
            c.group,
            c.totalPurchases,
            c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : '',
            new Date(c.createdAt).toLocaleDateString()
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    // Buscar histórico de compras
    async getCustomerPurchases(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) {
                throw new Error('Cliente não encontrado');
            }

            // TODO: Implementar chamada real à API
            // Simulação
            return {
                purchases: [],
                stats: {
                    totalPurchases: customer.totalPurchases || 0,
                    totalSpent: customer.totalSpent || 0,
                    averageTicket: customer.totalSpent ? customer.totalSpent / customer.totalPurchases : 0,
                    lastPurchase: customer.lastPurchase,
                    frequentProducts: [],
                    paymentMethods: {}
                }
            };
        } catch (error) {
            console.error('Erro ao buscar histórico de compras:', error);
            throw error;
        }
    }

    // Atualizar estatísticas do cliente após uma venda
    async updateCustomerStats(customerId, sale) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) {
                throw new Error('Cliente não encontrado');
            }

            // Atualizar estatísticas
            const updatedCustomer = {
                ...customer,
                totalPurchases: (customer.totalPurchases || 0) + 1,
                totalSpent: (customer.totalSpent || 0) + sale.total,
                lastPurchase: new Date().toISOString()
            };

            // Atualizar cliente
            await this.updateCustomer(customerId, updatedCustomer);
            return updatedCustomer;
        } catch (error) {
            console.error('Erro ao atualizar estatísticas do cliente:', error);
            throw error;
        }
    }

    // Iniciar nova venda para o cliente
    async startSale(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) {
                throw new Error('Cliente não encontrado');
            }

            // Criar nova venda
            const sale = saleService.startSale();
            sale.customer = {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            };

            return sale;
        } catch (error) {
            console.error('Erro ao iniciar venda:', error);
            throw error;
        }
    }

    // Validar CPF
    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verificar dígitos repetidos
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    // Formatar CPF
    formatCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Formatar telefone
    formatPhone(phone) {
        phone = phone.replace(/[^\d]/g, '');
        if (phone.length === 11) {
            return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Validar e-mail
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Gerar relatório de clientes
    async generateReport(filters = {}) {
        try {
            const customers = await this.getCustomers(filters);
            
            const report = {
                totalCustomers: customers.length,
                activeCustomers: customers.filter(c => c.status === 'active').length,
                inactiveCustomers: customers.filter(c => c.status === 'inactive').length,
                vipCustomers: customers.filter(c => c.status === 'vip').length,
                totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
                averageRevenue: 0,
                customersByGroup: {
                    regular: customers.filter(c => c.group === 'regular').length,
                    wholesale: customers.filter(c => c.group === 'wholesale').length,
                    special: customers.filter(c => c.group === 'special').length
                },
                recentCustomers: customers
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
            };

            report.averageRevenue = report.totalRevenue / report.totalCustomers;

            return report;
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw new Error('Não foi possível gerar o relatório');
        }
    }

    // Buscar clientes inativos
    async getInactiveCustomers(days = 90) {
        try {
            const customers = await this.getCustomers({ status: 'active' });
            const threshold = new Date();
            threshold.setDate(threshold.getDate() - days);

            return customers.filter(customer => {
                if (!customer.lastPurchase) return true;
                return new Date(customer.lastPurchase) < threshold;
            });
        } catch (error) {
            console.error('Erro ao buscar clientes inativos:', error);
            throw error;
        }
    }

    // Identificar clientes VIP
    async identifyVIPCustomers(criteria = {
        minPurchases: 10,
        minSpent: 5000,
        lastPurchaseDays: 30
    }) {
        try {
            const customers = await this.getCustomers();
            const threshold = new Date();
            threshold.setDate(threshold.getDate() - criteria.lastPurchaseDays);

            const vipCustomers = customers.filter(customer => {
                const hasMinPurchases = (customer.totalPurchases || 0) >= criteria.minPurchases;
                const hasMinSpent = (customer.totalSpent || 0) >= criteria.minSpent;
                const isRecent = customer.lastPurchase && new Date(customer.lastPurchase) >= threshold;

                return hasMinPurchases && hasMinSpent && isRecent;
            });

            // Atualizar status dos clientes VIP
            for (const customer of vipCustomers) {
                if (customer.status !== 'vip') {
                    await this.updateCustomer(customer.id, { status: 'vip' });
                }
            }

            return vipCustomers;
        } catch (error) {
            console.error('Erro ao identificar clientes VIP:', error);
            throw error;
        }
    }

    // Sistema de Tags
    async addTag(customerId, tag) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!customer.tags) customer.tags = [];
            if (!customer.tags.includes(tag)) {
                customer.tags.push(tag);
                await this.updateCustomer(customerId, { tags: customer.tags });
            }

            return customer.tags;
        } catch (error) {
            console.error('Erro ao adicionar tag:', error);
            throw error;
        }
    }

    async removeTag(customerId, tag) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (customer.tags) {
                customer.tags = customer.tags.filter(t => t !== tag);
                await this.updateCustomer(customerId, { tags: customer.tags });
            }

            return customer.tags;
        } catch (error) {
            console.error('Erro ao remover tag:', error);
            throw error;
        }
    }

    async createTag(tagName) {
        try {
            this.tags.add(tagName);
            return Array.from(this.tags);
        } catch (error) {
            console.error('Erro ao criar tag:', error);
            throw error;
        }
    }

    getTags() {
        return Array.from(this.tags);
    }

    // Exportação em PDF
    async exportToPDF(customers) {
        try {
            // TODO: Implementar geração real de PDF
            const content = {
                content: [
                    { text: 'Relatório de Clientes', style: 'header' },
                    { text: new Date().toLocaleDateString(), alignment: 'right' },
                    { text: '\n\n' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', '*', '*', '*'],
                            body: [
                                ['Nome', 'E-mail', 'Telefone', 'Status', 'Total Gasto'],
                                ...customers.map(c => [
                                    c.name,
                                    c.email,
                                    c.phone,
                                    c.status,
                                    formatCurrency(c.totalSpent || 0)
                                ])
                            ]
                        }
                    }
                ],
                styles: {
                    header: {
                        fontSize: 22,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    }
                }
            };

            return content;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    // Sistema de Notificações Automáticas
    startAutoChecks() {
        // Verificar clientes inativos
        setInterval(async () => {
            try {
                const inactiveCustomers = await this.getInactiveCustomers(30);
                if (inactiveCustomers.length > 0) {
                    notifications.info(`${inactiveCustomers.length} clientes estão inativos há mais de 30 dias`);
                }
            } catch (error) {
                console.error('Erro ao verificar clientes inativos:', error);
            }
        }, 24 * 60 * 60 * 1000); // Verificar diariamente

        // Verificar aniversariantes
        setInterval(async () => {
            try {
                const customers = await this.getCustomers();
                const today = new Date();
                
                const birthdays = customers.filter(customer => {
                    if (!customer.birthDate) return false;
                    const birth = new Date(customer.birthDate);
                    return birth.getDate() === today.getDate() && 
                           birth.getMonth() === today.getMonth();
                });

                if (birthdays.length > 0) {
                    notifications.info(`${birthdays.length} clientes fazem aniversário hoje!`);
                }
            } catch (error) {
                console.error('Erro ao verificar aniversariantes:', error);
            }
        }, 24 * 60 * 60 * 1000); // Verificar diariamente
    }

    // Busca Avançada
    async searchCustomers(query = {}) {
        try {
            let customers = await this.getCustomers();

            // Filtrar por texto
            if (query.text) {
                const search = query.text.toLowerCase();
                customers = customers.filter(customer => 
                    customer.name.toLowerCase().includes(search) ||
                    customer.email.toLowerCase().includes(search) ||
                    customer.phone.includes(search) ||
                    customer.cpf?.includes(search) ||
                    customer.notes?.toLowerCase().includes(search)
                );
            }

            // Filtrar por tags
            if (query.tags && query.tags.length > 0) {
                customers = customers.filter(customer =>
                    customer.tags?.some(tag => query.tags.includes(tag))
                );
            }

            // Filtrar por faixa de gastos
            if (query.minSpent !== undefined) {
                customers = customers.filter(customer =>
                    (customer.totalSpent || 0) >= query.minSpent
                );
            }
            if (query.maxSpent !== undefined) {
                customers = customers.filter(customer =>
                    (customer.totalSpent || 0) <= query.maxSpent
                );
            }

            // Filtrar por data de cadastro
            if (query.startDate) {
                const start = new Date(query.startDate);
                customers = customers.filter(customer =>
                    new Date(customer.createdAt) >= start
                );
            }
            if (query.endDate) {
                const end = new Date(query.endDate);
                customers = customers.filter(customer =>
                    new Date(customer.createdAt) <= end
                );
            }

            // Filtrar por localização
            if (query.city) {
                customers = customers.filter(customer =>
                    customer.city?.toLowerCase() === query.city.toLowerCase()
                );
            }
            if (query.state) {
                customers = customers.filter(customer =>
                    customer.state?.toLowerCase() === query.state.toLowerCase()
                );
            }

            // Ordenação
            if (query.sortBy) {
                customers.sort((a, b) => {
                    switch (query.sortBy) {
                        case 'name':
                            return a.name.localeCompare(b.name);
                        case 'created':
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        case 'spent':
                            return (b.totalSpent || 0) - (a.totalSpent || 0);
                        case 'purchases':
                            return (b.totalPurchases || 0) - (a.totalPurchases || 0);
                        default:
                            return 0;
                    }
                });
            }

            return customers;
        } catch (error) {
            console.error('Erro na busca avançada:', error);
            throw error;
        }
    }

    // Sistema de Metas
    async setCustomerGoals(customerId, goals) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            const updatedGoals = {
                ...customer.goals,
                ...goals,
                updatedAt: new Date().toISOString()
            };

            await this.updateCustomer(customerId, { goals: updatedGoals });
            return updatedGoals;
        } catch (error) {
            console.error('Erro ao definir metas:', error);
            throw error;
        }
    }

    async checkGoalsProgress(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer || !customer.goals) return null;

            const progress = {
                sales: {
                    current: customer.totalPurchases || 0,
                    target: customer.goals.targetPurchases || 0,
                    percentage: 0
                },
                revenue: {
                    current: customer.totalSpent || 0,
                    target: customer.goals.targetRevenue || 0,
                    percentage: 0
                },
                frequency: {
                    current: 0,
                    target: customer.goals.targetFrequency || 0,
                    percentage: 0
                }
            };

            // Calcular porcentagens
            progress.sales.percentage = (progress.sales.current / progress.sales.target) * 100;
            progress.revenue.percentage = (progress.revenue.current / progress.revenue.target) * 100;

            // Calcular frequência média de compras
            if (customer.lastPurchase) {
                const daysSinceFirst = Math.floor(
                    (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24)
                );
                progress.frequency.current = customer.totalPurchases / (daysSinceFirst / 30);
                progress.frequency.percentage = (progress.frequency.current / progress.frequency.target) * 100;
            }

            return progress;
        } catch (error) {
            console.error('Erro ao verificar progresso:', error);
            throw error;
        }
    }

    // Integração com Marketing
    async setMarketingPreferences(customerId, preferences) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            const marketingPrefs = {
                ...customer.marketingPreferences,
                ...preferences,
                updatedAt: new Date().toISOString()
            };

            await this.updateCustomer(customerId, { marketingPreferences: marketingPrefs });
            return marketingPrefs;
        } catch (error) {
            console.error('Erro ao definir preferências de marketing:', error);
            throw error;
        }
    }

    async addCommunicationLog(customerId, communication) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!customer.communicationHistory) {
                customer.communicationHistory = [];
            }

            const log = {
                id: Date.now().toString(),
                ...communication,
                timestamp: new Date().toISOString()
            };

            customer.communicationHistory.unshift(log);
            await this.updateCustomer(customerId, { 
                communicationHistory: customer.communicationHistory 
            });

            return log;
        } catch (error) {
            console.error('Erro ao registrar comunicação:', error);
            throw error;
        }
    }

    async getMarketingSegments() {
        return Array.from(this.marketingSegments);
    }

    async updateMarketingSegment(customerId, segment) {
        try {
            if (!this.marketingSegments.has(segment)) {
                throw new Error('Segmento inválido');
            }

            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            await this.updateCustomer(customerId, { 
                marketingSegment: segment,
                segmentUpdatedAt: new Date().toISOString()
            });

            return segment;
        } catch (error) {
            console.error('Erro ao atualizar segmento:', error);
            throw error;
        }
    }

    async generateMarketingReport() {
        try {
            const customers = await this.getCustomers();
            const report = {
                segments: {},
                communicationStats: {
                    total: 0,
                    byType: {},
                    byChannel: {}
                },
                preferences: {
                    email: 0,
                    sms: 0,
                    whatsapp: 0,
                    phone: 0
                }
            };

            // Inicializar contadores de segmentos
            for (const segment of this.marketingSegments) {
                report.segments[segment] = 0;
            }

            // Processar dados dos clientes
            customers.forEach(customer => {
                // Contar segmentos
                if (customer.marketingSegment) {
                    report.segments[customer.marketingSegment]++;
                }

                // Contar preferências de comunicação
                if (customer.marketingPreferences) {
                    Object.entries(customer.marketingPreferences).forEach(([channel, enabled]) => {
                        if (enabled && report.preferences[channel] !== undefined) {
                            report.preferences[channel]++;
                        }
                    });
                }

                // Processar histórico de comunicações
                if (customer.communicationHistory) {
                    customer.communicationHistory.forEach(comm => {
                        report.communicationStats.total++;
                        
                        // Contar por tipo
                        report.communicationStats.byType[comm.type] = 
                            (report.communicationStats.byType[comm.type] || 0) + 1;
                        
                        // Contar por canal
                        report.communicationStats.byChannel[comm.channel] = 
                            (report.communicationStats.byChannel[comm.channel] || 0) + 1;
                    });
                }
            });

            return report;
        } catch (error) {
            console.error('Erro ao gerar relatório de marketing:', error);
            throw error;
        }
    }

    // Sistema de Recomendações Inteligentes
    async generateRecommendations(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            const history = await this.getCustomerPurchases(customerId);
            const recommendations = {
                products: [],
                categories: [],
                priceRange: { min: 0, max: 0 },
                bestTimeToContact: null,
                suggestedActions: []
            };

            // Análise de produtos frequentes
            if (history.stats.frequentProducts.length > 0) {
                const similarProducts = await this.findSimilarProducts(
                    history.stats.frequentProducts.map(p => p.id)
                );
                recommendations.products = similarProducts;
            }

            // Análise de categorias preferidas
            const categories = this.analyzePurchaseCategories(history.purchases);
            recommendations.categories = categories;

            // Análise de faixa de preço
            if (history.stats.totalPurchases > 0) {
                const avgTicket = history.stats.totalSpent / history.stats.totalPurchases;
                recommendations.priceRange = {
                    min: avgTicket * 0.7,
                    max: avgTicket * 1.3
                };
            }

            // Análise de melhor horário para contato
            recommendations.bestTimeToContact = this.analyzeBestContactTime(history.purchases);

            // Sugestões de ações
            recommendations.suggestedActions = this.generateActionSuggestions(customer, history);

            return recommendations;
        } catch (error) {
            console.error('Erro ao gerar recomendações:', error);
            throw error;
        }
    }

    async findSimilarProducts(productIds) {
        try {
            // TODO: Implementar integração com sistema de produtos
            // Simulação
            return [
                { id: '1', name: 'Produto Similar 1', similarity: 0.9 },
                { id: '2', name: 'Produto Similar 2', similarity: 0.8 }
            ];
        } catch (error) {
            console.error('Erro ao buscar produtos similares:', error);
            throw error;
        }
    }

    analyzePurchaseCategories(purchases) {
        const categories = {};
        
        purchases.forEach(purchase => {
            purchase.items.forEach(item => {
                if (item.category) {
                    categories[item.category] = (categories[item.category] || 0) + 1;
                }
            });
        });

        return Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => ({
                category,
                count,
                percentage: (count / purchases.length) * 100
            }));
    }

    analyzeBestContactTime(purchases) {
        const timeSlots = {};
        
        purchases.forEach(purchase => {
            const hour = new Date(purchase.date).getHours();
            const slot = Math.floor(hour / 3) * 3; // Slots de 3 horas
            timeSlots[slot] = (timeSlots[slot] || 0) + 1;
        });

        const bestSlot = Object.entries(timeSlots)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            startHour: parseInt(bestSlot[0]),
            endHour: parseInt(bestSlot[0]) + 3,
            confidence: (bestSlot[1] / purchases.length) * 100
        };
    }

    generateActionSuggestions(customer, history) {
        const suggestions = [];

        // Verificar inatividade
        if (customer.lastPurchase) {
            const daysSinceLastPurchase = Math.floor(
                (new Date() - new Date(customer.lastPurchase)) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSinceLastPurchase > 30) {
                suggestions.push({
                    type: 'reactivation',
                    priority: 'high',
                    action: 'Enviar oferta personalizada de reativação',
                    reason: 'Cliente inativo há mais de 30 dias'
                });
            }
        }

        // Verificar potencial de upgrade
        if (customer.loyaltyPoints > 0) {
            const nextLevel = this.getNextLoyaltyLevel(customer.loyaltyLevel);
            if (nextLevel) {
                suggestions.push({
                    type: 'upgrade',
                    priority: 'medium',
                    action: `Incentivar upgrade para nível ${nextLevel}`,
                    reason: 'Cliente próximo do próximo nível de fidelidade'
                });
            }
        }

        // Verificar padrões de compra
        if (history.stats.frequentProducts.length > 0) {
            suggestions.push({
                type: 'cross_sell',
                priority: 'medium',
                action: 'Oferecer produtos complementares',
                reason: 'Cliente tem padrão de compra estabelecido'
            });
        }

        return suggestions;
    }

    getNextLoyaltyLevel(currentLevel) {
        const levels = ['bronze', 'prata', 'ouro', 'platina', 'diamante'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }

    // Integração com Redes Sociais
    async connectSocialNetwork(customerId, network, profile) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!this.socialNetworks.includes(network)) {
                throw new Error('Rede social não suportada');
            }

            if (!customer.socialProfiles) {
                customer.socialProfiles = {};
            }

            customer.socialProfiles[network] = {
                ...profile,
                connectedAt: new Date().toISOString()
            };

            await this.updateCustomer(customerId, {
                socialProfiles: customer.socialProfiles
            });

            // Iniciar monitoramento
            this.startSocialMonitoring(customerId, network);

            return customer.socialProfiles;
        } catch (error) {
            console.error('Erro ao conectar rede social:', error);
            throw error;
        }
    }

    async disconnectSocialNetwork(customerId, network) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer || !customer.socialProfiles) return;

            delete customer.socialProfiles[network];
            await this.updateCustomer(customerId, {
                socialProfiles: customer.socialProfiles
            });

            return customer.socialProfiles;
        } catch (error) {
            console.error('Erro ao desconectar rede social:', error);
            throw error;
        }
    }

    startSocialMonitoring(customerId, network) {
        // TODO: Implementar monitoramento real de redes sociais
        console.log(`Iniciando monitoramento de ${network} para cliente ${customerId}`);
    }

    async getSocialMentions(customerId, filters = {}) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer || !customer.socialProfiles) return [];

            // TODO: Implementar busca real de menções
            // Simulação
            return [
                {
                    network: 'twitter',
                    type: 'mention',
                    content: 'Ótimo atendimento!',
                    sentiment: 'positive',
                    date: new Date().toISOString()
                }
            ];
        } catch (error) {
            console.error('Erro ao buscar menções:', error);
            throw error;
        }
    }

    async analyzeSocialEngagement(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer || !customer.socialProfiles) return null;

            const analysis = {
                totalMentions: 0,
                sentimentAnalysis: {
                    positive: 0,
                    neutral: 0,
                    negative: 0
                },
                engagementRate: 0,
                topPosts: [],
                reachEstimate: 0
            };

            // TODO: Implementar análise real de engajamento
            // Simulação
            analysis.totalMentions = 10;
            analysis.sentimentAnalysis = {
                positive: 60,
                neutral: 30,
                negative: 10
            };
            analysis.engagementRate = 2.5;
            analysis.reachEstimate = 1000;

            return analysis;
        } catch (error) {
            console.error('Erro ao analisar engajamento:', error);
            throw error;
        }
    }

    async scheduleSocialPost(customerId, post) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer || !customer.socialProfiles) {
                throw new Error('Perfis sociais não encontrados');
            }

            // TODO: Implementar agendamento real de posts
            const scheduledPost = {
                id: Date.now().toString(),
                ...post,
                status: 'scheduled',
                scheduledFor: post.date,
                createdAt: new Date().toISOString()
            };

            if (!customer.scheduledPosts) {
                customer.scheduledPosts = [];
            }

            customer.scheduledPosts.push(scheduledPost);
            await this.updateCustomer(customerId, {
                scheduledPosts: customer.scheduledPosts
            });

            return scheduledPost;
        } catch (error) {
            console.error('Erro ao agendar post:', error);
            throw error;
        }
    }

    // Melhorar análise de comportamento com dados sociais
    async analyzeCustomerBehavior(customerId) {
        try {
            const analysis = await super.analyzeCustomerBehavior(customerId);
            const socialAnalysis = await this.analyzeSocialEngagement(customerId);

            if (socialAnalysis) {
                analysis.social = socialAnalysis;
                
                // Adicionar sugestões baseadas em dados sociais
                if (socialAnalysis.sentimentAnalysis.negative > 20) {
                    analysis.suggestions.push('Investigar feedback negativo nas redes sociais');
                }
                if (socialAnalysis.engagementRate < 1) {
                    analysis.suggestions.push('Aumentar engajamento nas redes sociais');
                }
            }

            // Adicionar recomendações
            const recommendations = await this.generateRecommendations(customerId);
            analysis.recommendations = recommendations;

            return analysis;
        } catch (error) {
            console.error('Erro ao analisar comportamento:', error);
            throw error;
        }
    }

    // Sistema de Fidelidade
    async calculateLoyaltyPoints(customerId) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            const history = await this.getCustomerPurchases(customerId);
            let points = 0;

            // Pontos por compras
            points += (customer.totalSpent || 0) * 0.1; // 0.1 ponto por real gasto
            points += (customer.totalPurchases || 0) * 50; // 50 pontos por compra

            // Bônus por frequência
            if (customer.lastPurchase) {
                const daysSinceLastPurchase = Math.floor(
                    (new Date() - new Date(customer.lastPurchase)) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceLastPurchase < 30) points += 100; // Bônus de cliente ativo
            }

            // Bônus por tempo de cadastro
            const monthsSinceRegistration = Math.floor(
                (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24 * 30)
            );
            points += monthsSinceRegistration * 10; // 10 pontos por mês de cadastro

            // Atualizar pontos e nível
            const level = this.calculateLoyaltyLevel(points);
            await this.updateCustomer(customerId, {
                loyaltyPoints: points,
                loyaltyLevel: level
            });

            return { points, level };
        } catch (error) {
            console.error('Erro ao calcular pontos de fidelidade:', error);
            throw error;
        }
    }

    calculateLoyaltyLevel(points) {
        const levels = Object.entries(this.loyaltyLevels)
            .sort(([,a], [,b]) => b.minPoints - a.minPoints);
        
        for (const [level, config] of levels) {
            if (points >= config.minPoints) return level;
        }
        return 'bronze';
    }

    async redeemLoyaltyPoints(customerId, points) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!customer.loyaltyPoints || customer.loyaltyPoints < points) {
                throw new Error('Pontos insuficientes');
            }

            const updatedPoints = customer.loyaltyPoints - points;
            const level = this.calculateLoyaltyLevel(updatedPoints);

            await this.updateCustomer(customerId, {
                loyaltyPoints: updatedPoints,
                loyaltyLevel: level
            });

            // Registrar resgate
            await this.addLoyaltyTransaction(customerId, {
                type: 'redeem',
                points: points,
                timestamp: new Date().toISOString()
            });

            return { updatedPoints, level };
        } catch (error) {
            console.error('Erro ao resgatar pontos:', error);
            throw error;
        }
    }

    async addLoyaltyTransaction(customerId, transaction) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!customer.loyaltyHistory) {
                customer.loyaltyHistory = [];
            }

            customer.loyaltyHistory.unshift(transaction);
            await this.updateCustomer(customerId, {
                loyaltyHistory: customer.loyaltyHistory
            });

            return transaction;
        } catch (error) {
            console.error('Erro ao registrar transação de fidelidade:', error);
            throw error;
        }
    }

    // Integração com Calendário
    async scheduleEvent(customerId, event) {
        try {
            const customer = await this.getCustomer(customerId);
            if (!customer) throw new Error('Cliente não encontrado');

            if (!customer.events) {
                customer.events = [];
            }

            const newEvent = {
                id: Date.now().toString(),
                ...event,
                customerId,
                createdAt: new Date().toISOString()
            };

            customer.events.push(newEvent);
            await this.updateCustomer(customerId, { events: customer.events });

            // Agendar notificação
            if (event.reminder) {
                const reminderDate = new Date(event.date);
                reminderDate.setMinutes(reminderDate.getMinutes() - event.reminder);
                
                this.scheduleNotification(customerId, {
                    type: 'event_reminder',
                    eventId: newEvent.id,
                    scheduledFor: reminderDate,
                    message: `Lembrete: ${event.title} com ${customer.name}`
                });
            }

            return newEvent;
        } catch (error) {
            console.error('Erro ao agendar evento:', error);
            throw error;
        }
    }

    async getUpcomingEvents(days = 7) {
        try {
            const customers = await this.getCustomers();
            const now = new Date();
            const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            const events = [];
            for (const customer of customers) {
                if (customer.events) {
                    const customerEvents = customer.events
                        .filter(event => {
                            const eventDate = new Date(event.date);
                            return eventDate >= now && eventDate <= future;
                        })
                        .map(event => ({
                            ...event,
                            customerName: customer.name,
                            customerEmail: customer.email
                        }));
                    events.push(...customerEvents);
                }
            }

            return events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Erro ao buscar eventos futuros:', error);
            throw error;
        }
    }

    // Automação de Tarefas
    async createAutomation(rule) {
        try {
            if (!this.automationRules) {
                this.automationRules = [];
            }

            const newRule = {
                id: Date.now().toString(),
                ...rule,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            this.automationRules.push(newRule);
            return newRule;
        } catch (error) {
            console.error('Erro ao criar automação:', error);
            throw error;
        }
    }

    async executeAutomations() {
        if (!this.automationRules) return;

        try {
            const customers = await this.getCustomers();
            
            for (const rule of this.automationRules) {
                if (rule.status !== 'active') continue;

                const matchingCustomers = customers.filter(customer => {
                    switch (rule.condition.type) {
                        case 'inactivity':
                            return this.checkInactivity(customer, rule.condition.days);
                        case 'spending':
                            return this.checkSpending(customer, rule.condition.amount);
                        case 'loyalty':
                            return this.checkLoyalty(customer, rule.condition.level);
                        default:
                            return false;
                    }
                });

                for (const customer of matchingCustomers) {
                    await this.executeAutomationAction(customer, rule.action);
                }
            }
        } catch (error) {
            console.error('Erro ao executar automações:', error);
            throw error;
        }
    }

    async executeAutomationAction(customer, action) {
        try {
            switch (action.type) {
                case 'tag':
                    await this.addTag(customer.id, action.tag);
                    break;
                case 'segment':
                    await this.updateMarketingSegment(customer.id, action.segment);
                    break;
                case 'notification':
                    await this.addCommunicationLog(customer.id, {
                        type: 'automated',
                        channel: action.channel,
                        message: action.message
                    });
                    break;
                case 'loyalty':
                    await this.addLoyaltyTransaction(customer.id, {
                        type: 'bonus',
                        points: action.points,
                        reason: action.reason
                    });
                    break;
            }
        } catch (error) {
            console.error('Erro ao executar ação automática:', error);
            throw error;
        }
    }

    // Histórico de Alterações
    async trackChange(customerId, change) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            const changeLog = {
                ...change,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user: auth.getCurrentUser()?.name || 'Sistema'
            };

            await this.db.collection('customers').doc(customerId)
                .collection('changes').add(changeLog);

            return changeLog;
        } catch (error) {
            console.error('Erro ao registrar alteração:', error);
            throw error;
        }
    }

    async getChangeHistory(customerId, filters = {}) {
        try {
            if (!this.db) throw new Error("Firestore não inicializado");

            let query = this.db.collection('customers').doc(customerId)
                .collection('changes')
                .orderBy('timestamp', 'desc');

            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.startDate) {
                query = query.where('timestamp', '>=', new Date(filters.startDate));
            }
            if (filters.endDate) {
                query = query.where('timestamp', '<=', new Date(filters.endDate));
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar histórico de alterações:', error);
            throw error;
        }
    }
}

// Criar instância global
const customerService = new CustomerService();

// Exportar para uso em outros módulos
export default customerService; 