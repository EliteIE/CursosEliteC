// Página de Dashboard
import auth from '../auth.js';
import config from '../config.js';

export default function Dashboard() {
    const container = document.createElement('div');
    container.className = 'dashboard-container';
    
    // Obter dados do usuário atual
    const user = auth.getCurrentUser();
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Bem-vindo, ${user.name}</h1>
                <p class="page-subtitle">Aqui está o resumo do seu dia</p>
            </div>
            <div class="flex items-center gap-4">
                <button class="btn btn-secondary">
                    <i class="fas fa-download mr-2"></i>
                    Exportar Relatório
                </button>
                <button class="btn btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Nova Venda
                </button>
            </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-container">
            <div class="kpi-card">
                <div class="kpi-icon-wrapper">
                    <i class="fas fa-shopping-cart kpi-icon"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-title">Vendas Hoje</h3>
                    <p class="kpi-value">R$ 12.450,00</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon-wrapper">
                    <i class="fas fa-users kpi-icon"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-title">Novos Clientes</h3>
                    <p class="kpi-value">24</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon-wrapper">
                    <i class="fas fa-box kpi-icon"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-title">Produtos Vendidos</h3>
                    <p class="kpi-value">156</p>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon-wrapper">
                    <i class="fas fa-chart-line kpi-icon"></i>
                </div>
                <div class="kpi-content">
                    <h3 class="kpi-title">Taxa de Conversão</h3>
                    <p class="kpi-value">68%</p>
                </div>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="charts-container">
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">Vendas por Período</h3>
                    <div class="chart-actions">
                        <button class="chart-action-btn">
                            <i class="fas fa-calendar"></i>
                        </button>
                        <button class="chart-action-btn">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title">Produtos Mais Vendidos</h3>
                    <div class="chart-actions">
                        <button class="chart-action-btn">
                            <i class="fas fa-filter"></i>
                        </button>
                        <button class="chart-action-btn">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas id="productsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Atividades Recentes -->
        <div class="activities-card">
            <div class="activities-header">
                <h3 class="activities-title">Atividades Recentes</h3>
                <button class="btn btn-secondary">Ver Todas</button>
            </div>
            <ul class="activities-list">
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-text">Nova venda realizada - R$ 750,00</p>
                        <span class="activity-time">Há 5 minutos</span>
                    </div>
                </li>
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-text">Novo cliente cadastrado - João Silva</p>
                        <span class="activity-time">Há 15 minutos</span>
                    </div>
                </li>
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-text">Estoque baixo - Produto XYZ</p>
                        <span class="activity-time">Há 30 minutos</span>
                    </div>
                </li>
            </ul>
        </div>
    `;

    // Inicializar gráficos após renderização
    setTimeout(() => {
        initializeCharts();
    }, 0);

    return container;
}

function initializeCharts() {
    // Gráfico de Vendas
    const salesCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Vendas 2024',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: config.ui.theme.dark.primary,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(56, 189, 248, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(71, 85, 105, 0.2)'
                        },
                        ticks: {
                            color: config.ui.theme.dark.muted
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: config.ui.theme.dark.muted
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Produtos
    const productsCtx = document.getElementById('productsChart')?.getContext('2d');
    if (productsCtx) {
        new Chart(productsCtx, {
            type: 'bar',
            data: {
                labels: ['Produto A', 'Produto B', 'Produto C', 'Produto D', 'Produto E'],
                datasets: [{
                    label: 'Vendas',
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: config.ui.theme.dark.secondary,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(71, 85, 105, 0.2)'
                        },
                        ticks: {
                            color: config.ui.theme.dark.muted
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: config.ui.theme.dark.muted
                        }
                    }
                }
            }
        });
    }
} 