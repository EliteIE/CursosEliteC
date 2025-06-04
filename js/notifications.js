// Sistema de Notificações Temporárias
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Set();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-width: 24rem;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.notifications.add(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Configurar remoção automática
        setTimeout(() => {
            this.dismiss(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
            border-left: 4px solid var(--color-${type});
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            opacity: 0;
            transition: var(--transition-default);
            backdrop-filter: blur(10px);
            pointer-events: auto;
            color: var(--color-text-light);
        `;

        const icon = this.getIcon(type);
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.style.cssText = 'display: flex; align-items: center; gap: 0.75rem;';
        content.innerHTML = `
            <i class="${icon}" style="color: var(--color-${type})"></i>
            <span>${message}</span>
        `;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            padding: 0.25rem;
            margin-left: 0.75rem;
            transition: var(--transition-fast);
        `;
        closeBtn.addEventListener('click', () => this.dismiss(notification));

        notification.appendChild(content);
        notification.appendChild(closeBtn);
        this.container.appendChild(notification);

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    dismiss(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
                this.notifications.delete(notification);
            }
        }, 300);
    }

    // Métodos de conveniência
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Criar instância global
const notifications = new NotificationSystem();

// Exportar para uso em outros módulos
export default notifications; 
