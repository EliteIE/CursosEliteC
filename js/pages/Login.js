// Página de Login
import auth from '../auth.js';
import router from '../router.js';
import notifications from '../notifications.js';

export default function Login() {
    const container = document.createElement('div');
    container.className = 'login-container';
    
    container.innerHTML = `
        <div class="login-card">
            <div class="login-header">
                <h1 class="login-title">EliteControl</h1>
                <p class="login-subtitle">Sistema de Gestão Inteligente</p>
            </div>
            
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" required 
                           class="form-input" placeholder="seu@email.com">
                </div>
                
                <div class="form-group">
                    <label for="password">Senha</label>
                    <div class="password-input">
                        <input type="password" id="password" name="password" required 
                               class="form-input" placeholder="Sua senha">
                        <button type="button" class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div class="form-actions">
                    <label class="remember-me">
                        <input type="checkbox" name="remember">
                        <span>Lembrar-me</span>
                    </label>
                    <a href="#" class="forgot-password">Esqueceu a senha?</a>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    Entrar
                </button>
            </form>
            
            <div class="login-footer">
                <p>Não tem uma conta? <a href="#" class="register-link">Criar conta</a></p>
            </div>
        </div>
    `;

    // Adicionar eventos
    const form = container.querySelector('#loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.email.value;
        const password = form.password.value;
        const remember = form.remember.checked;
        
        try {
            // Desabilitar formulário
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Entrando...';
            
            // Fazer login
            await auth.login(email, password);
            
            // Se marcou "lembrar-me", persistir
            if (remember) {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            }
            
            // Redirecionar para dashboard
            router.navigate('dashboard');
            
        } catch (error) {
            console.error('Erro no login:', error);
            notifications.error('E-mail ou senha inválidos');
            
            // Reabilitar formulário
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
        }
    });

    // Toggle de senha
    const passwordToggle = container.querySelector('.password-toggle');
    const passwordInput = container.querySelector('#password');
    
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        passwordToggle.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
    });

    // Link de registro
    const registerLink = container.querySelector('.register-link');
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('register');
    });

    // Link de esqueci a senha
    const forgotLink = container.querySelector('.forgot-password');
    forgotLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = form.email.value;
        
        if (!email) {
            notifications.warning('Digite seu e-mail para recuperar a senha');
            form.email.focus();
            return;
        }
        
        try {
            await auth.resetPassword(email);
            notifications.success('E-mail de recuperação enviado');
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            notifications.error('Erro ao enviar e-mail de recuperação');
        }
    });

    return container;
} 
