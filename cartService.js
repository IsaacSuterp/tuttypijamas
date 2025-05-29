// js/cartService.js (agora na raiz: cartService.js)
const cartService = {
    get: function() {
        return JSON.parse(localStorage.getItem("tutty_pijamas_cart")) || [];
    },
    save: function(cart) {
        localStorage.setItem("tutty_pijamas_cart", JSON.stringify(cart));
        if (typeof uiService !== 'undefined' && uiService.updateCartCount) {
            uiService.updateCartCount();
        }
    },
    add: function(productId, quantity = 1, size = null) {
        let cart = this.get();
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) {
            console.error("Produto não encontrado para adicionar ao carrinho:", productId);
            return;
        }
        const cartItemId = size ? `${product.id}-${size}` : `${product.id}-default`;
        const existingProduct = cart.find(item => item.cartItemId === cartItemId);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity, selectedSize: size, cartItemId: cartItemId });
        }
        this.save(cart);
        if (typeof uiService !== 'undefined' && uiService.showNotification) {
            uiService.showNotification(`${product.name} ${size ? '(Tamanho: ' + size + ')' : ''} foi adicionado ao carrinho!`);
        } else {
            alert(`${product.name} ${size ? '(Tamanho: ' + size + ')' : ''} foi adicionado ao carrinho!`);
        }
    },
    updateQuantity: function(cartItemId, quantity) {
        let cart = this.get();
        const itemToUpdate = cart.find(p => p.cartItemId === cartItemId);
        if (itemToUpdate) {
            itemToUpdate.quantity = parseInt(quantity, 10);
            if (itemToUpdate.quantity <= 0) {
                cart = cart.filter(p => p.cartItemId !== cartItemId);
            }
            this.save(cart);
        }
    },
    remove: function(cartItemId) {
        let cart = this.get();
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        this.save(cart);
    },
    clearCart: function() {
        this.save([]);
    }
};
