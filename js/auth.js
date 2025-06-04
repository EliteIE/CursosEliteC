// Sistema de Autenticação e Controle de Acesso
import notifications from './notifications.js';

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.roles = {
            'admin': {
                name: 'Dono/Gerente',
                permissions: ['*'] // Acesso total
            },
            'stock': {
                name: 'Controlador de Estoque',
                permissions: [
                    'view_products',
                    'manage_products',
                    'view_stock',
                    'manage_stock',
                    'view_reports'
                ]
            },
            'sales': {
                name: 'Vendedor',
                permissions: [
                    'view_products',
                    'view_customers',
                    'manage_customers',
                    'create_sales',
                    'view_own_sales'
                ]
            }
        };
    }

    async init() {
        // Verificar se há uma sessão ativa
        const session = localStorage.getItem('user_session');
        if (session) {
            try {
                const userData = JSON.parse(session);
                await this.validateSession(userData);
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        try {
            // Aqui você implementaria a chamada real para sua API de autenticação
            const response = await this.mockAuthCall(email, password);
            
            if (response.success) {
                this.currentUser = {
                    id: response.user.id,
                    name: response.user.name,
                    email: response.user.email,
                    role: response.user.role,
                    permissions: this.roles[response.user.role].permissions
                };

                // Salvar sessão
                localStorage.setItem('user_session', JSON.stringify(this.currentUser));
                
                notifications.success(`Bem-vindo, ${this.currentUser.name}!`);
                return true;
            }
        } catch (error) {
            console.error('Erro no login:', error);
            notifications.error('Erro ao fazer login. Tente novamente.');
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user_session');
        notifications.info('Você foi desconectado com sucesso.');
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Admin tem todas as permissões
        if (this.currentUser.permissions.includes('*')) return true;
        
        return this.currentUser.permissions.includes(permission);
    }

    async validateSession(userData) {
        // Aqui você implementaria a validação real do token com seu backend
        if (userData && userData.email && this.roles[userData.role]) {
            this.currentUser = userData;
            return true;
        }
        throw new Error('Sessão inválida');
    }

    // Mock para simulação de autenticação
    async mockAuthCall(email, password) {
        const testUsers = {
            'admin@elitecontrol.com': {
                id: '1',
                name: 'Administrador Elite',
                role: 'admin',
                email: 'admin@elitecontrol.com'
            },
            'estoque@elitecontrol.com': {
                id: '2',
                name: 'Controlador de Estoque',
                role: 'stock',
                email: 'estoque@elitecontrol.com'
            },
            'vendas@elitecontrol.com': {
                id: '3',
                name: 'Vendedor Elite',
                role: 'sales',
                email: 'vendas@elitecontrol.com'
            }
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                if (testUsers[email]) {
                    resolve({
                        success: true,
                        user: testUsers[email]
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Credenciais inválidas'
                    });
                }
            }, 500); // Simular delay de rede
        });
    }
}

// Criar instância global
const auth = new AuthSystem();

// Inicializar sistema de autenticação
auth.init().catch(console.error);

// Exportar para uso em outros módulos
export default auth; 