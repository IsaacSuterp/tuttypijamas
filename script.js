document.addEventListener('DOMContentLoaded', function() {

    // 1. EFEITO DE SCROLL NO HEADER
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. MENU HAMBÚRGUER PARA MOBILE
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.main-nav');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Troca o ícone de barras para 'X'
        const icon = hamburger.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Fechar menu ao clicar em um link (opcional)
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // 3. SIMULAÇÃO DE ADICIONAR AO CARRINHO
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartCountElement = document.querySelector('.cart-count');
    let cartItemCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            cartItemCount++;
            cartCountElement.textContent = cartItemCount;

            // Animação no ícone do carrinho
            cartCountElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);

            // Feedback visual no botão
            button.textContent = 'Adicionado!';
            button.style.backgroundColor = '#28a745'; // Verde sucesso
            setTimeout(() => {
                button.textContent = 'Adicionar ao Carrinho';
                button.style.backgroundColor = ''; // Volta ao original
            }, 2000);
        });
    });

    // 4. VALIDAÇÃO DO FORMULÁRIO DE NEWSLETTER
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
    
    // 5. MODAL DE VISUALIZAÇÃO RÁPIDA (QUICK VIEW)
    const modal = document.getElementById('quickViewModal');
    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    const closeModalButton = document.querySelector('.close-modal');

    quickViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    });
    
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fechar o modal se clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
