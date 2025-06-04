// Sistema de Rotas
import auth from './auth.js';
import notifications from './notifications.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
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
        const path = window.location.hash.slice(1) || this.defaultRoute;
        await this.navigate(path, true);
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
        // Registrar rotas padrão
        this.registerDefaultRoutes();
        
        // Lidar com rota inicial
        this.handleRoute();
    }

    // Registrar rotas padrão do sistema
    registerDefaultRoutes() {
        // Dashboard
        this.register('dashboard', {
            component: () => import('./pages/Dashboard.js'),
            title: 'Dashboard',
            permission: 'view_dashboard'
        });

        // Produtos
        this.register('products', {
            component: () => import('./pages/Products.js'),
            title: 'Produtos',
            permission: 'view_products'
        });

        // Vendas
        this.register('sales', {
            component: () => import('./pages/Sales.js'),
            title: 'Vendas',
            permission: 'view_sales'
        });

        // Clientes
        this.register('customers', {
            component: () => import('./pages/Customers.js'),
            title: 'Clientes',
            permission: 'view_customers'
        });

        // Relatórios
        this.register('reports', {
            component: () => import('./pages/Reports.js'),
            title: 'Relatórios',
            permission: 'view_reports'
        });

        // Configurações
        this.register('settings', {
            component: () => import('./pages/Settings.js'),
            title: 'Configurações',
            permission: 'manage_settings'
        });

        // Login
        this.register('login', {
            component: () => import('./pages/Login.js'),
            title: 'Login',
            layout: 'fullscreen'
        });
    }
}

// Criar instância global
const router = new Router();

// Exportar para uso em outros módulos
export default router; 