// Página de Vendas
import auth from '../auth.js';
import config from '../config.js';
import productService from '../services/ProductService.js';
import notifications from '../notifications.js';

export default function Sales() {
    const container = document.createElement('div');
    container.className = 'sales-page';
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Vendas</h1>
                <p class="page-subtitle">Gerencie suas vendas e pedidos</p>
            </div>
            <div class="flex items-center gap-4">
                <button class="btn btn-secondary" id="exportSales">
                    <i class="fas fa-download mr-2"></i>
                    Exportar
                </button>
                <button class="btn btn-primary" id="newSale">
                    <i class="fas fa-plus mr-2"></i>
                    Nova Venda
                </button>
            </div>
        </div>

        <div class="sales-container">
            <!-- Painel de Venda -->
            <div class="sale-panel">
                <div class="panel-header">
                    <h2 class="panel-title">Nova Venda</h2>
                    <div class="sale-info">
                        <span class="sale-number">Venda #${Date.now()}</span>
                        <span class="sale-date">${new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <!-- Pesquisa de Produtos -->
                <div class="product-search">
                    <div class="form-group">
                        <label class="form-label">Adicionar Produto</label>
                        <div class="relative">
                            <input type="text" class="form-input pl-10" id="searchProduct" 
                                   placeholder="Digite o nome ou código do produto">
                            <i class="fas fa-search absolute left-3 top-3 text-text-muted"></i>
                        </div>
                    </div>
                </div>

                <!-- Lista de Produtos no Carrinho -->
                <div class="cart-items">
                    <table class="cart-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Preço Un.</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="cartItems">
                            <!-- Items serão adicionados aqui -->
                        </tbody>
                    </table>
                </div>

                <!-- Resumo da Venda -->
                <div class="sale-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span class="subtotal">R$ 0,00</span>
                    </div>
                    <div class="summary-row">
                        <span>Desconto</span>
                        <div class="discount-input">
                            <input type="number" class="form-input" id="discountValue" 
                                   placeholder="0,00">
                            <select class="form-input" id="discountType">
                                <option value="percentage">%</option>
                                <option value="fixed">R$</option>
                            </select>
                        </div>
                    </div>
                    <div class="summary-row">
                        <span>Impostos (18%)</span>
                        <span class="tax">R$ 0,00</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span class="total-value">R$ 0,00</span>
                    </div>
                </div>

                <!-- Ações da Venda -->
                <div class="sale-actions">
                    <button class="btn btn-secondary" id="cancelSale">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" id="finalizeSale">
                        Finalizar Venda
                    </button>
                </div>
            </div>

            <!-- Lista de Vendas Recentes -->
            <div class="recent-sales">
                <h3 class="section-title">Vendas Recentes</h3>
                <div class="sales-list" id="recentSales">
                    <!-- Vendas serão adicionadas aqui -->
                </div>
            </div>
        </div>

        <!-- Modal de Finalização -->
        <div id="checkoutModal" class="modal hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Finalizar Venda</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="checkoutForm">
                        <div class="form-group">
                            <label class="form-label">Cliente</label>
                            <select class="form-input" name="customer" required>
                                <option value="">Selecione o cliente...</option>
                                <option value="1">João Silva</option>
                                <option value="2">Maria Santos</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Forma de Pagamento</label>
                            <select class="form-input" name="paymentMethod" required>
                                <option value="">Selecione...</option>
                                <option value="credit">Cartão de Crédito</option>
                                <option value="debit">Cartão de Débito</option>
                                <option value="cash">Dinheiro</option>
                                <option value="pix">PIX</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Parcelas</label>
                            <select class="form-input" name="installments">
                                <option value="1">À vista</option>
                                <option value="2">2x sem juros</option>
                                <option value="3">3x sem juros</option>
                                <option value="4">4x sem juros</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Observações</label>
                            <textarea class="form-input" name="notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="close-modal">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" type="submit" form="checkoutForm">
                        Confirmar Venda
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adicionar event listeners
    setupEventListeners(container);

    return container;
}

function setupEventListeners(container) {
    const searchInput = container.querySelector('#searchProduct');
    const cartItems = container.querySelector('#cartItems');
    const discountInput = container.querySelector('#discountValue');
    const discountType = container.querySelector('#discountType');
    const checkoutModal = container.querySelector('#checkoutModal');
    
    // Pesquisa de produtos
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const products = await productService.getProducts({ 
                    search: searchInput.value 
                });
                // TODO: Mostrar resultados da pesquisa
            } catch (error) {
                notifications.error('Erro ao pesquisar produtos');
            }
        }, 300);
    });

    // Atualizar totais quando mudar desconto
    discountInput.addEventListener('input', updateTotals);
    discountType.addEventListener('change', updateTotals);

    // Botões de ação
    container.querySelector('#newSale').addEventListener('click', () => {
        // TODO: Limpar formulário
    });

    container.querySelector('#cancelSale').addEventListener('click', () => {
        if (confirm('Deseja realmente cancelar esta venda?')) {
            // TODO: Limpar formulário
        }
    });

    container.querySelector('#finalizeSale').addEventListener('click', () => {
        checkoutModal.classList.remove('hidden');
    });

    // Modal de checkout
    const closeModal = () => checkoutModal.classList.add('hidden');
    
    container.querySelector('.modal-close').addEventListener('click', closeModal);
    container.querySelector('[data-action="close-modal"]').addEventListener('click', closeModal);

    // Formulário de checkout
    const checkoutForm = container.querySelector('#checkoutForm');
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(checkoutForm);
            // TODO: Processar venda
            
            notifications.success('Venda realizada com sucesso!');
            closeModal();
        } catch (error) {
            notifications.error('Erro ao finalizar venda');
        }
    });
}

function updateTotals() {
    // TODO: Implementar cálculo de totais
}

// Funções auxiliares
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
} 