document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    let allProducts = []; // Array para o "banco de dados" de produtos

    // ===============================================================
    //                       1. INICIALIZAÇÃO
    // ===============================================================

    function populateProductsArray() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            allProducts.push({
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                image: card.dataset.image,
            });
        });
    }

    // ===============================================================
    //                       2. LÓGICA DA PESQUISA
    // ===============================================================
    const searchIcon = document.getElementById('search-icon');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.querySelector('.close-search-btn');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    function openSearch() {
        searchOverlay.classList.add('active');
        body.classList.add('search-open');
        setTimeout(() => searchInput.focus(), 300); // Foca no campo após a transição
    }

    function closeSearch() {
        searchOverlay.classList.remove('active');
        body.classList.remove('search-open');
        searchInput.value = '';
        searchResultsContainer.innerHTML = '';
    }

    function displayResults(results) {
        searchResultsContainer.innerHTML = '';

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p class="search-no-results">Nenhum resultado encontrado.</p>';
            return;
        }

        results.forEach(product => {
            const resultHTML = `
                <a href="#products" class="search-result-item" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="search-result-info">
                        <span class="product-name">${product.name}</span>
                        <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                </a>
            `;
            searchResultsContainer.innerHTML += resultHTML;
        });
    }

    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
    });

    closeSearchBtn.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            searchResultsContainer.innerHTML = '';
            return;
        }

        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );

        displayResults(filteredProducts);
    });

    // ===============================================================
    //                       3. LÓGICA DO CARRINHO
    // ===============================================================
    let cart = [];
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const subtotalValueElement = document.querySelector('.subtotal-value');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartIconWrapper = document.querySelector('.cart-icon-wrapper');
    const productGrid = document.querySelector('.product-grid');

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let totalItems = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="padding: 20px; text-align:center; color:#777;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemHTML = `<div class="cart-item" data-id="${item.id}"><img src="${item.image}" alt="${item.name}"><div class="cart-item-details"><p class="cart-item-name">${item.name}</p><p class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.',',')}</p><div class="quantity-controls"><button class="quantity-decrease">-</button><input type="number" value="${item.quantity}" min="1" readonly><button class="quantity-increase">+</button></div></div><button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button></div>`;
                cartItemsContainer.innerHTML += itemHTML;
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }
        subtotalValueElement.textContent = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
        cartCountElement.textContent = totalItems;
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
        openCart();
    }

    function updateCart(productId, action) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        const item = cart[itemIndex];
        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease') {
            item.quantity--;
            if (item.quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        } else if (action === 'remove') {
            cart.splice(itemIndex, 1);
        }
        renderCart();
    }

    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-to-cart')) {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: productCard.dataset.id,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                image: productCard.dataset.image
            };
            addToCart(product);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;
        const productId = cartItem.dataset.id;
        if (target.classList.contains('quantity-increase')) updateCart(productId, 'increase');
        if (target.classList.contains('quantity-decrease')) updateCart(productId, 'decrease');
        if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) updateCart(productId, 'remove');
    });

    function openCart() {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
        body.classList.add('cart-open');
    }

    function closeCart() {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
        body.classList.remove('cart-open');
    }

    cartIconWrapper.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ===============================================================
    //               4. LÓGICA DO MENU DROPDOWN (MEGA MENU)
    // ===============================================================
    const dropdowns = document.querySelectorAll('.main-nav .has-dropdown');

    function closeAllDropdowns() {
        dropdowns.forEach(d => d.classList.remove('active'));
    }

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', function(event) {
            if (link.getAttribute('href') === '#') {
                event.preventDefault();
            }
            const wasActive = dropdown.classList.contains('active');
            closeAllDropdowns();
            if (!wasActive) {
                dropdown.classList.add('active');
            }
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.has-dropdown')) {
            closeAllDropdowns();
        }
    });

    // ===============================================================
    //               5. OUTRAS FUNCIONALIDADES DO SITE
    // ===============================================================
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    const formMessage = document.getElementById('form-message');

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value;
        if (validateEmail(email)) {
            formMessage.textContent = 'Obrigado por se inscrever!';
            formMessage.style.color = 'green';
            emailInput.value = '';
        } else {
            formMessage.textContent = 'Por favor, insira um e-mail válido.';
            formMessage.style.color = 'red';
        }
    });

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // ===============================================================
    //               6. CHAMADAS DE INICIALIZAÇÃO
    // ===============================================================
    populateProductsArray();
    renderCart();
});
