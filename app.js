// js/app.js
const App = {
    init() {
        if (typeof uiService !== 'undefined') {
            uiService.updateCartCount();
        } else {
            console.error("app.js: uiService não está definido ao iniciar App.");
        }
        this.handlePageSpecifics();
        this.bindEvents();
        this.initMobileMenu(); // Chamada da função do menu mobile
    },

    initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const menuClose = document.getElementById('mobile-menu-close');
        const mainNav = document.getElementById('main-nav');
        const backdrop = document.getElementById('menu-backdrop');

        const openMenu = () => {
            if (mainNav) mainNav.classList.add('active');
            if (menuToggle) menuToggle.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            document.body.classList.add('mobile-menu-open');
        };

        const closeMenu = () => {
            if (mainNav) mainNav.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        };

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                // Verifica se o menu está ativo para decidir se abre ou fecha
                if (mainNav && mainNav.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }

        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }

        if (backdrop) { 
            backdrop.addEventListener('click', closeMenu);
        }

        if (mainNav) { 
            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (mainNav.classList.contains('active')) {
                        closeMenu();
                    }
                    // A navegação para o href do link ocorrerá normalmente
                });
            });
        }
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
            // Removido: .popup-close e .popup-overlay agora são tratados no initPopup se necessário ou já cobertos.
            // Se o popup de newsletter ainda precisar de um evento de fechamento global, ele pode ser adicionado aqui.
            // Por ora, o evento do backdrop do menu mobile já cobre o clique fora da área do menu.
            // O .popup-close do newsletter é tratado no uiService.initPopup's event listener.
            
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
         // Listener para fechar o popup de newsletter que estava faltando no bindEvents global
        const closePopupButtonNews = document.querySelector('#newsletter-popup .popup-close');
        const newsletterPopupOverlay = document.getElementById('newsletter-popup');

        if(closePopupButtonNews) {
            closePopupButtonNews.addEventListener('click', () => {
                if (typeof uiService !== 'undefined') uiService.closePopup();
            });
        }
        if(newsletterPopupOverlay){
            newsletterPopupOverlay.addEventListener('click', (e) => {
                if (e.target === newsletterPopupOverlay) { // Se o clique foi no overlay e não na caixa
                    if (typeof uiService !== 'undefined') uiService.closePopup();
                }
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

    applyFilters() { /* ...código mantido... */ },
    renderCheckoutSummary() { /* ...código mantido... */ },
    updateInstallmentOptions(totalValue) { /* ...código mantido... */ }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
