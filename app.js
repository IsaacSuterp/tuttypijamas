// app.js
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
    },

    updatePriceRangeDisplay() {
        const priceRangeSlider = document.getElementById('filter-price');
        const priceRangeValueSpan = document.getElementById('price-range-value');

        if (priceRangeSlider && priceRangeValueSpan) {
            const value = parseInt(priceRangeSlider.value);
            const min = parseInt(priceRangeSlider.min || 0);
            const max = parseInt(priceRangeSlider.max || 100);
            
            const percentage = (min === max) ? (value >= max ? 100 : 0) : ((value - min) / (max - min)) * 100;

            priceRangeValueSpan.textContent = `R$ ${value}`;

            priceRangeSlider.style.background = `linear-gradient(to right, 
                var(--secondary-color) 0%, 
                var(--secondary-color) ${percentage}%, 
                var(--border-color) ${percentage}%, 
                var(--border-color) 100%
            )`;
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
                const cartItemId = event.target.dataset.productId; // No HTML do carrinho, usamos data-product-id para o cartItemId
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

            // Lógica da página de detalhes do produto
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

                // Interatividade das estrelas no formulário de avaliação
                const starsContainer = document.querySelector('.new-review-form .stars');
                if (starsContainer && event.target.classList.contains('star')) { // Verifica se o clique foi numa estrela
                    const ratingInput = document.getElementById('rating-value');
                    let currentRating = 0;
                    const allStars = starsContainer.querySelectorAll('.star');

                    const setActiveStars = (rating) => {
                        allStars.forEach(star => {
                            if (parseInt(star.dataset.value) <= rating) {
                                star.innerHTML = '&#9733;'; // Estrela Cheia
                                star.classList.add('selected');
                            } else {
                                star.innerHTML = '&#9734;'; // Estrela Vazia
                                star.classList.remove('selected');
                            }
                        });
                    };
                    
                    // Lógica de clique na estrela
                    currentRating = parseInt(event.target.dataset.value);
                    if (ratingInput) ratingInput.value = currentRating;
                    setActiveStars(currentRating);
                }
            } // Fim do if (document.body.id === 'product-detail-page')
        }); // Fim do event listener de clique

        // Event listener para mouseover e mouseout nas estrelas (fora do click para não redefinir a cada clique)
        if (document.body.id === 'product-detail-page') {
            const starsContainer = document.querySelector('.new-review-form .stars');
            const ratingInput = document.getElementById('rating-value');

            if (starsContainer && ratingInput) {
                const allStars = starsContainer.querySelectorAll('.star');
                const getCurrentRating = () => parseInt(ratingInput.value) || 0;

                allStars.forEach(star => {
                    star.addEventListener('mouseover', () => {
                        const hoverValue = parseInt(star.dataset.value);
                        allStars.forEach(s => {
                            s.innerHTML = parseInt(s.dataset.value) <= hoverValue ? '&#9733;' : '&#9734;';
                            s.classList.toggle('hovered', parseInt(s.dataset.value) <= hoverValue);
                        });
                    });

                    star.addEventListener('mouseout', () => {
                        allStars.forEach(s => s.classList.remove('hovered'));
                        const currentSelectedRating = getCurrentRating();
                        allStars.forEach(s => { // Restaura visualmente baseado no ratingInput.value
                             if (parseInt(s.dataset.value) <= currentSelectedRating) {
                                s.innerHTML = '&#9733;'; 
                                s.classList.add('selected');
                            } else {
                                s.innerHTML = '&#9734;'; 
                                s.classList.remove('selected');
                            }
                        });
                    });
                    
                    star.addEventListener('keydown', (e) => { // Para acessibilidade
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const clickedRating = parseInt(star.dataset.value);
                            ratingInput.value = clickedRating;
                            allStars.forEach(s => {
                                if (parseInt(s.dataset.value) <= clickedRating) {
                                    s.innerHTML = '&#9733;'; 
                                    s.classList.add('selected');
                                } else {
                                    s.innerHTML = '&#9734;'; 
                                    s.classList.remove('selected');
                                }
                            });
                        }
                    });
                });
            }
        }


        document.body.addEventListener('change', event => {
            if (event.target.matches('.cart-quantity-input')) {
                const cartItemId = event.target.dataset.productId;
                if (typeof cartService !== 'undefined') cartService.updateQuantity(cartItemId, event.target.value);
                if (document.body.id === 'cart-page' && typeof uiService !== 'undefined') uiService.renderCartPage();
            }
        });
        
        const filters = document.getElementById("filters");
        if (filters) { 
            filters.addEventListener("change", () => this.applyFilters()); 
        }
        
        const priceRangeSlider = document.getElementById('filter-price');
        if (priceRangeSlider) {
            priceRangeSlider.addEventListener('input', () => { 
                this.updatePriceRangeDisplay();
            });
        }
        
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) { 
            newsletterForm.addEventListener('submit', event => { 
                event.preventDefault(); 
                const emailInput = document.getElementById('popup-email');
                if (emailInput && emailInput.value.trim() !== "" && emailInput.checkValidity()) { // Validação básica
                    const formContent = document.getElementById('popup-form-content'); 
                    const successContent = document.getElementById('popup-success-content'); 
                    if(formContent) formContent.style.display = 'none'; 
                    if(successContent) successContent.style.display = 'block'; 
                    if (typeof uiService !== 'undefined') setTimeout(() => uiService.closePopup(), 4000); 
                } else {
                    if (typeof uiService !== 'undefined') uiService.showNotification('Por favor, insira um e-mail válido.', 'error');
                    if (emailInput) emailInput.focus();
                }
            }); 
        }

        // Listener para submissão do formulário de avaliação
        const reviewForm = document.getElementById('new-review-form-actual');
        if (reviewForm && document.body.id === 'product-detail-page') {
            reviewForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (typeof products === 'undefined' || typeof uiService === 'undefined') {
                    console.error("Dependências faltando para submeter avaliação.");
                    return;
                }

                const reviewerNameInput = document.getElementById('reviewer-name');
                const commentInput = document.getElementById('review-comment');
                const ratingValueInput = document.getElementById('rating-value');

                const reviewerName = reviewerNameInput.value.trim();
                const comment = commentInput.value.trim();
                const stars = parseInt(ratingValueInput.value);

                if (!reviewerName || !comment || stars === 0) {
                    uiService.showNotification('Por favor, preencha seu nome, comentário e selecione uma nota.', 'error');
                    return;
                }

                const params = new URLSearchParams(window.location.search);
                const productId = params.get('id');
                if (!productId) {
                    console.error("ID do produto não encontrado na URL para submeter avaliação.");
                    return;
                }

                const product = products.find(p => p.id === parseInt(productId));
                if (!product) {
                    console.error("Produto não encontrado no database para adicionar avaliação.");
                    return;
                }

                const today = new Date();
                const newReview = {
                    user: reviewerName,
                    stars: stars,
                    comment: comment,
                    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                };

                if (!product.customerReviews) {
                    product.customerReviews = [];
                }
                product.customerReviews.unshift(newReview); // Adiciona no início

                // Recalcula a média e o número de avaliações para o produto
                if (product.customerReviews.length > 0) {
                    let totalStars = 0;
                    product.customerReviews.forEach(r => { totalStars += r.stars; });
                    product.rating = parseFloat((totalStars / product.customerReviews.length).toFixed(1));
                    product.reviews = product.customerReviews.length;
                } else {
                    product.rating = 0;
                    product.reviews = 0;
                }
                
                uiService.renderCustomerReviews(product.customerReviews);

                // Atualiza os spans de rating e reviews no topo da página
                const productRatingSpan = document.getElementById('product-rating');
                const reviewsCountLink = document.getElementById('reviews-count');
                if (productRatingSpan) {
                    let starsHTML = '';
                    for (let i = 1; i <= 5; i++) {
                        starsHTML += `<span class="star ${i <= Math.round(product.rating) ? 'filled' : 'empty'}">${i <= Math.round(product.rating) ? '&#9733;' : '&#9734;'}</span>`;
                    }
                    productRatingSpan.innerHTML = `${starsHTML} ${product.rating} (${product.reviews} avaliações)`;
                }
                if (reviewsCountLink) reviewsCountLink.textContent = `Ver todas as ${product.reviews} avaliações`;

                uiService.showNotification('Obrigado pela sua avaliação!', 'success');
                reviewForm.reset(); 
                ratingValueInput.value = 0; // Reseta o valor escondido
                const allStarsInForm = reviewForm.querySelectorAll('.stars .star');
                allStarsInForm.forEach(s => { // Reseta visualmente as estrelas no formulário
                    s.innerHTML = '&#9734;'; 
                    s.classList.remove('selected');
                });
            });
        }
    }, // Fim de bindEvents

    handlePageSpecifics() {
        const pageId = document.body.id;
        console.log("DEBUG: App.handlePageSpecifics() chamado para a página:", pageId);
        if (typeof PageInitializers === 'undefined') { console.error("DEBUG: PageInitializers não está definido."); return; }
        switch (pageId) {
            case 'home-page': PageInitializers.initHomePage(); break;
            case 'products-page': 
                PageInitializers.initProductListPage(); 
                this.updatePriceRangeDisplay(); 
                break;
            case 'cart-page': PageInitializers.initCartPage(); break;
            case 'product-detail-page': PageInitializers.initProductDetailPage(); break;
            case 'checkout-page': PageInitializers.initCheckoutPage(); break;
            // case 'login-page': PageInitializers.initLoginPage(); break; // Se você criar um initLoginPage
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
                for (let i = 1; i <= 10; i++) { 
                    const installmentValue = (totalValue / i).toFixed(2).replace('.', ','); 
                    const option = document.createElement('option'); 
                    option.value = i; 
                    let interestText = 'sem juros'; // Padrão sem juros
                    // Simulação de juros: acima de 3x pode ter juros, mas vamos manter simples
                    // Em um cenário real, as regras de juros seriam mais complexas.
                    if (i > 3) { // Exemplo: juros para mais de 3 parcelas
                        // Para este exemplo, não calcularemos juros, apenas indicaremos
                        // interestText = 'com juros'; // Descomente se quiser indicar
                    }
                    if (i === 1) interestText = ''; // 1x não precisa de "sem juros"

                    option.textContent = `${i}x de R$ ${installmentValue} ${interestText}`.trim(); 
                    cardInstallmentsSelect.appendChild(option); 
                }
            } else { 
                cardInstallmentsSelect.innerHTML = '<option value="1">1x de R$ 0,00</option>';
            }
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
