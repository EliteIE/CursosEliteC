// Serviço de Notificações
class NotificationService {
    constructor() {
        this.container = null;
        this.initialized = false;
        this.queue = [];
        this.config = {
            position: 'top-right',
            duration: 5000,
            maxVisible: 5
        };
    }

    init() {
        if (this.initialized) return;

        // Criar container de notificações
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        this.container.setAttribute('role', 'alert');
        document.body.appendChild(this.container);

        // Processar fila de notificações pendentes
        this.queue.forEach(notification => this.show(notification));
        this.queue = [];

        this.initialized = true;
        console.log('✅ Serviço de notificações inicializado');
    }

    show({ type, message, duration = this.config.duration }) {
        // Se não inicializado, adicionar à fila
        if (!this.initialized) {
            this.queue.push({ type, message, duration });
            return;
        }

        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Ícone baseado no tipo
        const icon = this.getIcon(type);
        
        // Conteúdo da notificação
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${icon}"></i>
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close" aria-label="Fechar">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Adicionar ao container
        this.container.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });

        // Configurar botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.dismiss(notification));

        // Auto-dismiss após duração
        if (duration > 0) {
            setTimeout(() => this.dismiss(notification), duration);
        }

        // Limitar número de notificações visíveis
        const notifications = this.container.children;
        if (notifications.length > this.config.maxVisible) {
            this.dismiss(notifications[0]);
        }
    }

    dismiss(notification) {
        // Animar saída
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');

        // Remover após animação
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }

    getIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-times-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
                return 'fas fa-info-circle';
            default:
                return 'fas fa-bell';
        }
    }

    // Métodos de conveniência
    success(message, duration) {
        this.show({ type: 'success', message, duration });
    }

    error(message, duration) {
        this.show({ type: 'error', message, duration });
    }

    warning(message, duration) {
        this.show({ type: 'warning', message, duration });
    }

    info(message, duration) {
        this.show({ type: 'info', message, duration });
    }
}

// Exportar instância única
const notifications = new NotificationService();
export default notifications; 
