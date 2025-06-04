// Página de Clientes
import auth from '../auth.js';
import config from '../config.js';
import notifications from '../notifications.js';
import customerService from '../services/CustomerService.js';

export default function Customers() {
    const container = document.createElement('div');
    container.className = 'customers-page';
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Clientes</h1>
                <p class="page-subtitle">Gerencie seus clientes</p>
            </div>
            <div class="flex items-center gap-4">
                <button class="btn btn-secondary" id="importCustomers">
                    <i class="fas fa-file-import mr-2"></i>
                    Importar
                </button>
                <button class="btn btn-primary" id="addCustomer">
                    <i class="fas fa-plus mr-2"></i>
                    Novo Cliente
                </button>
            </div>
        </div>

        <!-- Filtros e Pesquisa -->
        <div class="filters-container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="form-group">
                    <label class="form-label">Pesquisar</label>
                    <div class="relative">
                        <input type="text" class="form-input pl-10" id="searchCustomer" 
                               placeholder="Nome, e-mail ou telefone">
                        <i class="fas fa-search absolute left-3 top-3 text-text-muted"></i>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-input" id="statusFilter">
                        <option value="">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tags</label>
                    <select class="form-input" id="tagFilter" multiple>
                        <!-- Tags serão carregadas dinamicamente -->
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Ordenar por</label>
                    <select class="form-input" id="sortCustomers">
                        <option value="name">Nome</option>
                        <option value="created">Data de Cadastro</option>
                        <option value="lastPurchase">Última Compra</option>
                        <option value="totalPurchases">Total de Compras</option>
                        <option value="spent">Total Gasto</option>
                    </select>
                </div>
            </div>

            <!-- Filtros Avançados -->
            <div class="advanced-filters hidden" id="advancedFilters">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div class="form-group">
                        <label class="form-label">Gasto Mínimo</label>
                        <input type="number" class="form-input" id="minSpent" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Gasto Máximo</label>
                        <input type="number" class="form-input" id="maxSpent" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data Inicial</label>
                        <input type="date" class="form-input" id="startDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data Final</label>
                        <input type="date" class="form-input" id="endDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cidade</label>
                        <input type="text" class="form-input" id="cityFilter">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select class="form-input" id="stateFilter">
                            <option value="">Todos</option>
                            <!-- Estados serão carregados dinamicamente -->
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center mt-4">
                <button class="btn btn-secondary" id="toggleAdvancedFilters">
                    <i class="fas fa-filter mr-2"></i>
                    Filtros Avançados
                </button>
                
                <div class="flex gap-4">
                    <button class="btn btn-secondary" id="exportPDF">
                        <i class="fas fa-file-pdf mr-2"></i>
                        Exportar PDF
                    </button>
                    <button class="btn btn-secondary" id="exportCSV">
                        <i class="fas fa-file-csv mr-2"></i>
                        Exportar CSV
                    </button>
                </div>
            </div>
        </div>

        <!-- Lista de Clientes -->
        <div class="customers-grid">
            <!-- Card de Cliente -->
            <div class="customer-card">
                <div class="customer-card-header">
                    <div class="customer-avatar">JS</div>
                    <div class="customer-status active">Ativo</div>
                    <button class="customer-menu">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                
                <div class="customer-card-content">
                    <h3 class="customer-name">João Silva</h3>
                    <p class="customer-email">joao.silva@email.com</p>
                    
                    <div class="customer-info">
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>(11) 98765-4321</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Cliente desde Jan/2024</span>
                        </div>
                    </div>
                    
                    <div class="customer-stats">
                        <div class="stat">
                            <span class="stat-label">Compras</span>
                            <span class="stat-value">32</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Gasto</span>
                            <span class="stat-value">R$ 4.850,00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Última Compra</span>
                            <span class="stat-value">2 dias atrás</span>
                        </div>
                    </div>
                </div>
                
                <div class="customer-card-actions">
                    <button class="btn btn-secondary btn-sm">
                        <i class="fas fa-edit mr-1"></i>
                        Editar
                    </button>
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-shopping-cart mr-1"></i>
                        Nova Venda
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Cliente -->
        <div id="customerModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Novo Cliente</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="customerForm">
                        <div class="grid grid-cols-2 gap-4">
                            <!-- Dados Pessoais -->
                            <div class="form-group col-span-2">
                                <label class="form-label">Nome Completo</label>
                                <input type="text" class="form-input" name="name" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">E-mail</label>
                                <input type="email" class="form-input" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Telefone</label>
                                <input type="tel" class="form-input" name="phone" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">CPF</label>
                                <input type="text" class="form-input" name="cpf">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Data de Nascimento</label>
                                <input type="date" class="form-input" name="birthDate">
                            </div>

                            <!-- Endereço -->
                            <div class="col-span-2">
                                <h4 class="form-section-title">Endereço</h4>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">CEP</label>
                                <input type="text" class="form-input" name="zipCode">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Estado</label>
                                <select class="form-input" name="state">
                                    <option value="">Selecione...</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <!-- Adicionar mais estados -->
                                </select>
                            </div>
                            
                            <div class="form-group col-span-2">
                                <label class="form-label">Endereço</label>
                                <input type="text" class="form-input" name="address">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Número</label>
                                <input type="text" class="form-input" name="number">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Complemento</label>
                                <input type="text" class="form-input" name="complement">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Bairro</label>
                                <input type="text" class="form-input" name="neighborhood">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Cidade</label>
                                <input type="text" class="form-input" name="city">
                            </div>

                            <!-- Configurações -->
                            <div class="col-span-2">
                                <h4 class="form-section-title">Configurações</h4>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" name="status">
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Grupo</label>
                                <select class="form-input" name="group">
                                    <option value="regular">Regular</option>
                                    <option value="wholesale">Atacado</option>
                                    <option value="special">Especial</option>
                                </select>
                            </div>
                            
                            <div class="form-group col-span-2">
                                <label class="form-label">Observações</label>
                                <textarea class="form-input" name="notes" rows="3"></textarea>
                            </div>

                            <!-- Adicionar seção de tags -->
                            <div class="form-group col-span-2">
                                <label class="form-label">Tags</label>
                                <div class="tags-container">
                                    <div class="selected-tags" id="selectedTags"></div>
                                    <input type="text" class="form-input" id="tagInput" placeholder="Adicionar tag...">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="customerForm">
                        Salvar Cliente
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Histórico -->
        <div id="historyModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Histórico do Cliente</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="customer-history">
                        <!-- Resumo -->
                        <div class="history-summary">
                            <div class="summary-card">
                                <span class="summary-label">Total de Compras</span>
                                <span class="summary-value" id="historyTotalPurchases">0</span>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Total Gasto</span>
                                <span class="summary-value" id="historyTotalSpent">R$ 0,00</span>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Ticket Médio</span>
                                <span class="summary-value" id="historyAverageTicket">R$ 0,00</span>
                            </div>
                        </div>

                        <!-- Produtos Frequentes -->
                        <div class="history-section">
                            <h4 class="section-title">Produtos Mais Comprados</h4>
                            <div class="frequent-products" id="frequentProducts">
                                <div class="empty-message">Nenhum produto encontrado</div>
                            </div>
                        </div>

                        <!-- Métodos de Pagamento -->
                        <div class="history-section">
                            <h4 class="section-title">Métodos de Pagamento</h4>
                            <div class="payment-methods" id="paymentMethods">
                                <div class="empty-message">Nenhum pagamento encontrado</div>
                            </div>
                        </div>

                        <!-- Lista de Compras -->
                        <div class="history-section">
                            <h4 class="section-title">Últimas Compras</h4>
                            <div class="purchase-list" id="purchaseList">
                                <div class="empty-message">Nenhuma compra encontrada</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Análise -->
        <div id="analysisModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Análise do Cliente</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="customer-analysis">
                        <!-- Perfil do Cliente -->
                        <div class="analysis-section">
                            <h4 class="section-title">Perfil de Comportamento</h4>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="profile-stat">
                                    <span class="stat-label">Recência</span>
                                    <span class="stat-value" id="recencyStatus"></span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-label">Frequência</span>
                                    <span class="stat-value" id="frequencyStatus"></span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-label">Valor</span>
                                    <span class="stat-value" id="valueStatus"></span>
                                </div>
                                <div class="profile-stat">
                                    <span class="stat-label">Risco</span>
                                    <span class="stat-value" id="riskStatus"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Sugestões -->
                        <div class="analysis-section">
                            <h4 class="section-title">Sugestões</h4>
                            <div class="suggestions-list" id="suggestionsList">
                                <!-- Sugestões serão carregadas dinamicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Seção de Fidelidade -->
        <div class="loyalty-section">
            <h4 class="section-title">Programa de Fidelidade</h4>
            <div class="loyalty-info">
                <div class="loyalty-level">
                    <span class="level-label">Nível</span>
                    <span class="level-value" id="loyaltyLevel">Bronze</span>
                </div>
                <div class="loyalty-points">
                    <span class="points-label">Pontos</span>
                    <span class="points-value" id="loyaltyPoints">0</span>
                </div>
                <div class="loyalty-discount">
                    <span class="discount-label">Desconto</span>
                    <span class="discount-value" id="loyaltyDiscount">0%</span>
                </div>
            </div>
            <div class="loyalty-actions">
                <button class="btn btn-secondary" id="redeemPoints">
                    <i class="fas fa-gift mr-2"></i>
                    Resgatar Pontos
                </button>
                <button class="btn btn-secondary" id="viewHistory">
                    <i class="fas fa-history mr-2"></i>
                    Histórico
                </button>
            </div>
        </div>

        <!-- Seção de Eventos -->
        <div class="events-section">
            <h4 class="section-title">Eventos</h4>
            <div class="events-list" id="eventsList">
                <!-- Eventos serão carregados dinamicamente -->
            </div>
            <button class="btn btn-secondary mt-4" id="scheduleEvent">
                <i class="fas fa-calendar-plus mr-2"></i>
                Agendar Evento
            </button>
        </div>

        <!-- Seção de Automações -->
        <div class="automation-section">
            <h4 class="section-title">Automações</h4>
            <div class="automation-rules" id="automationRules">
                <!-- Regras serão carregadas dinamicamente -->
            </div>
            <button class="btn btn-secondary mt-4" id="createAutomation">
                <i class="fas fa-robot mr-2"></i>
                Nova Automação
            </button>
        </div>

        <!-- Histórico de Alterações -->
        <div class="changes-section">
            <h4 class="section-title">Histórico de Alterações</h4>
            <div class="changes-filters">
                <select class="form-input" id="changeType">
                    <option value="">Todos os tipos</option>
                    <option value="field_update">Atualizações</option>
                    <option value="tag">Tags</option>
                    <option value="loyalty">Fidelidade</option>
                    <option value="automation">Automações</option>
                </select>
                <input type="date" class="form-input" id="changeStartDate">
                <input type="date" class="form-input" id="changeEndDate">
            </div>
            <div class="changes-list" id="changesList">
                <!-- Alterações serão carregadas dinamicamente -->
            </div>
        </div>

        <!-- Modal de Resgate de Pontos -->
        <div id="redeemModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Resgatar Pontos</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="redeem-info">
                        <div class="points-available">
                            <span class="label">Pontos Disponíveis</span>
                            <span class="value" id="availablePoints">0</span>
                        </div>
                    </div>
                    
                    <div class="redeem-options">
                        <!-- Opções de resgate serão carregadas dinamicamente -->
                    </div>
                    
                    <form id="redeemForm">
                        <div class="form-group">
                            <label class="form-label">Pontos a Resgatar</label>
                            <input type="number" class="form-input" name="points" min="0" step="100">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Tipo de Resgate</label>
                            <select class="form-input" name="type">
                                <option value="discount">Desconto em Compra</option>
                                <option value="product">Produto Grátis</option>
                                <option value="service">Serviço Especial</option>
                            </select>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="redeemForm">
                        Confirmar Resgate
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Agendamento -->
        <div id="eventModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Agendar Evento</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="eventForm">
                        <div class="form-group">
                            <label class="form-label">Título</label>
                            <input type="text" class="form-input" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Data</label>
                            <input type="datetime-local" class="form-input" name="date" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Tipo</label>
                            <select class="form-input" name="type">
                                <option value="meeting">Reunião</option>
                                <option value="call">Ligação</option>
                                <option value="visit">Visita</option>
                                <option value="delivery">Entrega</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Lembrete</label>
                            <select class="form-input" name="reminder">
                                <option value="0">Sem lembrete</option>
                                <option value="15">15 minutos antes</option>
                                <option value="30">30 minutos antes</option>
                                <option value="60">1 hora antes</option>
                                <option value="1440">1 dia antes</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Notas</label>
                            <textarea class="form-input" name="notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="eventForm">
                        Agendar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal de Automação -->
        <div id="automationModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Nova Automação</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="automationForm">
                        <div class="form-group">
                            <label class="form-label">Nome da Regra</label>
                            <input type="text" class="form-input" name="name" required>
                        </div>
                        
                        <div class="form-section">
                            <h4>Condição</h4>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-input" name="conditionType">
                                    <option value="inactivity">Inatividade</option>
                                    <option value="spending">Gasto Total</option>
                                    <option value="loyalty">Nível de Fidelidade</option>
                                </select>
                            </div>
                            
                            <div class="form-group condition-params">
                                <!-- Parâmetros serão carregados dinamicamente -->
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Ação</h4>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-input" name="actionType">
                                    <option value="tag">Adicionar Tag</option>
                                    <option value="segment">Atualizar Segmento</option>
                                    <option value="notification">Enviar Notificação</option>
                                    <option value="loyalty">Pontos de Fidelidade</option>
                                </select>
                            </div>
                            
                            <div class="form-group action-params">
                                <!-- Parâmetros serão carregados dinamicamente -->
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="automationForm">
                        Criar Automação
                    </button>
                </div>
            </div>
        </div>

        <!-- Seção de Recomendações -->
        <div class="recommendations-section">
            <h4 class="section-title">Recomendações</h4>
            <div class="recommendations-grid">
                <div class="recommendation-card">
                    <h5>Produtos Sugeridos</h5>
                    <div class="products-list" id="recommendedProducts">
                        <!-- Produtos serão carregados dinamicamente -->
                    </div>
                </div>
                <div class="recommendation-card">
                    <h5>Categorias Preferidas</h5>
                    <div class="categories-list" id="preferredCategories">
                        <!-- Categorias serão carregadas dinamicamente -->
                    </div>
                </div>
                <div class="recommendation-card">
                    <h5>Melhor Horário para Contato</h5>
                    <div class="contact-time" id="bestContactTime">
                        <!-- Horário será carregado dinamicamente -->
                    </div>
                </div>
            </div>
            <div class="action-suggestions" id="actionSuggestions">
                <!-- Sugestões serão carregadas dinamicamente -->
            </div>
        </div>

        <!-- Seção de Redes Sociais -->
        <div class="social-section">
            <h4 class="section-title">Redes Sociais</h4>
            <div class="social-profiles" id="socialProfiles">
                <div class="profile-card facebook">
                    <i class="fab fa-facebook"></i>
                    <span class="status">Não conectado</span>
                    <button class="btn btn-secondary btn-sm">Conectar</button>
                </div>
                <div class="profile-card instagram">
                    <i class="fab fa-instagram"></i>
                    <span class="status">Não conectado</span>
                    <button class="btn btn-secondary btn-sm">Conectar</button>
                </div>
                <div class="profile-card twitter">
                    <i class="fab fa-twitter"></i>
                    <span class="status">Não conectado</span>
                    <button class="btn btn-secondary btn-sm">Conectar</button>
                </div>
                <div class="profile-card linkedin">
                    <i class="fab fa-linkedin"></i>
                    <span class="status">Não conectado</span>
                    <button class="btn btn-secondary btn-sm">Conectar</button>
                </div>
            </div>
            <div class="social-engagement">
                <div class="engagement-stats">
                    <div class="stat-card">
                        <span class="stat-label">Menções</span>
                        <span class="stat-value" id="totalMentions">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Sentimento</span>
                        <div class="sentiment-chart" id="sentimentChart">
                            <!-- Gráfico será carregado dinamicamente -->
                        </div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Engajamento</span>
                        <span class="stat-value" id="engagementRate">0%</span>
                    </div>
                </div>
                <div class="social-mentions" id="socialMentions">
                    <!-- Menções serão carregadas dinamicamente -->
                </div>
            </div>
            <div class="social-actions">
                <button class="btn btn-secondary" id="scheduleSocialPost">
                    <i class="fas fa-calendar-plus mr-2"></i>
                    Agendar Post
                </button>
                <button class="btn btn-secondary" id="viewSocialAnalytics">
                    <i class="fas fa-chart-line mr-2"></i>
                    Ver Análise
                </button>
            </div>
        </div>

        <!-- Modal de Agendamento de Post -->
        <div id="postModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Agendar Post</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="postForm">
                        <div class="form-group">
                            <label class="form-label">Redes Sociais</label>
                            <div class="social-checkboxes">
                                <label class="checkbox-item">
                                    <input type="checkbox" name="networks" value="facebook">
                                    <i class="fab fa-facebook"></i>
                                    Facebook
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="networks" value="instagram">
                                    <i class="fab fa-instagram"></i>
                                    Instagram
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="networks" value="twitter">
                                    <i class="fab fa-twitter"></i>
                                    Twitter
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="networks" value="linkedin">
                                    <i class="fab fa-linkedin"></i>
                                    LinkedIn
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Conteúdo</label>
                            <textarea class="form-input" name="content" rows="4" required></textarea>
                            <div class="character-count">
                                <span id="charCount">0</span>/280
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mídia</label>
                            <input type="file" class="form-input" name="media" accept="image/*,video/*">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Data e Hora</label>
                            <input type="datetime-local" class="form-input" name="scheduledFor" required>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="postForm">
                        Agendar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adicionar event listeners
    setupEventListeners(container);
    
    // Carregar clientes iniciais
    loadCustomers();

    return container;
}

