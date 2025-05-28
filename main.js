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
    add: function(productId, quantity = 1, size = null) {
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
        let cart = this.get();
        const itemToUpdate = cart.find(p => p.id === parseInt(productId)); // Supondo que o ID no input é o product.id
        if (itemToUpdate) { // Idealmente, você identificaria o item pelo cartItemId se houver variações
            itemToUpdate.quantity = parseInt(quantity, 10);
            if (itemToUpdate.quantity <= 0) {
                cart = cart.filter(p => p.cartItemId !== itemToUpdate.cartItemId);
            }
            this.save(cart);
        }
    },
    remove: function(productId) {
        let cart = this.get();
        // Esta lógica de remoção pode precisar ser mais específica se o mesmo produto.id puder existir com diferentes cartItemIds (tamanhos)
        // Por ora, ela remove a primeira ocorrência ou todas as ocorrências com esse productId, dependendo se cartItemId foi usado na adição.
        // Vamos refinar para remover com base no cartItemId se ele existir, ou product.id se não.
        const itemToRemove = cart.find(p => p.id === parseInt(productId)); // Assume que o botão remove passa o product.id
        if (itemToRemove) {
             // Se os itens no carrinho têm cartItemId (produto + tamanho), use-o para remover o item específico
             // Se não, e você só tem productId, esta lógica pode remover o item errado se houver várias variações do mesmo produto
            cart = cart.filter(item => item.cartItemId !== itemToRemove.cartItemId); // Idealmente, o botão passaria o cartItemId
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
                if (event.target.matches('.view-product-btn')) {
                    const productId = event.target.dataset.productId;
                    if (productId) {
                        window.location.href = `produto-detalhe.html?id=${productId}`;
                    }
                }
                if (event.target.matches('.remove-from-cart-btn')) {
                    const productId = event.target.dataset.productId;
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
                        if(mainImage) mainImage.src = event.target.src;
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
                        const targetTabContent = document.getElementById(tabId);
                        if(targetTabContent) targetTabContent.classList.add('active');
                    }
                    if(event.target.matches('#add-to-cart-detail')) {
                        const productId = event.target.dataset.productId;
                        const quantityInput = document.getElementById('quantity');
                        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                        const selectedSizeEl = document.querySelector('.size-btn.active');
                        if(!selectedSizeEl) {
                            alert('Por favor, selecione um tamanho.');
                            return;
                        }
                        const size = selectedSizeEl.textContent;
                        cartService.add(productId, quantity, size);
                    }
                }
            });
            document.body.addEventListener('change', event => {
                if (event.target.matches('.cart-quantity-input')) {
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
                    const formContent = document.getElementById('popup-form-content');
                    const successContent = document.getElementById('popup-success-content');
                    if(formContent) formContent.style.display = 'none';
                    if(successContent) successContent.style.display = 'block';
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
        initProductDetailPage() {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            const layoutElement = document.querySelector('.product-page-layout');

            if (!productId) { if(layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
            const product = products.find(p => p.id === parseInt(productId));
            if (!product) { if(layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }

            document.title = `${product.name} - Tutty Pijamas`;
            const productNameEl = document.getElementById('product-name');
            const productRatingEl = document.getElementById('product-rating');
            const reviewsCountEl = document.getElementById('reviews-count');
            const productPriceEl = document.getElementById('product-price');
            const productInstallmentsEl = document.getElementById('product-installments');
            const productShortDescEl = document.getElementById('product-short-description');
            const productFullDescEl = document.getElementById('product-full-description');
            const specsListEl = document.getElementById('product-specs');
            const mainImageEl = document.getElementById('main-product-image');
            const thumbnailsContainerEl = document.getElementById('product-thumbnails');
            const sizeSelectorEl = document.getElementById('size-selector');
            const addToCartDetailBtn = document.getElementById('add-to-cart-detail');
            const relatedProductsGridEl = document.getElementById('related-products-grid');


            if(productNameEl) productNameEl.textContent = product.name;
            if(productRatingEl) productRatingEl.innerHTML = `⭐ ${product.rating} (${product.reviews} avaliações)`;
            if(reviewsCountEl) reviewsCountEl.textContent = `Ver todas as ${product.reviews} avaliações`;
            if(productPriceEl) productPriceEl.textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
            if(productInstallmentsEl) productInstallmentsEl.textContent = `em até ${product.installments}x de R$ ${(product.price / product.installments).toFixed(2).replace('.', ',')}`;
            if(productShortDescEl) productShortDescEl.textContent = product.description; // Usando a descrição principal aqui
            if(productFullDescEl) productFullDescEl.textContent = product.description + " Detalhes adicionais sobre material, caimento, e ocasiões de uso para uma descrição completa e atraente.";
            
            if(specsListEl) specsListEl.innerHTML = `<li><strong>Composição:</strong> ${product.fabric}</li><li><strong>Cor:</strong> ${product.color}</li><li><strong>Estilo:</strong> ${product.style}</li><li><strong>Cuidados:</strong> Lavar à mão com água fria. Não usar alvejante. Secar à sombra.</li>`;
            if(mainImageEl) mainImageEl.src = product.images[0];
            if(thumbnailsContainerEl) thumbnailsContainerEl.innerHTML = product.images.map((img, index) => `<img src="${img}" alt="Miniatura ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}">`).join('');
            if(sizeSelectorEl) sizeSelectorEl.innerHTML = product.sizes.map(size => `<button class="size-btn">${size}</button>`).join('');
            if(addToCartDetailBtn) addToCartDetailBtn.dataset.productId = product.id;
            
            const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
            if(relatedProductsGridEl && relatedProducts.length > 0) {
                relatedProductsGridEl.innerHTML = relatedProducts.map(p => uiService.renderProductCard(p)).join('');
            } else if (relatedProductsGridEl) {
                relatedProductsGridEl.innerHTML = "<p>Sem produtos relacionados no momento.</p>";
            }
            
            this.initZoomEffect();
        },
        initZoomEffect() {
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
