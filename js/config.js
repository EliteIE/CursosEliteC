// Configurações Globais do Sistema
const config = {
    // Informações do Sistema
    system: {
        name: 'EliteControl',
        version: '2.0',
        description: 'Sistema de Gestão Inteligente',
        environment: process.env.NODE_ENV || 'development'
    },

    // Configurações de API
    api: {
        baseUrl: process.env.API_URL || 'http://localhost:3000',
        timeout: 30000, // 30 segundos
        retryAttempts: 3
    },

    // Configurações de Autenticação
    auth: {
        tokenKey: 'user_session',
        sessionDuration: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
        refreshThreshold: 30 * 60 * 1000 // 30 minutos em milissegundos
    },

    // Configurações de UI/UX
    ui: {
        theme: {
            dark: {
                primary: '#38BDF8',
                secondary: '#6366F1',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                surface: '#1E293B',
                background: '#0F172A',
                text: '#F1F5F9',
                muted: '#94A3B8',
                border: '#334155'
            },
            light: {
                primary: '#0EA5E9',
                secondary: '#4F46E5',
                success: '#059669',
                warning: '#D97706',
                danger: '#DC2626',
                surface: '#FFFFFF',
                background: '#F1F5F9',
                text: '#0F172A',
                muted: '#64748B',
                border: '#E2E8F0'
            }
        },
        animations: {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        toast: {
            duration: 5000,
            position: 'top-right'
        }
    },

    // Configurações de Produtos
    products: {
        pagination: {
            defaultLimit: 20,
            maxLimit: 100
        },
        image: {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            dimensions: {
                thumbnail: { width: 150, height: 150 },
                medium: { width: 300, height: 300 },
                large: { width: 800, height: 800 }
            }
        },
        cache: {
            duration: 5 * 60 * 1000, // 5 minutos
            maxItems: 1000
        },
        export: {
            formats: ['json', 'csv', 'xlsx'],
            batchSize: 500
        },
        categories: [
            { id: 'eletronicos', name: 'Eletrônicos' },
            { id: 'moveis', name: 'Móveis' },
            { id: 'decoracao', name: 'Decoração' },
            { id: 'vestuario', name: 'Vestuário' },
            { id: 'livros', name: 'Livros' },
            { id: 'alimentos', name: 'Alimentos' },
            { id: 'bebidas', name: 'Bebidas' },
            { id: 'esportes', name: 'Esportes' }
        ],
        status: [
            { id: 'active', name: 'Ativo', color: 'success' },
            { id: 'inactive', name: 'Inativo', color: 'muted' },
            { id: 'low_stock', name: 'Estoque Baixo', color: 'warning' },
            { id: 'out_of_stock', name: 'Sem Estoque', color: 'danger' }
        ],
        stockAlert: {
            lowThreshold: 10,
            criticalThreshold: 5,
            notifyDays: 7 // Alertar quando o estoque estiver para acabar em X dias
        }
    },

    // Configurações de Cache
    cache: {
        prefix: 'elite_control_',
        defaultDuration: 30 * 60 * 1000 // 30 minutos
    },

    // Configurações de Log
    logging: {
        level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
        enabled: true,
        console: true,
        file: false
    },

    // Configurações de Vendas
    sales: {
        maxCartItems: 50,
        minOrderValue: 0,
        taxRate: 0.18, // 18%
        discountLimits: {
            percentage: 0.25, // Máximo de 25% de desconto
            value: 1000 // Máximo de R$ 1000 de desconto
        }
    },

    // Configurações de Estoque
    inventory: {
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        autoReorderEnabled: true,
        reorderPoint: 15,
        maxStockLevel: 1000
    },

    // Configurações de Relatórios
    reports: {
        defaultDateRange: 30, // últimos 30 dias
        maxDateRange: 365, // máximo de 1 ano
        exportFormats: ['pdf', 'xlsx', 'csv'],
        autoGenerate: true,
        scheduledReports: {
            daily: '00:00',
            weekly: 'Sunday 23:59',
            monthly: 'Last day 23:59'
        }
    },

    // Configurações de Performance
    performance: {
        maxConcurrentRequests: 6,
        cacheEnabled: true,
        minifyAssets: process.env.NODE_ENV === 'production',
        compression: process.env.NODE_ENV === 'production'
    },

    // Configurações de Segurança
    security: {
        passwordMinLength: 8,
        passwordRequirements: {
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: true
        },
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutos
        sessionTimeout: 30 * 60 * 1000 // 30 minutos
    },

    app: {
        name: 'EliteControl',
        version: '1.0.0',
        environment: 'development'
    },

    firebase: {
        apiKey: "AIzaSyD1t6vbSqI2s1Wsw3eGSMozWaZSTMDfukA",
        authDomain: "elitecontrol-765fd.firebaseapp.com",
        projectId: "elitecontrol-765fd",
        storageBucket: "elitecontrol-765fd.appspot.com",
        messagingSenderId: "939140418428",
        appId: "1:939140418428:web:beeca76505e69329baf2f9",
        measurementId: "G-PNDBZB9HR5"
    },

    theme: {
        default: 'dark',
        supportedThemes: ['light', 'dark']
    },

    routes: {
        default: 'dashboard',
        public: ['login', 'register', 'forgot-password']
    }
};

// Função para obter configurações específicas
export function getConfig(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], config);
}

// Função para verificar o ambiente
export function isProduction() {
    return config.system.environment === 'production';
}

export function isDevelopment() {
    return config.system.environment === 'development';
}

// Exportar configuração completa
export default config; 
