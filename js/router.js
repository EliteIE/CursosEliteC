// Serviço de Rotas
import config from './config.js';

class RouterService {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeEach = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Registrar rotas
        this.registerRoutes();

        // Configurar listener de navegação
        window.addEventListener('popstate', () => this.handleRoute());

        // Configurar links de navegação
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                this.navigate(link.dataset.route);
            }
        });

        // Navegar para rota inicial
        this.handleRoute();

        this.initialized = true;
        console.log('✅ Serviço de rotas inicializado');
    }

    async registerRoutes() {
        try {
            // Importar páginas dinamicamente
            const Dashboard = (await import('./pages/Dashboard.js')).default;
            const Login = (await import('./pages/Login.js')).default;
            const Sales = (await import('./pages/Sales.js')).default;
            const Products = (await import('./pages/Products.js')).default;
            const Customers = (await import('./pages/Customers.js')).default;

            // Registrar rotas
            this.routes.set('dashboard', Dashboard);
            this.routes.set('login', Login);
            this.routes.set('sales', Sales);
            this.routes.set('products', Products);
            this.routes.set('customers', Customers);

            console.log('✅ Rotas registradas:', Array.from(this.routes.keys()));
        } catch (error) {
            console.error('❌ Erro ao registrar rotas:', error);
            throw error;
        }
    }

    async handleRoute() {
        try {
            // Obter rota atual da URL
            const path = window.location.pathname.replace(/^\//, '') || config.routes.default;
            
            // Verificar se rota existe
            if (!this.routes.has(path)) {
                console.warn(`⚠️ Rota não encontrada: ${path}`);
                this.navigate(config.routes.default);
                return;
            }

            // Executar hook beforeEach
            if (this.beforeEach) {
                const shouldProceed = await this.beforeEach(path, this.currentRoute);
                if (!shouldProceed) return;
            }

            // Obter componente da rota
            const Component = this.routes.get(path);
            
            // Renderizar componente
            const mainContent = document.getElementById('mainContent');
            if (!mainContent) {
                console.error('❌ Elemento #mainContent não encontrado');
                return;
            }

            // Limpar conteúdo atual
            mainContent.innerHTML = '';
            
            try {
                // Renderizar novo componente
                const component = new Component();
                mainContent.appendChild(component);

                // Atualizar rota atual
                this.currentRoute = path;
                
                // Atualizar links ativos
                this.updateActiveLinks();

                console.log('✅ Rota renderizada:', path);
            } catch (error) {
                console.error('❌ Erro ao renderizar componente:', error);
                throw error;
            }
        } catch (error) {
            console.error('❌ Erro ao processar rota:', error);
            throw error;
        }
    }

    navigate(path, replace = false) {
        // Não recarregar se já estiver na mesma rota
        if (path === this.currentRoute) return;

        // Atualizar URL
        const url = `/${path}`;
        if (replace) {
            window.history.replaceState(null, '', url);
        } else {
            window.history.pushState(null, '', url);
        }

        // Processar nova rota
        this.handleRoute();
    }

    updateActiveLinks() {
        // Remover classe ativa de todos os links
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active');
        });

        // Adicionar classe ativa ao link atual
        document.querySelectorAll(`[data-route="${this.currentRoute}"]`).forEach(link => {
            link.classList.add('active');
        });
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    isPublicRoute(path) {
        return config.routes.public.includes(path);
    }
}

// Exportar instância única
const router = new RouterService();
export default router; 
