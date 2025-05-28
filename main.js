// --- SERVIÇO DE UI (INTERFACE DO USUÁRIO) ---
const uiService = {
    renderProductCard: function(product) {
        const priceFormatted = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        const installmentPrice = (product.price / product.installments).toFixed(2).replace('.', ',');
        return `
            <div class="product-card">
                <a href="produto-detalhe.html?id=${product.id}"><img src="${product.images[0]}" alt="${product.name}"></a>
                <h3>${product.name}</h3>
                <div class="price">${priceFormatted}</div>
                <p>até ${product.installments}x de R$ ${installmentPrice}</p>
                {/* ATUALIZADO: Texto e classe do botão */}
                <button class="btn view-product-btn" data-product-id="${product.id}">Ver Mais</button>
            </div>
        `;
    },
    renderFeaturedProducts: function(products) {
        const grid = document.getElementById("featured-products-grid");
        if (grid) { const featured = products.slice(0, 4); grid.innerHTML = featured.map(this.renderProductCard).join(''); }
    },
    renderProductGrid: function(productsToRender) {
        const grid = document.getElementById("product-grid");
        if (grid) {
            if (productsToRender.length === 0) { grid.innerHTML = "<p>Nenhum produto encontrado.</p>"; return; }
            grid.innerHTML = productsToRender.map(this.renderProductCard).join('');
        }
    },
    renderCartPage: function() {
        const cart = cartService.get(); const container = document.querySelector(".cart-container");
        const itemsContainer = document.getElementById("cart-items"); const summaryContainer = document.getElementById("cart-summary");
        if (!container) return;
        if (cart.length === 0) { container.innerHTML = "<div style='text-align:center; width:100%;'><h1 class='section-title'>Seu carrinho está vazio.</h1><a href='produtos.html' class='btn'>Ver produtos</a></div>"; return; }
        let subtotal = 0;
        itemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity; subtotal += itemTotal;
            return `<tr><td data-label="Produto"><div class="cart-product-info"><img src="${item.images[0]}" alt="${item.name}"><div><span>${item.name}</span><br><small>${item.selectedSize ? 'Tam: ' + item.selectedSize : ''}</small></div></div></td><td data-label="Preço">R$ ${item.price.toFixed(2).replace('.', ',')}</td><td data-label="Quantidade"><input class="cart-quantity-input" type="number" value="${item.quantity}" min="1" data-product-id="${item.id}"></td><td data-label="Total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td><td data-label="Remover"><button class="remove-from-cart-btn" data-product-id="${item.id}">Remover</button></td></tr>`;
        }).join('');
        const frete = 15.00; const total = subtotal + frete;
        summaryContainer.innerHTML = `<h3>Resumo do Pedido</h3><p><span>Subtotal</span> <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p><p><span>Frete</span> <strong>R$ ${frete.toFixed(2).replace('.', ',')}</strong></p><hr><p><span>Total</span> <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p><a href="#" class="btn">Finalizar Compra</a>`;
    },
    updateCartCount: function() {
        const cart = cartService.get(); const countElement = document.getElementById("cart-count");
        if (countElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            countElement.textContent = totalItems; countElement.style.display = totalItems > 0 ? "block" : "none";
        }
    },
    initPopup: function() {
        const popup = document.getElementById('newsletter-popup');
        if (!popup || sessionStorage.getItem('popupShown')) return;
        setTimeout(() => { popup.classList.add('active'); sessionStorage.setItem('popupShown', 'true'); }, 2000);
    },
    closePopup: function() {
        const popup = document.getElementById('newsletter-popup');
        if (popup) popup.classList.remove('active');
    },
    showNotification: function(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) { alert(message); return; }
        notification.textContent = message; notification.className = `notification ${type} show`;
        setTimeout(() => { notification.classList.remove('show'); }, 4000);
    }
};

