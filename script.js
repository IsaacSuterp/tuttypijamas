document.addEventListener('DOMContentLoaded', () => {

    // --- MENU HAMBURGER (MÓVEL) ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Alterna o ícone do menu
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Fecha o menu ao clicar em um link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });

    // --- CARROSSEL DE PRODUTOS ---
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const slideWidth = slides[0].getBoundingClientRect().width;

        // Organiza os slides um ao lado do outro
        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        let currentIndex = 0;

        const moveToSlide = (newIndex) => {
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= slides.length) newIndex = slides.length - 1;

            track.style.transform = 'translateX(-' + slides[newIndex].style.left + ')';
            currentIndex = newIndex;
        };

        nextButton.addEventListener('click', () => {
            // Ajuste para o número de slides visíveis
            const itemsToShow = window.innerWidth > 992 ? 4 : (window.innerWidth > 576 ? 2 : 1);
            let nextIndex = currentIndex + 1;
            if (nextIndex > slides.length - itemsToShow) {
                nextIndex = 0; // Volta para o início
            }
            moveToSlide(nextIndex);
        });

        prevButton.addEventListener('click', () => {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                const itemsToShow = window.innerWidth > 992 ? 4 : (window.innerWidth > 576 ? 2 : 1);
                prevIndex = slides.length - itemsToShow; // Vai para o final
            }
            moveToSlide(prevIndex);
        });
    }

    // --- SISTEMA DE CARRINHO DE COMPRAS ---
    const cartIcon = document.querySelector('.cart-icon');
    const cartCounter = document.querySelector('.cart-counter');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.querySelector('.close-cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    let cart = [];

    // Adicionar item ao carrinho
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                image: card.dataset.image,
                quantity: 1,
            };
            addToCart(product);
        });
    });

    function addToCart(product) {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }
        updateCart();
    }
    
    function updateCart() {
        renderCartItems();
        updateCartCounter();
        updateCartTotal();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            return;
        }

        cart.forEach(item => {
            const cartItemEl = document.createElement('div');
            cartItemEl.classList.add('cart-item');
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-change" data-id="${item.id}" data-change="-1">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input">
                    <button class="quantity-change" data-id="${item.id}" data-change="1">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }
    
    function updateCartTotal() {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = totalPrice.toFixed(2);
    }
    
    // Manipulação da quantidade e remoção de itens
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('quantity-change')) {
            const change = parseInt(target.dataset.change);
            changeQuantity(id, change);
        }
        if (target.classList.contains('remove-item')) {
            removeFromCart(id);
        }
    });
    
    cartItemsContainer.addEventListener('change', (e) => {
        if(e.target.classList.contains('quantity-input')) {
            const id = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);
            setQuantity(id, newQuantity);
        }
    });

    function changeQuantity(id, change) {
        const product = cart.find(item => item.id === id);
        if (product) {
            product.quantity += change;
            if (product.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCart();
            }
        }
    }
    
    function setQuantity(id, newQuantity) {
        const product = cart.find(item => item.id === id);
        if (product && newQuantity > 0) {
            product.quantity = newQuantity;
            updateCart();
        } else if (product) {
            // Se a quantidade for inválida, reseta para a anterior
            updateCart();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    // Abrir e fechar modal do carrinho
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // --- MODAL NEWSLETTER ---
    const newsletterModal = document.getElementById('newsletter-modal');
    const closeNewsletterModal = document.querySelector('.close-newsletter-modal');
    
    // Mostra o modal após 5 segundos
    setTimeout(() => {
        // Verifica se o usuário já viu o modal
        if (!sessionStorage.getItem('newsletterModalShown')) {
            newsletterModal.style.display = 'flex';
            sessionStorage.setItem('newsletterModalShown', 'true');
        }
    }, 5000);
    
    closeNewsletterModal.addEventListener('click', () => {
        newsletterModal.style.display = 'none';
    });
    
    // Fecha ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target == newsletterModal) {
            newsletterModal.style.display = 'none';
        }
    });

});