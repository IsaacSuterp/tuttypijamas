document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    const mainHeader = document.querySelector('.main-header');

    // ===============================================================
    //                       1. LÓGICA DO CARRINHO
    // ===============================================================
    let cart = [];
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const subtotalValueElement = document.querySelector('.subtotal-value');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartIconWrapper = document.querySelector('.cart-icon-wrapper');

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let totalItems = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="padding: 20px; text-align:center; color:#777;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                cartItemsContainer.innerHTML += `<div class="cart-item" data-id="${item.id}"><img src="${item.image}" alt="${item.name}"><div class="cart-item-details"><p class="cart-item-name">${item.name}</p><p class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2).replace('.',',')}</p><div class="quantity-controls"><button class="quantity-decrease">-</button><input type="number" value="${item.quantity}" min="1" readonly><button class="quantity-increase">+</button></div></div><button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button></div>`;
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }
        subtotalValueElement.textContent = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
        cartCountElement.textContent = totalItems;
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) { existingItem.quantity++; } else { cart.push({ ...product, quantity: 1 }); }
        renderCart();
        openCart();
    }

    function updateCart(productId, action) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        const item = cart[itemIndex];
        if (action === 'increase') { item.quantity++; } else if (action === 'decrease') { item.quantity--; if (item.quantity <= 0) { cart.splice(itemIndex, 1); } } else if (action === 'remove') { cart.splice(itemIndex, 1); }
        renderCart();
    }

    document.querySelector('.product-grid').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-to-cart')) {
            const productCard = e.target.closest('.product-card');
            addToCart({ id: productCard.dataset.id, name: productCard.dataset.name, price: parseFloat(productCard.dataset.price), image: productCard.dataset.image });
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;
        const productId = cartItem.dataset.id;
        if (e.target.closest('.quantity-increase')) updateCart(productId, 'increase');
        if (e.target.closest('.quantity-decrease')) updateCart(productId, 'decrease');
        if (e.target.closest('.remove-item-btn')) updateCart(productId, 'remove');
    });

    function openCart() { body.classList.add('cart-open'); cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
    function closeCart() { body.classList.remove('cart-open'); cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); }

    cartIconWrapper.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ===============================================================
    //               2. LÓGICA DO MENU DROPDOWN (MEGA MENU)
    // ===============================================================
    const dropdowns = document.querySelectorAll('.main-nav .has-dropdown');
    function closeAllDropdowns() { dropdowns.forEach(d => d.classList.remove('active')); }
    dropdowns.forEach(dropdown => {
        dropdown.querySelector('a').addEventListener('click', function(event) {
            if (this.getAttribute('href') === '#') event.preventDefault();
            const wasActive = dropdown.classList.contains('active');
            closeAllDropdowns();
            if (!wasActive) dropdown.classList.add('active');
        });
    });

    // ===============================================================
    //               3. OUTRAS FUNCIONALIDADES DO SITE
    // ===============================================================
    window.addEventListener('scroll', () => { mainHeader.classList.toggle('scrolled', window.scrollY > 50); });

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.querySelector('i').classList.toggle('fa-bars');
        hamburger.querySelector('i').classList.toggle('fa-times');
    });

    document.getElementById('newsletterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = document.getElementById('emailInput');
        const formMessage = document.getElementById('form-message');
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(emailInput.value).toLowerCase())) {
            formMessage.textContent = 'Obrigado por se inscrever!';
            formMessage.style.color = 'green';
            emailInput.value = '';
        } else {
            formMessage.textContent = 'Por favor, insira um e-mail válido.';
            formMessage.style.color = 'red';
        }
    });
    
    // Evento global para fechar popups
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.has-dropdown')) closeAllDropdowns();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); } });

    // ===============================================================
    //               4. INICIALIZAÇÃO
    // ===============================================================
    renderCart();
});