// --- SERVIÇO DE CARRINHO ---
const cartService = {
    get: function() { return JSON.parse(localStorage.getItem("tutty_pijamas_cart")) || []; },
    save: function(cart) { localStorage.setItem("tutty_pijamas_cart", JSON.stringify(cart)); uiService.updateCartCount(); },
    add: function(productId, quantity = 1, size = null) { // Função add original para uso na página de detalhes
        let cart = this.get();
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;
        const cartItemId = size ? `${product.id}-${size}` : `${product.id}`;
        const existingProduct = cart.find(item => item.cartItemId === cartItemId);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity, selectedSize: size, cartItemId: cartItemId });
        }
        this.save(cart);
        alert(`${product.name} ${size ? '(Tamanho: ' + size + ')' : ''} foi adicionado ao carrinho!`);
    },
    updateQuantity: function(productId, quantity) {
        let cart = this.get(); const item = cart.find(p => p.id === parseInt(productId)); // Assumindo que no carrinho o ID é único por linha, se não, usar cartItemId
        if (item) {
            item.quantity = parseInt(quantity, 10);
            if (item.quantity <= 0) { cart = cart.filter(p => p.cartItemId !== item.cartItemId); } // Usar cartItemId para remover
            this.save(cart);
        }
    },
    remove: function(productId) { // Assumindo que no carrinho o ID é único por linha, se não, usar cartItemId
        let cart = this.get();
        const itemToRemove = cart.find(p => p.id === parseInt(productId));
        if (itemToRemove) {
            cart = cart.filter(item => item.cartItemId !== itemToRemove.cartItemId);
            this.save(cart);
        }
    }
};