// Função para carregar e renderizar clientes
async function loadCustomers(filters = {}) {
    try {
        const customersGrid = document.querySelector('.customers-grid');
        customersGrid.innerHTML = '<div class="loading">Carregando...</div>';

        const customers = await customerService.getCustomers(filters);
        
        if (customers.length === 0) {
            customersGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users text-4xl text-text-muted mb-4"></i>
                    <h3>Nenhum cliente encontrado</h3>
                    <p>Comece adicionando seu primeiro cliente!</p>
                </div>
            `;
            return;
        }

        customersGrid.innerHTML = customers.map(customer => `
            <div class="customer-card" data-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">${getInitials(customer.name)}</div>
                    <div class="customer-status ${customer.status}">${getStatusLabel(customer.status)}</div>
                    <button class="customer-menu" data-customer-id="${customer.id}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                
                <div class="customer-card-content">
                    <h3 class="customer-name">${customer.name}</h3>
                    <p class="customer-email">${customer.email}</p>
                    
                    <div class="customer-info">
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>${customer.phone}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Cliente desde ${formatDate(customer.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div class="customer-stats">
                        <div class="stat">
                            <span class="stat-label">Compras</span>
                            <span class="stat-value">${customer.totalPurchases}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Gasto</span>
                            <span class="stat-value">${formatCurrency(customer.totalSpent || 0)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Última Compra</span>
                            <span class="stat-value">${formatLastPurchase(customer.lastPurchase)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="customer-card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editCustomer('${customer.id}')">
                        <i class="fas fa-edit mr-1"></i>
                        Editar
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="newSale('${customer.id}')">
                        <i class="fas fa-shopping-cart mr-1"></i>
                        Nova Venda
                    </button>
                </div>
            </div>
        `).join('');

        // Adicionar event listeners aos menus de contexto
        setupContextMenus();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        notifications.error('Não foi possível carregar os clientes');
    }
}

function setupEventListeners(container) {
    const searchInput = container.querySelector('#searchCustomer');
    const statusFilter = container.querySelector('#statusFilter');
    const sortSelect = container.querySelector('#sortCustomers');
    const customerModal = container.querySelector('#customerModal');
    
    // Pesquisa de clientes
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadCustomers({ search: searchInput.value });
        }, 300);
    });

    // Filtros
    statusFilter.addEventListener('change', () => {
        loadCustomers({ 
            search: searchInput.value,
            status: statusFilter.value 
        });
    });

    sortSelect.addEventListener('change', () => {
        const customers = document.querySelectorAll('.customer-card');
        const sortBy = sortSelect.value;
        
        const sortedCustomers = Array.from(customers).sort((a, b) => {
            const aValue = a.dataset[sortBy];
            const bValue = b.dataset[sortBy];
            return aValue.localeCompare(bValue);
        });

        const grid = document.querySelector('.customers-grid');
        sortedCustomers.forEach(card => grid.appendChild(card));
    });

    // Modal de cliente
    const openModal = (customerId = null) => {
        const modal = customerModal;
        const form = modal.querySelector('#customerForm');
        const title = modal.querySelector('.modal-title');

        if (customerId) {
            title.textContent = 'Editar Cliente';
            loadCustomerData(customerId, form);
        } else {
            title.textContent = 'Novo Cliente';
            form.reset();
        }

        modal.classList.remove('hidden');
    };

    const closeModal = () => customerModal.classList.add('hidden');
    
    container.querySelector('#addCustomer').addEventListener('click', () => openModal());
    container.querySelector('.modal-close').addEventListener('click', closeModal);
    container.querySelector('[data-action="close-modal"]').addEventListener('click', closeModal);

    // Importação de clientes
    container.querySelector('#importCustomers').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const imported = await customerService.importCustomers(file);
                notifications.success(`${imported} clientes importados com sucesso!`);
                loadCustomers();
            } catch (error) {
                notifications.error('Erro ao importar clientes');
            }
        });

        input.click();
    });

    // Formulário de cliente
    const customerForm = container.querySelector('#customerForm');
    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(customerForm);
            const customerData = Object.fromEntries(formData.entries());
            const customerId = customerForm.dataset.customerId;
            
            let customer;
            if (customerId) {
                customer = await customerService.updateCustomer(customerId, customerData);
                notifications.success('Cliente atualizado com sucesso!');
            } else {
                customer = await customerService.createCustomer(customerData);
                notifications.success('Cliente criado com sucesso!');
            }
            
            closeModal();
            customerForm.reset();
            loadCustomers();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            notifications.error(error.message || 'Erro ao salvar cliente');
        }
    });

    // Buscar CEP
    const zipCodeInput = customerForm.querySelector('[name="zipCode"]');
    let zipCodeTimeout;
    zipCodeInput.addEventListener('input', () => {
        clearTimeout(zipCodeTimeout);
        zipCodeTimeout = setTimeout(async () => {
            const zipCode = zipCodeInput.value.replace(/\D/g, '');
            if (zipCode.length === 8) {
                try {
                    const address = await customerService.fetchAddress(zipCode);
                    
                    // Preencher campos de endereço
                    Object.entries(address).forEach(([field, value]) => {
                        const input = customerForm.querySelector(`[name="${field}"]`);
                        if (input) input.value = value;
                    });
                } catch (error) {
                    notifications.error('CEP não encontrado');
                }
            }
        }, 500);
    });

    // Carregar tags
    const tagFilter = container.querySelector('#tagFilter');
    const tags = customerService.getTags();
    tagFilter.innerHTML = tags.map(tag => 
        `<option value="${tag}">${tag}</option>`
    ).join('');

    // Filtros avançados
    const toggleAdvancedFilters = container.querySelector('#toggleAdvancedFilters');
    const advancedFilters = container.querySelector('#advancedFilters');
    
    toggleAdvancedFilters.addEventListener('click', () => {
        advancedFilters.classList.toggle('hidden');
    });

    // Sistema de tags no modal
    const tagInput = container.querySelector('#tagInput');
    const selectedTags = container.querySelector('#selectedTags');
    
    tagInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && tagInput.value.trim()) {
            const customerId = customerForm.dataset.customerId;
            if (customerId) {
                try {
                    await customerService.addTag(customerId, tagInput.value.trim());
                    renderTags(customerId);
                    tagInput.value = '';
                } catch (error) {
                    notifications.error('Erro ao adicionar tag');
                }
            }
        }
    });

    // Exportação
    container.querySelector('#exportPDF').addEventListener('click', async () => {
        try {
            const customers = await customerService.getCustomers();
            const pdf = await customerService.exportToPDF(customers);
            // TODO: Implementar download do PDF
            notifications.success('Relatório PDF gerado com sucesso!');
        } catch (error) {
            notifications.error('Erro ao gerar PDF');
        }
    });

    container.querySelector('#exportCSV').addEventListener('click', async () => {
        try {
            const csv = await customerService.exportCustomers('csv');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (error) {
            notifications.error('Erro ao exportar CSV');
        }
    });

    // Sistema de Fidelidade
    const redeemPoints = container.querySelector('#redeemPoints');
    const viewHistory = container.querySelector('#viewHistory');
    
    redeemPoints.addEventListener('click', () => {
        const customerId = customerForm.dataset.customerId;
        openRedeemModal(customerId);
    });

    viewHistory.addEventListener('click', () => {
        const customerId = customerForm.dataset.customerId;
        loadLoyaltyHistory(customerId);
    });

    // Eventos
    const scheduleEvent = container.querySelector('#scheduleEvent');
    scheduleEvent.addEventListener('click', () => {
        const customerId = customerForm.dataset.customerId;
        openEventModal(customerId);
    });

    // Automações
    const createAutomation = container.querySelector('#createAutomation');
    createAutomation.addEventListener('click', () => {
        const customerId = customerForm.dataset.customerId;
        openAutomationModal(customerId);
    });

    // Histórico de Alterações
    const changeType = container.querySelector('#changeType');
    const changeStartDate = container.querySelector('#changeStartDate');
    const changeEndDate = container.querySelector('#changeEndDate');

    [changeType, changeStartDate, changeEndDate].forEach(filter => {
        filter.addEventListener('change', () => {
            const customerId = customerForm.dataset.customerId;
            loadChangeHistory(customerId, {
                type: changeType.value,
                startDate: changeStartDate.value,
                endDate: changeEndDate.value
            });
        });
    });
}

// Funções auxiliares
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getStatusLabel(status) {
    const labels = {
        active: 'Ativo',
        inactive: 'Inativo',
        vip: 'VIP'
    };
    return labels[status] || status;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatLastPurchase(date) {
    if (!date) return 'Nunca';
    
    const purchaseDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 30) return `${diffDays} dias atrás`;
    
    return formatDate(date);
}

async function loadCustomerData(customerId, form) {
    try {
        const customer = await customerService.getCustomer(customerId);
        form.dataset.customerId = customerId;
        
        // Preencher campos do formulário
        Object.entries(customer).forEach(([field, value]) => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                if (input.type === 'date' && value) {
                    input.value = new Date(value).toISOString().split('T')[0];
                } else {
                    input.value = value;
                }
            }
        });
    } catch (error) {
        notifications.error('Erro ao carregar dados do cliente');
    }
}

function setupContextMenus() {
    const menus = document.querySelectorAll('.customer-menu');
    
    menus.forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            const customerId = menu.dataset.customerId;
            
            // Criar menu de contexto
            const contextMenu = document.createElement('div');
            contextMenu.className = 'context-menu';
            contextMenu.innerHTML = `
                <button class="context-menu-item" data-action="edit">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="context-menu-item" data-action="history">
                    <i class="fas fa-history"></i>
                    Histórico
                </button>
                <button class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            `;
            
            // Posicionar menu
            const rect = menu.getBoundingClientRect();
            contextMenu.style.top = `${rect.bottom + window.scrollY}px`;
            contextMenu.style.left = `${rect.left}px`;
            
            // Adicionar ao DOM
            document.body.appendChild(contextMenu);
            
            // Event listeners
            const handleClick = async (e) => {
                const action = e.target.closest('.context-menu-item')?.dataset.action;
                if (!action) return;
                
                switch (action) {
                    case 'edit':
                        openModal(customerId);
                        break;
                    case 'history':
                        openHistoryModal(customerId);
                        break;
                    case 'delete':
                        if (confirm('Tem certeza que deseja excluir este cliente?')) {
                            try {
                                await customerService.deleteCustomer(customerId);
                                notifications.success('Cliente excluído com sucesso!');
                                loadCustomers();
                            } catch (error) {
                                notifications.error('Erro ao excluir cliente');
                            }
                        }
                        break;
                }
                
                contextMenu.remove();
            };
            
            contextMenu.addEventListener('click', handleClick);
            document.addEventListener('click', () => contextMenu.remove(), { once: true });
        });
    });
}

// Função para abrir modal de histórico
async function openHistoryModal(customerId) {
    const modal = document.querySelector('#historyModal');
    const customer = await customerService.getCustomer(customerId);
    
    if (!customer) {
        notifications.error('Cliente não encontrado');
        return;
    }

    try {
        // Buscar histórico
        const history = await customerService.getCustomerPurchases(customerId);
        
        // Atualizar resumo
        document.querySelector('#historyTotalPurchases').textContent = history.stats.totalPurchases;
        document.querySelector('#historyTotalSpent').textContent = formatCurrency(history.stats.totalSpent);
        document.querySelector('#historyAverageTicket').textContent = formatCurrency(history.stats.averageTicket);

        // Atualizar produtos frequentes
        const frequentProducts = document.querySelector('#frequentProducts');
        if (history.stats.frequentProducts.length > 0) {
            frequentProducts.innerHTML = history.stats.frequentProducts.map(product => `
                <div class="product-item">
                    <span class="product-name">${product.name}</span>
                    <span class="product-quantity">${product.quantity}x</span>
                </div>
            `).join('');
        }

        // Atualizar métodos de pagamento
        const paymentMethods = document.querySelector('#paymentMethods');
        const methods = history.stats.paymentMethods;
        if (Object.keys(methods).length > 0) {
            paymentMethods.innerHTML = Object.entries(methods).map(([method, count]) => `
                <div class="payment-method">
                    <span class="method-name">${getPaymentMethodLabel(method)}</span>
                    <span class="method-count">${count}x</span>
                </div>
            `).join('');
        }

        // Atualizar lista de compras
        const purchaseList = document.querySelector('#purchaseList');
        if (history.purchases.length > 0) {
            purchaseList.innerHTML = history.purchases.map(purchase => `
                <div class="purchase-item">
                    <div class="purchase-header">
                        <span class="purchase-date">${formatDate(purchase.date)}</span>
                        <span class="purchase-total">${formatCurrency(purchase.total)}</span>
                    </div>
                    <div class="purchase-details">
                        <div class="purchase-products">
                            ${purchase.items.map(item => `
                                <div class="purchase-product">
                                    <span class="product-name">${item.name}</span>
                                    <span class="product-quantity">${item.quantity}x</span>
                                    <span class="product-price">${formatCurrency(item.total)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="purchase-payment">
                            <i class="fas fa-credit-card"></i>
                            <span>${getPaymentMethodLabel(purchase.payment.method)}</span>
                            ${purchase.payment.installments > 1 ? 
                                `<span class="installments">${purchase.payment.installments}x</span>` : 
                                ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Abrir modal
        modal.classList.remove('hidden');

        // Adicionar event listeners
        const closeButtons = modal.querySelectorAll('.modal-close, [data-action="close-modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => modal.classList.add('hidden'));
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        notifications.error('Erro ao carregar histórico do cliente');
    }
}

// Função auxiliar para obter label do método de pagamento
function getPaymentMethodLabel(method) {
    const labels = {
        credit: 'Cartão de Crédito',
        debit: 'Cartão de Débito',
        cash: 'Dinheiro',
        pix: 'PIX'
    };
    return labels[method] || method;
}

// Funções globais para ações nos cards
window.editCustomer = (customerId) => {
    const modal = document.querySelector('#customerModal');
    const form = modal.querySelector('#customerForm');
    loadCustomerData(customerId, form);
    modal.classList.remove('hidden');
};

window.newSale = (customerId) => {
    // TODO: Implementar integração com módulo de vendas
    console.log('Nova venda para cliente:', customerId);
};

// Função para renderizar tags
async function renderTags(customerId) {
    const selectedTags = document.querySelector('#selectedTags');
    const customer = await customerService.getCustomer(customerId);
    
    if (customer.tags) {
        selectedTags.innerHTML = customer.tags.map(tag => `
            <div class="tag">
                <span>${tag}</span>
                <button class="remove-tag" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Adicionar event listeners para remoção
        selectedTags.querySelectorAll('.remove-tag').forEach(button => {
            button.addEventListener('click', async () => {
                const tag = button.dataset.tag;
                try {
                    await customerService.removeTag(customerId, tag);
                    renderTags(customerId);
                } catch (error) {
                    notifications.error('Erro ao remover tag');
                }
            });
        });
    }
}

// Função para abrir modal de análise
async function openAnalysisModal(customerId) {
    const modal = document.querySelector('#analysisModal');
    
    try {
        const analysis = await customerService.analyzeCustomerBehavior(customerId);
        
        // Atualizar status
        document.querySelector('#recencyStatus').textContent = analysis.recency;
        document.querySelector('#frequencyStatus').textContent = analysis.frequency;
        document.querySelector('#valueStatus').textContent = analysis.value;
        document.querySelector('#riskStatus').textContent = analysis.risk;
        
        // Atualizar sugestões
        const suggestionsList = document.querySelector('#suggestionsList');
        suggestionsList.innerHTML = analysis.suggestions.map(suggestion => `
            <div class="suggestion-item">
                <i class="fas fa-lightbulb text-warning"></i>
                <span>${suggestion}</span>
            </div>
        `).join('');
        
        modal.classList.remove('hidden');
    } catch (error) {
        notifications.error('Erro ao carregar análise');
    }
}

// Funções auxiliares para as novas funcionalidades
async function openRedeemModal(customerId) {
    const modal = document.querySelector('#redeemModal');
    const customer = await customerService.getCustomer(customerId);
    
    document.querySelector('#availablePoints').textContent = customer.loyaltyPoints || 0;
    
    const form = document.querySelector('#redeemForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        try {
            await customerService.redeemLoyaltyPoints(customerId, {
                points: parseInt(formData.get('points')),
                type: formData.get('type')
            });
            
            notifications.success('Pontos resgatados com sucesso!');
            modal.classList.add('hidden');
            loadCustomerData(customerId, customerForm);
        } catch (error) {
            notifications.error(error.message);
        }
    });
    
    modal.classList.remove('hidden');
}

async function loadLoyaltyHistory(customerId) {
    const customer = await customerService.getCustomer(customerId);
    if (!customer.loyaltyHistory) return;
    
    const historyList = document.querySelector('#loyaltyHistory');
    historyList.innerHTML = customer.loyaltyHistory.map(transaction => `
        <div class="history-item">
            <div class="transaction-info">
                <span class="transaction-type">${transaction.type}</span>
                <span class="transaction-points">${transaction.points} pontos</span>
            </div>
            <span class="transaction-date">${formatDate(transaction.timestamp)}</span>
        </div>
    `).join('');
}

async function openEventModal(customerId) {
    const modal = document.querySelector('#eventModal');
    
    const form = document.querySelector('#eventForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        try {
            await customerService.scheduleEvent(customerId, {
                title: formData.get('title'),
                date: formData.get('date'),
                type: formData.get('type'),
                reminder: parseInt(formData.get('reminder')),
                notes: formData.get('notes')
            });
            
            notifications.success('Evento agendado com sucesso!');
            modal.classList.add('hidden');
            loadCustomerData(customerId, customerForm);
        } catch (error) {
            notifications.error(error.message);
        }
    });
    
    modal.classList.remove('hidden');
}

async function openAutomationModal(customerId) {
    const modal = document.querySelector('#automationModal');
    
    // Carregar parâmetros dinâmicos
    const conditionType = modal.querySelector('[name="conditionType"]');
    const actionType = modal.querySelector('[name="actionType"]');
    
    conditionType.addEventListener('change', () => {
        const params = modal.querySelector('.condition-params');
        params.innerHTML = getConditionParams(conditionType.value);
    });
    
    actionType.addEventListener('change', () => {
        const params = modal.querySelector('.action-params');
        params.innerHTML = getActionParams(actionType.value);
    });
    
    const form = document.querySelector('#automationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        try {
            await customerService.createAutomation({
                name: formData.get('name'),
                condition: {
                    type: formData.get('conditionType'),
                    ...getConditionValues(formData)
                },
                action: {
                    type: formData.get('actionType'),
                    ...getActionValues(formData)
                }
            });
            
            notifications.success('Automação criada com sucesso!');
            modal.classList.add('hidden');
        } catch (error) {
            notifications.error(error.message);
        }
    });
    
    modal.classList.remove('hidden');
}

function getConditionParams(type) {
    switch (type) {
        case 'inactivity':
            return `
                <label class="form-label">Dias de Inatividade</label>
                <input type="number" class="form-input" name="days" min="1" required>
            `;
        case 'spending':
            return `
                <label class="form-label">Valor Mínimo</label>
                <input type="number" class="form-input" name="amount" min="0" step="0.01" required>
            `;
        case 'loyalty':
            return `
                <label class="form-label">Nível Mínimo</label>
                <select class="form-input" name="level">
                    <option value="bronze">Bronze</option>
                    <option value="prata">Prata</option>
                    <option value="ouro">Ouro</option>
                    <option value="platina">Platina</option>
                    <option value="diamante">Diamante</option>
                </select>
            `;
        default:
            return '';
    }
}

function getActionParams(type) {
    switch (type) {
        case 'tag':
            return `
                <label class="form-label">Tag</label>
                <input type="text" class="form-input" name="tag" required>
            `;
        case 'segment':
            return `
                <label class="form-label">Segmento</label>
                <select class="form-input" name="segment">
                    <option value="Potencial">Potencial</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Em Risco">Em Risco</option>
                    <option value="Recuperação">Recuperação</option>
                    <option value="Premium">Premium</option>
                </select>
            `;
        case 'notification':
            return `
                <label class="form-label">Canal</label>
                <select class="form-input" name="channel">
                    <option value="email">E-mail</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>
                <label class="form-label">Mensagem</label>
                <textarea class="form-input" name="message" required></textarea>
            `;
        case 'loyalty':
            return `
                <label class="form-label">Pontos</label>
                <input type="number" class="form-input" name="points" min="0" required>
                <label class="form-label">Motivo</label>
                <input type="text" class="form-input" name="reason" required>
            `;
        default:
            return '';
    }
}

function getConditionValues(formData) {
    const type = formData.get('conditionType');
    switch (type) {
        case 'inactivity':
            return { days: parseInt(formData.get('days')) };
        case 'spending':
            return { amount: parseFloat(formData.get('amount')) };
        case 'loyalty':
            return { level: formData.get('level') };
        default:
            return {};
    }
}

function getActionValues(formData) {
    const type = formData.get('actionType');
    switch (type) {
        case 'tag':
            return { tag: formData.get('tag') };
        case 'segment':
            return { segment: formData.get('segment') };
        case 'notification':
            return {
                channel: formData.get('channel'),
                message: formData.get('message')
            };
        case 'loyalty':
            return {
                points: parseInt(formData.get('points')),
                reason: formData.get('reason')
            };
        default:
            return {};
    }
}

async function loadChangeHistory(customerId, filters = {}) {
    try {
        const history = await customerService.getChangeHistory(customerId, filters);
        const changesList = document.querySelector('#changesList');
        
        changesList.innerHTML = history.map(change => `
            <div class="change-item">
                <div class="change-header">
                    <span class="change-type">${getChangeTypeLabel(change.type)}</span>
                    <span class="change-date">${formatDate(change.timestamp)}</span>
                </div>
                <div class="change-details">
                    ${formatChangeDetails(change)}
                </div>
                <div class="change-user">
                    <i class="fas fa-user"></i>
                    <span>${change.user}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        notifications.error('Erro ao carregar histórico');
    }
}

function getChangeTypeLabel(type) {
    const labels = {
        field_update: 'Atualização de Campo',
        tag: 'Alteração de Tag',
        loyalty: 'Programa de Fidelidade',
        automation: 'Automação'
    };
    return labels[type] || type;
}

function formatChangeDetails(change) {
    switch (change.type) {
        case 'field_update':
            return `
                <div class="field-update">
                    <span class="field-name">${change.field}</span>
                    <div class="field-values">
                        <span class="old-value">${change.oldValue || '-'}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="new-value">${change.newValue || '-'}</span>
                    </div>
                </div>
            `;
        case 'tag':
            return `
                <div class="tag-change">
                    ${change.action === 'add' ? 'Adicionada' : 'Removida'} tag:
                    <span class="tag">${change.tag}</span>
                </div>
            `;
        case 'loyalty':
            return `
                <div class="loyalty-change">
                    ${change.action === 'earn' ? 'Ganhou' : 'Resgatou'}
                    <span class="points">${change.points} pontos</span>
                    ${change.reason ? `<span class="reason">(${change.reason})</span>` : ''}
                </div>
            `;
        case 'automation':
            return `
                <div class="automation-change">
                    Automação "${change.rule}" executada:
                    <span class="action">${change.action}</span>
                </div>
            `;
        default:
            return JSON.stringify(change);
    }
} 