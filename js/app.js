// Arquivo principal da aplicação
import auth from './auth.js';
import router from './router.js';
import notifications from './notifications.js';
import config from './config.js';

class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Inicializar autenticação
            await auth.init();

            // Configurar interceptação de navegação
            this.setupNavigationGuard();

            // Inicializar router
            router.init();

            // Configurar tema
            this.setupTheme();

            // Configurar eventos globais
            this.setupGlobalEvents();

            this.initialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            notifications.error('Erro ao inicializar o sistema');
        }
    }

    setupNavigationGuard() {
        // Interceptar navegação para verificar autenticação
        const publicRoutes = ['login'];

        router.beforeEach = (to, from, next) => {
            if (!publicRoutes.includes(to) && !auth.isAuthenticated()) {
                notifications.warning('Por favor, faça login para continuar');
                return router.navigate('login');
            }
            next();
        };
    }

    setupTheme() {
        // Aplicar tema inicial
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.dataset.theme = theme;

        // Observar mudanças no tema do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
            }
        });
    }

    setupGlobalEvents() {
        // Interceptar erros não tratados
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            notifications.error('Ocorreu um erro inesperado');
        });

        // Interceptar promessas rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            notifications.error('Ocorreu um erro inesperado');
        });

        // Monitorar estado da conexão
        window.addEventListener('online', () => {
            notifications.success('Conexão restabelecida');
        });

        window.addEventListener('offline', () => {
            notifications.warning('Você está offline');
        });

        // Interceptar cliques em botões de ação comuns
        document.addEventListener('click', (e) => {
            // Botões de logout
            if (e.target.matches('[data-action="logout"]')) {
                e.preventDefault();
                auth.logout();
                router.navigate('login');
            }

            // Botões de navegação do menu
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.dataset.route;
                router.navigate(route);
            }
        });

        // Configurar atalhos de teclado globais
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para abrir pesquisa
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // TODO: Implementar pesquisa global
            }

            // Esc para fechar modais/dropdowns
            if (e.key === 'Escape') {
                // TODO: Implementar fechamento de modais
            }
        });
    }
}

// Criar e exportar instância global
const app = new App();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
});

export default app; 