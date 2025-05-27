document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO MENU HAMBURGER E DROPDOWN ---
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('main-nav');
    const dropdownLinks = document.querySelectorAll('.nav-link-dropdown');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.toggleAttribute('aria-expanded');

        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Apenas ativa a função de accordion em telas móveis
            if (window.innerWidth <= 992) {
                e.preventDefault(); // Impede a navegação do link no clique
                
                const dropdownItem = link.parentElement;
                dropdownItem.classList.toggle('open');
                
                // Atualiza o atributo ARIA
                const isExpanded = dropdownItem.classList.contains('open');
                link.setAttribute('aria-expanded', isExpanded);
            }
        });
    });

    // --- LÓGICA DO CARROSSEL ---
    const track = document.querySelector('.carousel-track');
    if (track && track.children.length > 0) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        
        let itemsToShow = window.innerWidth > 992 ? 4 : (window.innerWidth > 576 ? 2 : 1);
        const slideWidth = track.parentElement.offsetWidth / itemsToShow;

        slides.forEach((slide, index) => {
            slide.style.minWidth = `${slideWidth}px`;
        });

        let currentIndex = 0;

        const moveToSlide = (newIndex) => {
            if (newIndex < 0) {
                newIndex = 0;
            }
            if (newIndex > slides.length - itemsToShow) {
                newIndex = slides.length - itemsToShow;
            }

            track.style.transform = `translateX(-${newIndex * slideWidth}px)`;
            currentIndex = newIndex;
        };

        nextButton.addEventListener('click', () => {
            moveToSlide(currentIndex + 1);
        });

        prevButton.addEventListener('click', () => {
            moveToSlide(currentIndex - 1);
        });
        
        window.addEventListener('resize', () => {
            itemsToShow = window.innerWidth > 992 ? 4 : (window.innerWidth > 576 ? 2 : 1);
            const newSlideWidth = track.parentElement.offsetWidth / itemsToShow;
            slides.forEach(slide => slide.style.minWidth = `${newSlideWidth}px`);
            moveToSlide(currentIndex);
        });
    }

    // --- LÓGICA DO CARRINHO DE COMPRAS ---
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCounterEl = document.querySelector('.cart-counter');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

    let cart = JSON.parse(localStorage.getItem('tuttyPijamasCart')) || [];

    const saveCart = () => {
        localStorage.setItem('tuttyPijamasCart', JSON.stringify(cart));
    };

    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const cartItemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price">R$ ${parseFloat(item.price).toFixed(2)}</p>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease-btn" aria-label="Diminuir quantidade">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase-btn" aria-label="Aumentar quantidade">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" aria-label="Remover item"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });
        }
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounterEl.textContent = totalItems;
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = `R$ ${totalPrice.toFixed(2)}`;
    };

    const addProductToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        renderCart();
        openCart();
        cartIcon.classList.add('jiggle');
        setTimeout(() => cartIcon.classList.remove('jiggle'), 500);
    };

    const handleQuantityChange = (productId, change) => {
        const item = cart.find(item => item.id === productId);
        if (!item) return;
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== productId);
        }
        saveCart();
        renderCart();
    };

    const removeItemFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    };
    
    const openCart = () => {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
    };

    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    };

    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
    closeCartBtn.addEventListener('click', closeCart);
    continueShoppingBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: card.dataset.price,
                image: card.dataset.image,
            };
            addProductToCart(product);
        });
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;
        const productId = cartItem.dataset.id;
        if (target.matches('.increase-btn')) {
            handleQuantityChange(productId, 1);
        } else if (target.matches('.decrease-btn')) {
            handleQuantityChange(productId, -1);
        } else if (target.closest('.remove-item-btn')) {
            removeItemFromCart(productId);
        }
    });

    // INICIALIZAÇÃO
    renderCart();
});
