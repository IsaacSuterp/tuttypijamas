document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;

    // ===============================================================
    //                       1. LÓGICA DO CARRINHO
    // ===============================================================

    let cart = []; // Array para armazenar os itens do carrinho
    
    // Seleção de Elementos do DOM para o Carrinho
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountElement = document.querySelector('.cart-count');
    const subtotalValueElement = document.querySelector('.subtotal-value');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartIcon = document.querySelector('.cart-icon-wrapper');
    const productGrid = document.querySelector('.product-grid');

    // Função para renderizar/atualizar o carrinho na tela
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="padding: 20px; text-align:center; color:#777;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="quantity-decrease">-</button>
                                <input type="number" value="${item.quantity}" min="1" readonly>
                                <button class="quantity-increase">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }
        
        subtotalValueElement.textContent = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
        cartCountElement.textContent = totalItems;
    }

    // Função para adicionar item ao carrinho
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
    
    // Função para atualizar a quantidade ou remover itens
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
    
    // Event listener para adicionar ao carrinho (usando delegação de eventos)
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
    
    // Event listener para os controles dentro do carrinho
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;
        
        const productId = cartItem.dataset.id;
        
        if (target.classList.contains('quantity-increase')) updateCart(productId, 'increase');
        if (target.classList.contains('quantity-decrease')) updateCart(productId, 'decrease');
        if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) updateCart(productId, 'remove');
    });

    // Funções para abrir e fechar o carrinho
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

    // Event listeners para abrir/fechar o carrinho
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // ===============================================================
    //               2. OUTRAS FUNCIONALIDADES DO SITE
    // ===============================================================
    
    // EFEITO DE SCROLL NO HEADER
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // MENU HAMBÚRGUER PARA MOBILE
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // VALIDAÇÃO DO FORMULÁRIO DE NEWSLETTER
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
    //               3. INICIALIZAÇÃO
    // ===============================================================
    renderCart(); // Renderiza o carrinho (vazio) ao carregar a página
});
