// --- SERVIÇO DE UI (INTERFACE DO USUÁRIO) ---
const uiService = {
    renderProductCard: function(product) {
        const priceFormatted = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        const installmentPrice = (product.price / product.installments).toFixed(2).replace('.', ',');
        return `
            <div class="product-card">
                <a href="produto-detalhe.html?id=${product.id}"><img src="${product.images[0]}" alt="${product.name}"></a>
                <h3>${product.name}</h3><div class="price">${priceFormatted}</div>
                <p>até ${product.installments}x de R$ ${installmentPrice}</p>
                <button class="btn add-to-cart-btn" data-product-id="${product.id}">Comprar</button>
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
            return `<tr><td><div style="display: flex; align-items: center;"><img src="${item.images[0]}" alt="${item.name}"><span>${item.name}</span></div></td><td>R$ ${item.price.toFixed(2).replace('.', ',')}</td><td><input class="cart-quantity-input" type="number" value="${item.quantity}" min="1" data-product-id="${item.id}"></td><td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td><td><button class="remove-from-cart-btn" data-product-id="${item.id}">Remover</button></td></tr>`;
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
        if (!notification) { alert(message); return; } // Fallback para alert
        notification.textContent = message; notification.className = `notification ${type} show`;
        setTimeout(() => { notification.classList.remove('show'); }, 4000);
    }
};

// --- SERVIÇO DE CARRINHO ---
const cartService = {
    get: function() { return JSON.parse(localStorage.getItem("tutty_pijamas_cart")) || []; },
    save: function(cart) { localStorage.setItem("tutty_pijamas_cart", JSON.stringify(cart)); uiService.updateCartCount(); },
    add: function(productId) {
        const cart = this.get(); const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) { existingProduct.quantity++; } else { cart.push({ ...product, quantity: 1 }); }
        this.save(cart);
        uiService.showNotification(`${product.name} foi adicionado ao carrinho!`);
    },
    updateQuantity: function(productId, quantity) {
        let cart = this.get(); const item = cart.find(p => p.id === parseInt(productId));
        if (item) {
            item.quantity = parseInt(quantity, 10);
            if (item.quantity <= 0) { cart = cart.filter(p => p.id !== parseInt(productId)); }
            this.save(cart);
        }
    },
    remove: function(productId) {
        let cart = this.get(); cart = cart.filter(item => item.id !== parseInt(productId));
        this.save(cart);
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
                if (event.target.matches('.add-to-cart-btn')) {
                    cartService.add(event.target.dataset.productId);
                }
                if (event.target.matches('.remove-from-cart-btn')) {
                    cartService.remove(event.target.dataset.productId);
                    uiService.renderCartPage();
                }
                if (event.target.matches('.popup-close') || event.target.matches('.popup-overlay')) {
                    uiService.closePopup();
                }
            });
            document.body.addEventListener('change', event => {
                if (event.target.matches('.cart-quantity-input')) {
                    cartService.updateQuantity(event.target.dataset.productId, event.target.value);
                    uiService.renderCartPage();
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
            }
        },
        applyFilters() {
            let filteredProducts = [...products];
            const category = document.getElementById("filter-category").value;
            const color = document.getElementById("filter-color").value;
            const maxPrice = parseFloat(document.getElementById("filter-price").value);
            const sortOrder = document.getElementById("sort-order").value;
            if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
            if (color) filteredProducts = filteredProducts.filter(p => p.color === color);
            if (!isNaN(maxPrice)) filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
            switch (sortOrder) {
                case "price-asc": filteredProducts.sort((a, b) => a.price - b.price); break;
                case "price-desc": filteredProducts.sort((a, b) => b.price - a.price); break;
            }
            uiService.renderProductGrid(filteredProducts);
        }
    };
    App.init();
});
