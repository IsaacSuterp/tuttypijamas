// js/app.js (agora na raiz: app.js)

const App = {
    init() {
        console.log("DEBUG: App.init() chamado");
        if (typeof uiService !== 'undefined' && uiService.updateCartCount) {
            uiService.updateCartCount();
        } else {
            console.error("DEBUG: app.js: uiService ou uiService.updateCartCount não está definido ao iniciar App.");
        }
        this.handlePageSpecifics();
        this.bindEvents();
        this.initMobileMenu();
    },

    initMobileMenu() {
        console.log("DEBUG: App.initMobileMenu() chamado");
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const menuClose = document.getElementById('mobile-menu-close');
        const mainNav = document.getElementById('main-nav');
        const backdrop = document.getElementById('menu-backdrop');

        if (!menuToggle || !mainNav || !menuClose || !backdrop) {
            console.error("DEBUG: Um ou mais elementos do menu mobile não foram encontrados:", {menuToggle, mainNav, menuClose, backdrop});
            return;
        }
        const openMenu = () => {
            console.log("DEBUG: openMenu() chamado");
            mainNav.classList.add('active'); menuToggle.classList.add('active');
            backdrop.classList.add('active'); document.body.classList.add('mobile-menu-open');
        };
        const closeMenu = () => {
            console.log("DEBUG: closeMenu() chamado");
            mainNav.classList.remove('active'); menuToggle.classList.remove('active');
            backdrop.classList.remove('active'); document.body.classList.remove('mobile-menu-open');
        };
        menuToggle.addEventListener('click', () => {
            console.log("DEBUG: Botão mobile-menu-toggle clicado");
            if (mainNav.classList.contains('active')) { closeMenu(); } else { openMenu(); }
        });
        menuClose.addEventListener('click', () => { console.log("DEBUG: Botão mobile-menu-close clicado"); closeMenu(); });
        backdrop.addEventListener('click', () => { console.log("DEBUG: Backdrop clicado"); closeMenu(); });
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(event) {
                console.log(`DEBUG: Link do menu mobile clicado: ${this.href}`); event.stopPropagation();
                if (mainNav.classList.contains('active')) { console.log("DEBUG: Menu ativo. Chamando closeMenu()."); closeMenu(); }
                else { console.log("DEBUG: Menu não estava ativo, navegação direta."); }
            });
        });
    },

    updatePriceRangeDisplay() {
        const priceRangeSlider = document.getElementById('filter-price');
        const priceRangeValueSpan = document.getElementById('price-range-value');

        if (priceRangeSlider && priceRangeValueSpan) {
            const value = parseInt(priceRangeSlider.value);
            const min = parseInt(priceRangeSlider.min || 0);
            const max = parseInt(priceRangeSlider.max || 100);
            const percentage = (min === max) ? 100 : ((value - min) / (max - min)) * 100;

            priceRangeValueSpan.textContent = `R$ ${value}`;
            priceRangeSlider.style.background = `linear-gradient(to right, var(--secondary-color) 0%, var(--secondary-color) ${percentage}%, var(--range-track-color) ${percentage}%, var(--range-track-color) 100%)`;
        }
    },

    bindEvents() {
        console.log("DEBUG: App.bindEvents() chamado");
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
            const newsletterPopup = document.getElementById('newsletter-popup');
            if (newsletterPopup && newsletterPopup.classList.contains('active')) {
                if (event.target.matches('#newsletter-popup .popup-close') || event.target === newsletterPopup) {
                    if (typeof uiService !== 'undefined') uiService.closePopup();
                }
            }
            if (event.target.matches('.collection-button')) {
                const targetPage = event.target.dataset.target;
                if (targetPage) window.location.href = targetPage;
            }
            if (document.body.id === 'product-detail-page') {
                if (event.target.matches('#size-guide-link')) { event.preventDefault(); const modal = document.getElementById('size-guide-modal'); if (modal) modal.classList.add('active'); }
                if (event.target.matches('.modal-close') || (event.target.matches('.modal-overlay') && event.target.id === 'size-guide-modal')) { const modal = document.getElementById('size-guide-modal'); if (modal) modal.classList.remove('active'); }
                if (event.target.matches('.thumbnail')) { const mainImage = document.getElementById('main-product-image'); if (mainImage) mainImage.src = event.target.src; document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active')); event.target.classList.add('active'); }
                if (event.target.matches('.size-btn')) { document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active')); event.target.classList.add('active'); }
                if (event.target.matches('.tab-link')) { const tabId = event.target.dataset.tab; document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); event.target.classList.add('active'); const targetTabContent = document.getElementById(tabId); if (targetTabContent) targetTabContent.classList.add('active'); }
                if (event.target.matches('#add-to-cart-detail')) { const productId = event.target.dataset.productId; const quantityInput = document.getElementById('quantity'); const quantity = quantityInput ? parseInt(quantityInput.value) : 1; const selectedSizeEl = document.querySelector('.size-btn.active'); if (!selectedSizeEl) { if (typeof uiService !== 'undefined') uiService.showNotification('Por favor, selecione um tamanho.', 'error'); return; } const size = selectedSizeEl.textContent; if (typeof cartService !== 'undefined') cartService.add(productId, quantity, size); }
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
        const priceRangeSlider = document.getElementById('filter-price');
        if (priceRangeSlider) { priceRangeSlider.addEventListener('input', () => { this.updatePriceRangeDisplay(); /* this.applyFilters(); */ }); }
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) { newsletterForm.addEventListener('submit', event => { event.preventDefault(); const formContent = document.getElementById('popup-form-content'); const successContent = document.getElementById('popup-success-content'); if(formContent) formContent.style.display = 'none'; if(successContent) successContent.style.display = 'block'; if (typeof uiService !== 'undefined') setTimeout(() => uiService.closePopup(), 4000); }); }
    },
    handlePageSpecifics() {
        const pageId = document.body.id;
        console.log("DEBUG: App.handlePageSpecifics() chamado para a página:", pageId);
        if (typeof PageInitializers === 'undefined') { console.error("DEBUG: PageInitializers não está definido."); return; }
        switch (pageId) {
            case 'home-page': PageInitializers.initHomePage(); break;
            case 'products-page': PageInitializers.initProductListPage(); this.updatePriceRangeDisplay(); break;
            case 'cart-page': PageInitializers.initCartPage(); break;
            case 'product-detail-page': PageInitializers.initProductDetailPage(); break;
            case 'checkout-page': PageInitializers.initCheckoutPage(); break;
            default: console.warn("DEBUG: Nenhum handler específico para a página com ID:", pageId);
        }
    },
    applyFilters: function() {
        if (typeof products === 'undefined' || typeof uiService === 'undefined') { console.error("DEBUG: Dependências faltando para applyFilters (products ou uiService)"); return; }
        let filteredProducts = [...products];
        const elements = { category: document.getElementById("filter-category"), color: document.getElementById("filter-color"), price: document.getElementById("filter-price"), sort: document.getElementById("sort-order") };
        const category = elements.category ? elements.category.value : "";
        const color = elements.color ? elements.color.value : "";
        const maxPrice = elements.price ? parseFloat(elements.price.value) : Infinity;
        const sortOrder = elements.sort ? elements.sort.value : "relevance";
        if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
        if (color) filteredProducts = filteredProducts.filter(p => p.color === color);
        if (elements.price && !isNaN(maxPrice) && maxPrice !== Infinity) { filteredProducts = filteredProducts.filter(p => p.price <= maxPrice); }
        switch (sortOrder) {
            case "price-asc": filteredProducts.sort((a, b) => a.price - b.price); break;
            case "price-desc": filteredProducts.sort((a, b) => b.price - a.price); break;
        }
        uiService.renderProductGrid(filteredProducts);
    },
    renderCheckoutSummary: function() {
        if (typeof cartService === 'undefined' || typeof uiService === 'undefined') { console.error("DEBUG: Dependências faltando para renderCheckoutSummary (cartService ou uiService)"); return; }
        const cart = cartService.get();
        const itemsContainer = document.getElementById('checkout-order-items');
        const subtotalEl = document.getElementById('summary-subtotal');
        const shippingEl = document.getElementById('summary-shipping');
        const totalEl = document.getElementById('summary-total');
        if (!itemsContainer || !subtotalEl || !shippingEl || !totalEl) { console.error("DEBUG: Elementos do DOM para o resumo do checkout não encontrados."); return; }
        itemsContainer.innerHTML = ''; let currentSubtotal = 0;
        if (cart.length === 0) { itemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>'; }
        else { cart.forEach(item => { const itemSubtotal = item.price * item.quantity; currentSubtotal += itemSubtotal; itemsContainer.innerHTML += `<div class="order-item"><img src="${item.images[0]}" alt="${item.name}"><div class="item-details"><p class="item-name">${item.name} ${item.selectedSize ? `(Tam: ${item.selectedSize})` : ''}</p><p class="item-qty-price">Qtd: ${item.quantity} | R$ ${item.price.toFixed(2).replace('.', ',')}</p></div><p class="item-total">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</p></div>`; }); }
        const shippingCost = 15.00; const currentTotal = currentSubtotal + shippingCost;
        subtotalEl.textContent = `R$ ${currentSubtotal.toFixed(2).replace('.', ',')}`;
        shippingEl.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
        totalEl.textContent = `R$ ${currentTotal.toFixed(2).replace('.', ',')}`;
        this.updateInstallmentOptions(currentTotal);
    },
    updateInstallmentOptions: function(totalValue) {
        const cardInstallmentsSelect = document.getElementById('card-installments');
        if (cardInstallmentsSelect) {
            cardInstallmentsSelect.innerHTML = '';
            if (totalValue > 0) {
                for (let i = 1; i <= 10; i++) { const installmentValue = (totalValue / i).toFixed(2).replace('.', ','); const option = document.createElement('option'); option.value = i; option.textContent = `${i}x de R$ ${installmentValue} ${i === 1 ? '' : (i <= 3 ? 'sem juros' : 'com juros')}`; cardInstallmentsSelect.appendChild(option); }
            } else { cardInstallmentsSelect.innerHTML = '<option value="1">1x de R$ 0,00</option>';}
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && App.init) {
        App.init();
    } else {
        console.error("DEBUG: Objeto App ou App.init não está definido no DOMContentLoaded.");
    }
});
