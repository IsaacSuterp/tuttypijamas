document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // Lógica para cada página específica
    if (document.body.id === "home-page") {
        renderFeaturedProducts();
    }
    if (document.body.id === "products-page") {
        renderProductGrid(products);
        setupFilters();
    }
    if (document.body.id === "cart-page") {
        renderCartPage();
    }
});

// FUNÇÕES DO CARRINHO (usando localStorage para persistir dados)

function getCart() {
    return JSON.parse(localStorage.getItem("tutty_pijamas_cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("tutty_pijamas_cart", JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    const cart = getCart();
    const product = products.find(p => p.id === productId);

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    alert(`${product.name} foi adicionado ao carrinho!`);
}

function updateCartCount() {
    const cart = getCart();
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? "block" : "none";
    }
}


// RENDERIZAÇÃO DE PRODUTOS

function renderProductCard(product) {
    const priceFormatted = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
    return `
        <div class="product-card">
            <a href="produto-detalhe.html?id=${product.id}">
                <img src="${product.images[0]}" alt="${product.name}">
            </a>
            <h3>${product.name}</h3>
            <div class="price">${priceFormatted}</div>
            <p>até ${product.installments}x de R$ ${(product.price / product.installments).toFixed(2).replace('.', ',')} sem juros</p>
            <button class="btn" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
        </div>
    `;
}

function renderFeaturedProducts() {
    const featuredGrid = document.getElementById("featured-products-grid");
    if (featuredGrid) {
        // Mostra os 4 primeiros produtos como destaque
        const featured = products.slice(0, 4);
        featuredGrid.innerHTML = featured.map(renderProductCard).join('');
    }
}

function renderProductGrid(productsToRender) {
    const productGrid = document.getElementById("product-grid");
    if (productGrid) {
        if (productsToRender.length === 0) {
            productGrid.innerHTML = "<p>Nenhum produto encontrado com os filtros selecionados.</p>";
            return;
        }
        productGrid.innerHTML = productsToRender.map(renderProductCard).join('');
    }
}

// LÓGICA DOS FILTROS

function setupFilters() {
    const filters = document.getElementById("filters");
    filters.addEventListener("change", applyFilters);
}

function applyFilters() {
    let filteredProducts = [...products];

    // Obter valores dos filtros
    const category = document.getElementById("filter-category").value;
    const color = document.getElementById("filter-color").value;
    const maxPrice = parseFloat(document.getElementById("filter-price").value);
    const sortOrder = document.getElementById("sort-order").value;

    // Aplicar filtros
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    if (color) {
        filteredProducts = filteredProducts.filter(p => p.color === color);
    }
    if (!isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // Aplicar ordenação
    switch(sortOrder) {
        case "price-asc":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        // "relevance" é o padrão (sem ordenação específica)
    }
    
    renderProductGrid(filteredProducts);
}

// LÓGICA DA PÁGINA DO CARRINHO

function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalsContainer = document.getElementById("cart-totals");

    if (!cartItemsContainer || !cartTotalsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<tr><td colspan='5'>Seu carrinho está vazio.</td></tr>";
        cartTotalsContainer.innerHTML = "";
        return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <tr>
                <td><img src="${item.images[0]}" alt="${item.name}" width="50"> ${item.name}</td>
                <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
                <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)"></td>
                <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
                <td><button onclick="removeFromCart(${item.id})">Remover</button></td>
            </tr>
        `;
    }).join('');

    const frete = 15.00; // Valor fixo para simulação
    const total = subtotal + frete;

    cartTotalsContainer.innerHTML = `
        <h3>Resumo do Pedido</h3>
        <p>Subtotal: <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p>
        <p>Frete: <strong>R$ ${frete.toFixed(2).replace('.', ',')}</strong></p>
        <hr>
        <p>Total: <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p>
        <a href="checkout.html" class="btn">Finalizar Compra</a>
    `;
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity = parseInt(quantity, 10);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
            renderCartPage(); // Re-renderiza a página do carrinho
        }
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage(); // Re-renderiza a página do carrinho
            }
