// js/uiService.js (agora na raiz: uiService.js)
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
    renderFeaturedProducts: function(allProducts) {
        const grid = document.getElementById("featured-products-grid");
        if (grid && allProducts && allProducts.length > 0) {
            const featured = allProducts.slice(0, 4);
            grid.innerHTML = featured.map(this.renderProductCard).join('');
        }
    },
    renderProductGrid: function(productsToRender) {
        const grid = document.getElementById("product-grid");
        if (grid) {
            if (!productsToRender || productsToRender.length === 0) {
                grid.innerHTML = "<p>Nenhum produto encontrado.</p>";
                return;
            }
            grid.innerHTML = productsToRender.map(this.renderProductCard).join('');
        }
    },
    renderCartPage: function() {
        if (typeof cartService === 'undefined') { console.error("cartService não está definido para renderCartPage."); return; }
        const cart = cartService.get();
        const container = document.querySelector(".cart-container");
        const itemsContainer = document.getElementById("cart-items");
        const summaryContainer = document.getElementById("cart-summary");

        if (!container) return;
        if (!itemsContainer || !summaryContainer) {
            if(cart.length === 0 && container){
                 container.innerHTML = "<div style='text-align:center; width:100%;'><h1 class='section-title'>Seu carrinho está vazio.</h1><a href='produtos.html' class='btn'>Ver produtos</a></div>";
            }
            return;
        }

        if (cart.length === 0) {
            container.innerHTML = "<div style='text-align:center; width:100%;'><h1 class='section-title'>Seu carrinho está vazio.</h1><a href='produtos.html' class='btn'>Ver produtos</a></div>";
            summaryContainer.innerHTML = '';
            return;
        }
        let subtotal = 0;
        itemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity; subtotal += itemTotal;
            return `<tr><td data-label="Produto"><div class="cart-product-info"><img src="${item.images[0]}" alt="${item.name}"><div><span>${item.name}</span><br><small>${item.selectedSize ? 'Tam: ' + item.selectedSize : ''}</small></div></div></td><td data-label="Preço">R$ ${item.price.toFixed(2).replace('.', ',')}</td><td data-label="Quantidade"><input class="cart-quantity-input" type="number" value="${item.quantity}" min="1" data-product-id="${item.cartItemId}"></td><td data-label="Total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td><td data-label="Remover"><button class="remove-from-cart-btn" data-product-id="${item.cartItemId}">Remover</button></td></tr>`;
        }).join('');
        const frete = 15.00; const total = subtotal + frete;
        summaryContainer.innerHTML = `<h3>Resumo do Pedido</h3><p><span>Subtotal</span> <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p><p><span>Frete</span> <strong>R$ ${frete.toFixed(2).replace('.', ',')}</strong></p><hr><p><span>Total</span> <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p><a href="checkout.html" class="btn">Finalizar Compra</a>`;
    },
    updateCartCount: function() {
        if (typeof cartService === 'undefined') { console.error("cartService não está definido para updateCartCount."); return; }
        const cart = cartService.get();
        const countElement = document.getElementById("cart-count");
        if (countElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            countElement.textContent = totalItems;
            countElement.style.display = totalItems > 0 ? "block" : "none";
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
        if (!notification && (document.body.id === 'login-page' || document.body.id === 'checkout-page')) { 
            console.warn("Elemento de notificação não encontrado na página.");
            alert(message); return; 
        }
        if (notification) {
            notification.textContent = message; notification.className = `notification ${type} show`;
            setTimeout(() => { notification.classList.remove('show'); }, 4000);
        } else {
            alert(message);
        }
    }
};
