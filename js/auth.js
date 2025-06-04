// Sistema de Autenticação e Controle de Acesso
import config from './config.js';
import notifications from './notifications.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Verificar se o Firebase está disponível
            if (!window.firebase || !window.firebase.auth) {
                throw new Error('Firebase Auth não está disponível');
            }

            // Observar mudanças no estado de autenticação
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('Usuário autenticado:', user.email);
                } else {
                    console.log('Usuário não autenticado');
                }
            });

            this.initialized = true;
            console.log('AuthService inicializado');
        } catch (error) {
            console.error('Erro ao inicializar AuthService:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
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
            await firebase.auth().signOut();
            notifications.info('Logout realizado com sucesso');
        } catch (error) {
            console.error('Erro no logout:', error);
            notifications.error('Erro ao fazer logout');
            throw error;
        }
    }

    async register(email, password, userData) {
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
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
            await firebase.auth().sendPasswordResetEmail(email);
            notifications.success('Email de recuperação enviado');
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            notifications.error('Erro ao enviar email de recuperação');
            throw error;
        }
    }

    async updateProfile(data) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('Usuário não autenticado');

            // Atualizar perfil no Auth
            await user.updateProfile({
                displayName: data.name,
                photoURL: data.photoURL
            });

            // Atualizar dados no Firestore
            await firebase.firestore().collection('users').doc(user.uid).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            notifications.success('Perfil atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            notifications.error('Erro ao atualizar perfil');
            throw error;
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Criar instância global
const auth = new AuthService();

// Exportar para uso em outros módulos
export default auth; 