// --- APLICAÇÃO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    const App = {
        init() {
            uiService.updateCartCount();
            this.handlePageSpecifics();
            this.bindEvents();
        },
        bindEvents() {
            document.body.addEventListener('click', event => {
                // NOVO: Evento para o botão "Ver Mais" nos cards de produto
                if (event.target.matches('.view-product-btn')) {
                    const productId = event.target.dataset.productId;
                    if (productId) {
                        window.location.href = `produto-detalhe.html?id=${productId}`;
                    }
                }
                // Evento para remover do carrinho (continua o mesmo)
                if (event.target.matches('.remove-from-cart-btn')) {
                    // Para o remove, precisamos identificar unicamente o item se ele tiver variações.
                    // Se o data-product-id no botão for o 'cartItemId', então está ok.
                    // Se for apenas o 'product.id', e houver itens com mesmo id mas tamanhos diferentes,
                    // precisaríamos de uma forma mais específica de identificar.
                    // Assumindo por agora que o data-product-id no botão remover é o ID original do produto
                    // e que a lógica de remoção no cartService lida com isso (idealmente usaria um cartItemId).
                    // A função cartService.remove foi simplificada e pode precisar de ajuste
                    // se você permitir o mesmo produto com tamanhos diferentes como itens separados no carrinho.
                    // Por ora, se o botão do 'remove' tiver o ID do produto (e não o cartItemId), o cartService.remove
                    // removerá a primeira ocorrência ou precisaria de um cartItemId.
                    // Para simplificar, vamos assumir que o botão remove usa o product.id original e o cartService.remove
                    // remove o item que corresponde a esse product.id e talvez a primeira ocorrência se houver duplicatas com variações.
                    const productId = event.target.dataset.productId;
                     // A lógica de remoção no cartService pode precisar ser ajustada para usar cartItemId se produtos com variações são adicionados como itens distintos
                    cartService.remove(productId); 
                    if (document.body.id === 'cart-page') uiService.renderCartPage();
                }
                if (event.target.matches('.popup-close') || event.target.matches('.popup-overlay')) {
                    uiService.closePopup();
                }
                if (event.target.matches('.collection-button')) {
                    const targetPage = event.target.dataset.target;
                    if (targetPage) window.location.href = targetPage;
                }
                 // Lógica específica da página de produto
                if(document.body.id === 'product-detail-page'){
                    if(event.target.matches('#size-guide-link')) {
                        event.preventDefault();
                        document.getElementById('size-guide-modal').classList.add('active');
                    }
                     if(event.target.matches('.modal-close') || event.target.matches('.modal-overlay')) {
                        document.getElementById('size-guide-modal').classList.remove('active');
                    }
                    if(event.target.matches('.thumbnail')) {
                        const mainImage = document.getElementById('main-product-image');
                        mainImage.src = event.target.src;
                        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                        event.target.classList.add('active');
                    }
                    if(event.target.matches('.size-btn')) {
                        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                        event.target.classList.add('active');
                    }
                     if(event.target.matches('.tab-link')) {
                        const tabId = event.target.dataset.tab;
                        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        event.target.classList.add('active');
                        document.getElementById(tabId).classList.add('active');
                    }
                    if(event.target.matches('#add-to-cart-detail')) { // Botão "Adicionar ao Carrinho" da página de detalhes
                        const productId = event.target.dataset.productId;
                        const quantity = parseInt(document.getElementById('quantity').value);
                        const selectedSizeEl = document.querySelector('.size-btn.active');
                        if(!selectedSizeEl) {
                            alert('Por favor, selecione um tamanho.');
                            return;
                        }
                        const size = selectedSizeEl.textContent;
                        cartService.add(productId, quantity, size); // Usa a função add original
                    }
                }
            });
            document.body.addEventListener('change', event => {
                if (event.target.matches('.cart-quantity-input')) {
                    // Similar ao remove, o updateQuantity precisa identificar o item corretamente, idealmente por cartItemId
                    cartService.updateQuantity(event.target.dataset.productId, event.target.value);
                    if (document.body.id === 'cart-page') uiService.renderCartPage();
                }
            });
            const filters = document.getElementById("filters");
            if (filters) { filters.addEventListener("change", () => this.applyFilters()); }
            
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                 newsletterForm.addEventListener('submit', event => {
                    event.preventDefault();
                    document.getElementById('popup-form-content').style.display = 'none';
                    document.getElementById('popup-success-content').style.display = 'block';
                    setTimeout(() => uiService.closePopup(), 4000);
                });
            }
        },
        handlePageSpecifics() {
            const pageId = document.body.id;
            switch (pageId) {
                case 'home-page': uiService.renderFeaturedProducts(products); uiService.initPopup(); break;
                case 'products-page': this.applyFilters(); break;
                case 'cart-page': uiService.renderCartPage(); break;
                case 'product-detail-page': this.initProductDetailPage(); break;
            }
        },
        initProductDetailPage() { // Função da página de detalhes do produto (mantida)
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            if (!productId) { document.querySelector('.product-page-layout').innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
            const product = products.find(p => p.id === parseInt(productId));
            if (!product) { document.querySelector('.product-page-layout').innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
            document.title = `${product.name} - Tutty Pijamas`;
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-rating').innerHTML = `⭐ ${product.rating} (${product.reviews} avaliações)`;
            document.getElementById('reviews-count').textContent = `Ver todas as ${product.reviews} avaliações`;
            document.getElementById('product-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
            document.getElementById('product-installments').textContent = `em até ${product.installments}x de R$ ${(product.price / product.installments).toFixed(2).replace('.', ',')}`;
            document.getElementById('product-short-description').textContent = product.description;
            document.getElementById('product-full-description').textContent = product.description + " Mais detalhes sobre o caimento, tecido e modelagem podem ser adicionados aqui para fornecer uma visão completa da peça.";
            const specsList = document.getElementById('product-specs');
            specsList.innerHTML = `<li><strong>Composição:</strong> ${product.fabric}</li><li><strong>Cor:</strong> ${product.color}</li><li><strong>Estilo:</strong> ${product.style}</li><li><strong>Cuidados:</strong> Lavar à mão com água fria. Não usar alvejante. Secar à sombra.</li>`;
            document.getElementById('main-product-image').src = product.images[0];
            const thumbnailsContainer = document.getElementById('product-thumbnails');
            thumbnailsContainer.innerHTML = product.images.map((img, index) => `<img src="${img}" alt="Miniatura ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}">`).join('');
            const sizeSelector = document.getElementById('size-selector');
            sizeSelector.innerHTML = product.sizes.map(size => `<button class="size-btn">${size}</button>`).join('');
            document.getElementById('add-to-cart-detail').dataset.productId = product.id;
            const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
            document.getElementById('related-products-grid').innerHTML = relatedProducts.map(p => uiService.renderProductCard(p)).join('');
            this.initZoomEffect();
        },
        initZoomEffect() { // Função do zoom (mantida)
            const container = document.querySelector('.main-image-container');
            const img = document.getElementById('main-product-image');
            if (!container || !img) return;
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) * 100; const yPercent = (y / rect.height) * 100;
                img.style.transformOrigin = `${xPercent}% ${yPercent}%`; img.style.transform = 'scale(2)';
            });
            container.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; img.style.transformOrigin = 'center center'; });
        },
        applyFilters() {
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
        }
    };
    App.init();
});
