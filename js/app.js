// Arquivo principal da aplicação
import auth from './auth.js';
import router from './router.js';
import notifications from './notifications.js';
import config from './config.js';
import { db } from './firebase-config.js';

class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Verificar se o Firebase está disponível
            if (!window.firebase) {
                throw new Error('Firebase não está disponível');
            }

            // Verificar conexão com o Firebase
            try {
                await db.collection('_health').doc('check').set({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Conexão com Firebase verificada');
            } catch (error) {
                console.error('❌ Erro ao verificar conexão:', error);
                notifications.error('Erro ao conectar com o servidor');
                return;
            }

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
            console.log('✅ App inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar app:', error);
            notifications.error('Erro ao inicializar o sistema');
        }
    }

    setupNavigationGuard() {
        const publicRoutes = ['login', 'register', 'forgot-password'];

        router.beforeEach = (to, from, next) => {
            if (!publicRoutes.includes(to) && !auth.isAuthenticated()) {
                notifications.warning('Por favor, faça login para continuar');
                return router.navigate('login');
            }
            next();
        };
    }

    setupTheme() {
        const theme = localStorage.getItem('theme') || config.theme.default;
        document.documentElement.dataset.theme = theme;

        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
            }
        });
    }

    setupGlobalEvents() {
        // Interceptar erros não tratados
        window.addEventListener('error', (event) => {
            console.error('Erro global:', event.error);
            notifications.error('Ocorreu um erro inesperado');
        });

        // Interceptar promessas rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promessa rejeitada não tratada:', event.reason);
            notifications.error('Ocorreu um erro inesperado');
        });

        // Monitorar estado da conexão
        window.addEventListener('online', () => {
            notifications.success('Conexão restabelecida');
        });

        window.addEventListener('offline', () => {
            notifications.warning('Você está offline');
        });

        // Interceptar cliques em botões de ação
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                e.preventDefault();
                auth.logout();
                router.navigate('login');
            }

            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.dataset.route;
                router.navigate(route);
            }
        });

        // Configurar atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para abrir pesquisa
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // TODO: Implementar pesquisa global
            }

            // Esc para fechar modais
            if (e.key === 'Escape') {
                // TODO: Implementar fechamento de modais
            }
        });
    }
}

// Criar instância global
const app = new App();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
});

export default app; 
