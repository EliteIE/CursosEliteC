// Sistema de Autenticação e Controle de Acesso
import config from './config.js';
import notifications from './notifications.js';

class AuthService {
    constructor() {
        this.auth = firebase.auth();
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Configurar observador de mudança de estado
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ Usuário autenticado:', user.email);
                } else {
                    console.log('❌ Usuário não autenticado');
                }
            });

            // Configurar persistência
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            
            this.initialized = true;
            console.log('✅ Serviço de autenticação inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar autenticação:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            notifications.success('Login realizado com sucesso');
            return result.user;
        } catch (error) {
            console.error('Erro no login:', error);
            notifications.error('Erro ao fazer login: ' + error.message);
            throw error;
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            notifications.info('Logout realizado com sucesso');
        } catch (error) {
            console.error('Erro no logout:', error);
            notifications.error('Erro ao fazer logout');
            throw error;
        }
    }

    async register(email, password, userData) {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Adicionar dados adicionais ao perfil
            await result.user.updateProfile({
                displayName: userData.name
            });

            // Salvar dados adicionais no Firestore
            await firebase.firestore().collection('users').doc(result.user.uid).set({
                ...userData,
                email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            notifications.success('Registro realizado com sucesso');
            return result.user;
        } catch (error) {
            console.error('Erro no registro:', error);
            notifications.error('Erro ao registrar: ' + error.message);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            notifications.success('Email de recuperação enviado');
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            notifications.error('Erro ao enviar email de recuperação');
            throw error;
        }
    }

    async updateProfile(data) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');

            await user.updateProfile(data);
            notifications.success('Perfil atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            notifications.error('Erro ao atualizar perfil');
            throw error;
        }
    }

    async updateEmail(newEmail) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');

            await user.updateEmail(newEmail);
            notifications.success('E-mail atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar e-mail:', error);
            throw error;
        }
    }

    async updatePassword(newPassword) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');

            await user.updatePassword(newPassword);
            notifications.success('Senha atualizada com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            throw error;
        }
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }

    isAuthenticated() {
        return !!this.auth.currentUser;
    }

    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }
}

// Criar instância global
const auth = new AuthService();

// Exportar para uso em outros módulos
export default auth; 
