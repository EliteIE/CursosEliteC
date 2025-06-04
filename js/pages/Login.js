// Página de Login
import auth from '../auth.js';
import router from '../router.js';
import notifications from '../notifications.js';

export default function Login() {
    const container = document.createElement('div');
    container.className = 'min-h-screen flex items-center justify-center p-4';
    container.innerHTML = `
        <div class="w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    EliteControl
                </h1>
                <p class="text-text-muted">Sistema de Gestão Inteligente</p>
            </div>
            
            <form id="loginForm" class="bg-surface border border-border rounded-lg p-8 shadow-lg backdrop-blur">
                <div class="form-group">
                    <label for="email" class="form-label">E-mail</label>
                    <input type="email" id="email" class="form-input" required 
                           placeholder="Seu e-mail de acesso">
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">Senha</label>
                    <input type="password" id="password" class="form-input" required 
                           placeholder="Sua senha">
                </div>
                
                <div class="flex items-center justify-between mb-6">
                    <label class="flex items-center">
                        <input type="checkbox" class="form-checkbox">
                        <span class="ml-2 text-sm text-text-muted">Lembrar-me</span>
                    </label>
                    
                    <a href="#" class="text-sm text-primary hover:underline">
                        Esqueceu a senha?
                    </a>
                </div>
                
                <button type="submit" class="btn btn-primary w-full">
                    Entrar no Sistema
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-text-muted">
                    Usuários de teste:
                </p>
                <div class="mt-2 text-xs text-text-muted space-y-1">
                    <p>admin@elitecontrol.com (Administrador)</p>
                    <p>estoque@elitecontrol.com (Estoque)</p>
                    <p>vendas@elitecontrol.com (Vendedor)</p>
                    <p class="text-primary">Senha: qualquer valor</p>
                </div>
            </div>
        </div>
    `;

    // Configurar evento de submit do formulário
    const form = container.querySelector('#loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.email.value;
        const password = form.password.value;
        
        // Desabilitar formulário durante o login
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        try {
            const success = await auth.login(email, password);
            if (success) {
                router.navigate('dashboard');
            } else {
                notifications.error('E-mail ou senha inválidos');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            notifications.error('Erro ao fazer login. Tente novamente.');
        } finally {
            // Reabilitar formulário
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Entrar no Sistema';
        }
    });

    return container;
} 