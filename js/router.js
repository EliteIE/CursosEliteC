// Sistema de Rotas
import auth from './auth.js';
import notifications from './notifications.js';
import config from './config.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeEach = null;
        this.defaultRoute = 'dashboard';
        
        // Configurar listener para mudanças na URL
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Interceptar cliques em links
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                this.navigate(e.target.dataset.route);
            }
        });
    }

    // Registrar uma nova rota
    register(path, {
        component,
        title,
        permission = null,
        layout = 'default'
    }) {
        this.routes.set(path, { component, title, permission, layout });
    }

    // Navegar para uma rota
    async navigate(path, replace = false) {
        // Verificar se a rota existe
        if (!this.routes.has(path)) {
            notifications.error(`Página não encontrada: ${path}`);
            return this.navigate(this.defaultRoute);
        }

        const route = this.routes.get(path);

        // Verificar permissão
        if (route.permission && !auth.hasPermission(route.permission)) {
            notifications.error('Você não tem permissão para acessar esta página');
            return this.navigate(this.defaultRoute);
        }

        // Atualizar URL
        const url = `#${path}`;
        if (replace) {
            history.replaceState(null, '', url);
        } else {
            history.pushState(null, '', url);
        }

        // Atualizar título da página
        document.title = `${route.title} - EliteControl`;

        // Renderizar componente
        await this.renderComponent(route);

        this.currentRoute = path;
    }

    // Manipular mudança de rota
    async handleRoute() {
        const path = window.location.pathname.replace('/', '') || 'dashboard';
        const route = this.routes.get(path);

        if (!route) {
            console.error('Rota não encontrada:', path);
            return this.navigate('dashboard');
        }

        // Executar hook beforeEach
        if (this.beforeEach) {
            const next = () => this.loadRoute(route);
            this.beforeEach(path, this.currentRoute, next);
        } else {
            await this.loadRoute(route);
        }
    }

    // Renderizar componente da rota
    async renderComponent(route) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        try {
            // Limpar conteúdo atual
            mainContent.innerHTML = '<div class="loading">Carregando...</div>';

            // Carregar e renderizar novo componente
            const component = await route.component();
            mainContent.innerHTML = '';
            mainContent.appendChild(component);

            // Atualizar layout se necessário
            this.updateLayout(route.layout);

            // Scroll para o topo
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Erro ao renderizar componente:', error);
            notifications.error('Erro ao carregar a página');
        }
    }

    // Atualizar layout
    updateLayout(layout) {
        document.body.dataset.layout = layout;
        
        // Atualizar classes e elementos do layout conforme necessário
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('.header');
        
        if (layout === 'fullscreen') {
            sidebar?.classList.add('hidden');
            header?.classList.add('hidden');
        } else {
            sidebar?.classList.remove('hidden');
            header?.classList.remove('hidden');
        }
    }

    // Inicializar router
    init() {
        // Registrar rotas
        this.registerRoutes();
        
        // Lidar com rota inicial
        this.handleRoute();
    }

    // Registrar rotas padrão do sistema
    registerRoutes() {
        // Página inicial/Dashboard
        this.routes.set('dashboard', {
            template: '/dashboard.html',
            title: 'Dashboard - EliteControl',
            load: async () => {
                const module = await import('./pages/dashboard.js');
                return module.default;
            }
        });

        // Clientes
        this.routes.set('customers', {
            template: '/pages/customers.html',
            title: 'Clientes - EliteControl',
            load: async () => {
                const module = await import('./pages/customers.js');
                return module.default;
            }
        });

        // Vendas
        this.routes.set('sales', {
            template: '/pages/sales.html',
            title: 'Vendas - EliteControl',
            load: async () => {
                const module = await import('./pages/sales.js');
                return module.default;
            }
        });

        // Produtos
        this.routes.set('products', {
            template: '/pages/products.html',
            title: 'Produtos - EliteControl',
            load: async () => {
                const module = await import('./pages/products.js');
                return module.default;
            }
        });

        // Login
        this.routes.set('login', {
            template: '/pages/login.html',
            title: 'Login - EliteControl',
            load: async () => {
                const module = await import('./pages/login.js');
                return module.default;
            }
        });
    }

    async loadRoute(route) {
        try {
            // Carregar template
            const response = await fetch(route.template);
            const html = await response.text();

            // Atualizar conteúdo
            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = html;

            // Carregar e inicializar módulo da página
            const pageModule = await route.load();
            if (pageModule.init) {
                await pageModule.init();
            }

            // Atualizar título
            document.title = route.title;

            // Atualizar navegação
            this.updateNavigation();

        } catch (error) {
            console.error('Erro ao carregar rota:', error);
            // TODO: Mostrar página de erro
        }
    }

    updateNavigation() {
        // Atualizar links ativos no menu
        document.querySelectorAll('.nav-link').forEach(link => {
            const route = link.dataset.route;
            if (route === this.currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Criar instância global
const router = new Router();

// Exportar para uso em outros módulos
export default router; 
