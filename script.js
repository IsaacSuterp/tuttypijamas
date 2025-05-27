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

    document.addEventListener('DOMContentLoaded', () => {

    // Carrinho Seletores de Elementos do DOM
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCounterEl = document.querySelector('.cart-counter');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

    // Estado do Carrinho (carregado do localStorage)
    let cart = JSON.parse(localStorage.getItem('tuttyPijamasCart')) || [];

    // --- FUNÇÕES PRINCIPAIS ---

    /**
     * Salva o estado atual do carrinho no localStorage.
     */
    const saveCart = () => {
        localStorage.setItem('tuttyPijamasCart', JSON.stringify(cart));
    };

    /**
     * Renderiza todos os itens do carrinho na sidebar e atualiza os totais.
     */
    const renderCart = () => {
        // Limpa o container de itens
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

        // Atualiza o contador do ícone
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounterEl.textContent = totalItems;

        // Atualiza o preço total
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = `R$ ${totalPrice.toFixed(2)}`;
    };

    /**
     * Adiciona um produto ao carrinho ou incrementa sua quantidade.
     * @param {object} product - O objeto do produto a ser adicionado.
     */
    const addProductToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        renderCart();
        openCart(); // Abre a sidebar para feedback
        
        // Adiciona uma animação ao ícone do carrinho
        cartIcon.classList.add('jiggle');
        setTimeout(() => cartIcon.classList.remove('jiggle'), 500);
    };

    /**
     * Manipula a quantidade de um item no carrinho.
     * @param {string} productId - O ID do produto.
     * @param {number} change - A mudança na quantidade (+1 ou -1).
     */
    const handleQuantityChange = (productId, change) => {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            // Remove o item se a quantidade for 0 ou menor
            cart = cart.filter(cartItem => cartItem.id !== productId);
        }

        saveCart();
        renderCart();
    };

    /**
     * Remove um item completamente do carrinho.
     * @param {string} productId - O ID do produto a ser removido.
     */
    const removeItemFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    };
    
    // --- FUNÇÕES DE CONTROLE DA UI ---

    const openCart = () => {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
    };

    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
    };


    // --- EVENT LISTENERS ---

    // Abrir carrinho ao clicar no ícone
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    // Fechar carrinho
    closeCartBtn.addEventListener('click', closeCart);
    continueShoppingBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Adicionar item ao carrinho
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

    // Event Delegation para botões dentro do carrinho (mais eficiente)
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const productId = cartItem.dataset.id;

        if (target.classList.contains('increase-btn') || target.parentElement.classList.contains('increase-btn')) {
            handleQuantityChange(productId, 1);
        } else if (target.classList.contains('decrease-btn') || target.parentElement.classList.contains('decrease-btn')) {
            handleQuantityChange(productId, -1);
        } else if (target.classList.contains('remove-item-btn') || target.parentElement.classList.contains('remove-item-btn')) {
            removeItemFromCart(productId);
        }
    });

    // --- INICIALIZAÇÃO ---
    // Renderiza o carrinho com os dados do localStorage assim que a página carrega.
    renderCart();

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
