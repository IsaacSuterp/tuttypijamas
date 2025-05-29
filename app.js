// js/app.js
// Este arquivo agora contém o objeto App e o DOMContentLoaded para iniciar tudo.

const App = {
    init() {
        if (typeof uiService !== 'undefined') {
            uiService.updateCartCount();
        } else {
            console.error("app.js: uiService não está definido ao iniciar App.");
        }
        this.handlePageSpecifics();
        this.bindEvents();
    },

    bindEvents() {
        document.body.addEventListener('click', event => {
            if (event.target.matches('.view-product-btn')) {
                const productId = event.target.dataset.productId;
                if (productId) window.location.href = `produto-detalhe.html?id=${productId}`;
            }
            if (event.target.matches('.remove-from-cart-btn')) {
                const cartItemId = event.target.dataset.productId;
                if (typeof cartService !== 'undefined') cartService.remove(cartItemId);
                if (document.body.id === 'cart-page' && typeof uiService !== 'undefined') uiService.renderCartPage();
            }
            if (event.target.matches('.popup-close') || event.target.matches('.popup-overlay')) {
                if (typeof uiService !== 'undefined') uiService.closePopup();
            }
            if (event.target.matches('.collection-button')) {
                const targetPage = event.target.dataset.target;
                if (targetPage) window.location.href = targetPage;
            }
            if (document.body.id === 'product-detail-page') {
                if (event.target.matches('#size-guide-link')) {
                    event.preventDefault();
                    const modal = document.getElementById('size-guide-modal');
                    if (modal) modal.classList.add('active');
                }
                if (event.target.matches('.modal-close') || (event.target.matches('.modal-overlay') && event.target.id === 'size-guide-modal')) {
                    const modal = document.getElementById('size-guide-modal');
                    if (modal) modal.classList.remove('active');
                }
                if (event.target.matches('.thumbnail')) {
                    const mainImage = document.getElementById('main-product-image');
                    if (mainImage) mainImage.src = event.target.src;
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    event.target.classList.add('active');
                }
                if (event.target.matches('.size-btn')) {
                    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                    event.target.classList.add('active');
                }
                if (event.target.matches('.tab-link')) {
                    const tabId = event.target.dataset.tab;
                    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    event.target.classList.add('active');
                    const targetTabContent = document.getElementById(tabId);
                    if (targetTabContent) targetTabContent.classList.add('active');
                }
                if (event.target.matches('#add-to-cart-detail')) {
                    const productId = event.target.dataset.productId;
                    const quantityInput = document.getElementById('quantity');
                    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                    const selectedSizeEl = document.querySelector('.size-btn.active');
                    if (!selectedSizeEl) {
                        if (typeof uiService !== 'undefined') uiService.showNotification('Por favor, selecione um tamanho.', 'error');
                        return;
                    }
                    const size = selectedSizeEl.textContent;
                    if (typeof cartService !== 'undefined') cartService.add(productId, quantity, size);
                }
            }
        });
        document.body.addEventListener('change', event => {
            if (event.target.matches('.cart-quantity-input')) {
                const cartItemId = event.target.dataset.productId;
                if (typeof cartService !== 'undefined') cartService.updateQuantity(cartItemId, event.target.value);
                if (document.body.id === 'cart-page' && typeof uiService !== 'undefined') uiService.renderCartPage();
            }
        });
        const filters = document.getElementById("filters");
        if (filters) { filters.addEventListener("change", () => this.applyFilters()); }
        
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', event => {
                event.preventDefault();
                const formContent = document.getElementById('popup-form-content');
                const successContent = document.getElementById('popup-success-content');
                if(formContent) formContent.style.display = 'none';
                if(successContent) successContent.style.display = 'block';
                if (typeof uiService !== 'undefined') setTimeout(() => uiService.closePopup(), 4000);
            });
        }
    },

    handlePageSpecifics() {
        const pageId = document.body.id;
        if (typeof PageInitializers === 'undefined') {
            console.error("PageInitializers não está definido.");
            return;
        }
        switch (pageId) {
            case 'home-page': PageInitializers.initHomePage(); break;
            case 'products-page': PageInitializers.initProductListPage(); break;
            case 'cart-page': PageInitializers.initCartPage(); break;
            case 'product-detail-page': PageInitializers.initProductDetailPage(); break;
            case 'checkout-page': PageInitializers.initCheckoutPage(); break;
        }
    },

    applyFilters() {
        if (typeof products === 'undefined' || typeof uiService === 'undefined') {
            console.error("Dependências faltando para applyFilters (products ou uiService)");
            return;
        }
        let filteredProducts = [...products];
        const categoryElement = document.getElementById("filter-category");
        const colorElement = document.getElementById("filter-color");
        const priceElement = document.getElementById("filter-price");
        const sortElement = document.getElementById("sort-order");

        const category = categoryElement ? categoryElement.value : "";
        const color = colorElement ? colorElement.value : "";
        const maxPrice = priceElement ? parseFloat(priceElement.value) : Infinity;
        const sortOrder = sortElement ? sortElement.value : "relevance";

        if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
        if (color) filteredProducts = filteredProducts.filter(p => p.color === color);
        if (priceElement && !isNaN(maxPrice) && maxPrice !== Infinity) {
             filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
        }
        switch (sortOrder) {
            case "price-asc": filteredProducts.sort((a, b) => a.price - b.price); break;
            case "price-desc": filteredProducts.sort((a, b) => b.price - a.price); break;
        }
        uiService.renderProductGrid(filteredProducts);
    },
    
    // Essas funções foram movidas para PageInitializers.initCheckoutPage
    // mas o App precisa delas se PageInitializers.initCheckoutPage chamar App.renderCheckoutSummary
    // Portanto, é melhor que essas funções sejam parte do App para serem acessíveis
    // ou que PageInitializers.initCheckoutPage as defina/chame localmente.
    // Para simplificar, vamos mantê-las aqui, chamadas pelo initCheckoutPage
    renderCheckoutSummary() {
        if (typeof cartService === 'undefined' || typeof uiService === 'undefined') return;
        const cart = cartService.get();
        const itemsContainer = document.getElementById('checkout-order-items');
        const subtotalEl = document.getElementById('summary-subtotal');
        const shippingEl = document.getElementById('summary-shipping');
        const totalEl = document.getElementById('summary-total');

        if (!itemsContainer || !subtotalEl || !shippingEl || !totalEl) return;
        itemsContainer.innerHTML = ''; let currentSubtotal = 0;
        if (cart.length === 0) { itemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>'; }
        else {
            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity; currentSubtotal += itemSubtotal;
                itemsContainer.innerHTML += `<div class="order-item"><img src="${item.images[0]}" alt="${item.name}"><div class="item-details"><p class="item-name">${item.name} ${item.selectedSize ? `(Tam: ${item.selectedSize})` : ''}</p><p class="item-qty-price">Qtd: ${item.quantity} | R$ ${item.price.toFixed(2).replace('.', ',')}</p></div><p class="item-total">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</p></div>`;
            });
        }
        const shippingCost = 15.00; const currentTotal = currentSubtotal + shippingCost;
        subtotalEl.textContent = `R$ ${currentSubtotal.toFixed(2).replace('.', ',')}`;
        shippingEl.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
        totalEl.textContent = `R$ ${currentTotal.toFixed(2).replace('.', ',')}`;
        this.updateInstallmentOptions(currentTotal);
    },
    updateInstallmentOptions(totalValue) {
        const cardInstallmentsSelect = document.getElementById('card-installments');
        if (cardInstallmentsSelect) {
            cardInstallmentsSelect.innerHTML = '';
            if (totalValue > 0) {
                for (let i = 1; i <= 10; i++) {
                    const installmentValue = (totalValue / i).toFixed(2).replace('.', ',');
                    const option = document.createElement('option'); option.value = i;
                    option.textContent = `${i}x de R$ ${installmentValue} ${i === 1 ? '' : (i <= 3 ? 'sem juros' : 'com juros')}`;
                    cardInstallmentsSelect.appendChild(option);
                }
            } else { cardInstallmentsSelect.innerHTML = '<option value="1">1x de R$ 0,00</option>';}
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
