document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA INICIAL E RENDERIZAÇÃO DE PÁGINAS ---
    updateCartCount();

    if (document.body.id === 'home-page') {
        renderFeaturedProducts();
    }
    if (document.body.id === 'products-page') {
        renderProductGrid(products);
        setupFilters();
    }
    if (document.body.id === 'cart-page') {
        renderCartPage();
    }

    // --- LÓGICA DO POP-UP DE NEWSLETTER (Executa apenas na Home) ---
    if (document.body.id === 'home-page') {
        const newsletterPopup = document.getElementById('newsletter-popup');
        const closePopupButton = document.querySelector('.popup-close');
        const newsletterForm = document.getElementById('newsletter-form');
        const popupFormContent = document.getElementById('popup-form-content');
        const popupSuccessContent = document.getElementById('popup-success-content');

        // Função para mostrar o pop-up
        const showPopup = () => {
            // Verifica se o pop-up já foi mostrado nesta sessão
            if (newsletterPopup && !sessionStorage.getItem('popupShown')) {
                newsletterPopup.classList.add('active');
                sessionStorage.setItem('popupShown', 'true'); // Marca como mostrado
            }
        };

        // Função para fechar o pop-up
        const closePopup = () => {
            if (newsletterPopup) {
                newsletterPopup.classList.remove('active');
            }
        };

        // Mostrar o pop-up após 2 segundos
        setTimeout(showPopup, 2000);

        // Event listeners para fechar
        if (newsletterPopup) {
            closePopupButton.addEventListener('click', closePopup);
            newsletterPopup.addEventListener('click', (e) => {
                // Fecha se o clique for no overlay escuro, fora da caixa do pop-up
                if (e.target === newsletterPopup) {
                    closePopup();
                }
            });
        }
        
        // Event listener para o envio do formulário
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Simulação de envio bem-sucedido
                // Esconde o formulário e mostra a mensagem de sucesso
                if (popupFormContent && popupSuccessContent) {
                    popupFormContent.style.display = 'none';
                    popupSuccessContent.style.display = 'block';
                }

                // Fecha o pop-up automaticamente após 4 segundos
                setTimeout(closePopup, 4000);
            });
        }
    }
});


// === FUNÇÕES GLOBAIS DO CARRINHO ===
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
        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = "block";
        } else {
            cartCountElement.style.display = "none";
        }
    }
}


// === RENDERIZAÇÃO DE PRODUTOS ===
function renderProductCard(product) {
    const priceFormatted = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
    const installmentPrice = (product.price / product.installments).toFixed(2).replace('.', ',');
    return `
        <div class="product-card">
            <a href="produto-detalhe.html?id=${product.id}">
                <img src="${product.images[0]}" alt="${product.name}">
            </a>
            <h3>${product.name}</h3>
            <div class="price">${priceFormatted}</div>
            <p>até ${product.installments}x de R$ ${installmentPrice}</p>
            <button class="btn" onclick="addToCart(${product.id})">Comprar</button>
        </div>
    `;
}

function renderFeaturedProducts() {
    const featuredGrid = document.getElementById("featured-products-grid");
    if (featuredGrid) {
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


// === LÓGICA DOS FILTROS ===
function setupFilters() {
    const filters = document.getElementById("filters");
    if (filters) {
        filters.addEventListener("change", applyFilters);
    }
}

function applyFilters() {
    let filteredProducts = [...products];
    const category = document.getElementById("filter-category").value;
    const color = document.getElementById("filter-color").value;
    const maxPrice = parseFloat(document.getElementById("filter-price").value);
    const sortOrder = document.getElementById("sort-order").value;

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    if (color) {
        filteredProducts = filteredProducts.filter(p => p.color === color);
    }
    if (!isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    switch (sortOrder) {
        case "price-asc":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
    }
    
    renderProductGrid(filteredProducts);
}


// === LÓGICA DA PÁGINA DO CARRINHO ===
function renderCartPage() {
    const cart = getCart();
    const cartContainer = document.querySelector(".cart-container");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartSummaryContainer = document.getElementById("cart-summary");

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<div style='text-align:center; width:100%;'><h1 class='section-title'>Seu carrinho está vazio.</h1><a href='produtos.html' class='btn'>Ver produtos</a></div>";
        return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center;">
                        <img src="${item.images[0]}" alt="${item.name}">
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
                <td><input type="number" value="${item.quantity}" min="1" style="width: 60px; padding: 5px;" onchange="updateQuantity(${item.id}, this.value)"></td>
                <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
                <td><button onclick="removeFromCart(${item.id})">Remover</button></td>
            </tr>
        `;
    }).join('');

    const frete = 15.00; // Valor fixo para simulação
    const total = subtotal + frete;

    cartSummaryContainer.innerHTML = `
        <h3>Resumo do Pedido</h3>
        <p><span>Subtotal</span> <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p>
        <p><span>Frete</span> <strong>R$ ${frete.toFixed(2).replace('.', ',')}</strong></p>
        <hr>
        <p><span>Total</span> <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p>
        <a href="checkout.html" class="btn">Finalizar Compra</a>
    `;
}

function updateQuantity(productId, quantity) {
    let cart = getCart();
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity = parseInt(quantity, 10);
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== productId);
        }
        saveCart(cart);
        renderCartPage();
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartPage();
                                   }
