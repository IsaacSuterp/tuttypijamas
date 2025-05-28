// --- SERVIÇO DE UI (INTERFACE DO USUÁRIO) ---
const uiService = {
    renderProductCard: function(product) {
        const priceFormatted = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        const installmentPrice = (product.price / product.installments).toFixed(2).replace('.', ',');
        return `
            <div class="product-card">
                <a href="produto-detalhe.html?id=${product.id}"><img src="${product.images[0]}" alt="${product.name}"></a>
                <h3>${product.name}</h3>
                <div class="price">${priceFormatted}</div>
                <p>até ${product.installments}x de R$ ${installmentPrice}</p>
                <button class="btn view-product-btn" data-product-id="${product.id}">Ver Mais</button>
            </div>
        `;
    },
    renderFeaturedProducts: function(products) {
        const grid = document.getElementById("featured-products-grid");
        if (grid) { const featured = products.slice(0, 4); grid.innerHTML = featured.map(this.renderProductCard).join(''); }
    },
    renderProductGrid: function(productsToRender) {
        const grid = document.getElementById("product-grid");
        if (grid) {
            if (productsToRender.length === 0) { grid.innerHTML = "<p>Nenhum produto encontrado.</p>"; return; }
            grid.innerHTML = productsToRender.map(this.renderProductCard).join('');
        }
    },
    renderCartPage: function() {
        const cart = cartService.get(); const container = document.querySelector(".cart-container");
        const itemsContainer = document.getElementById("cart-items"); const summaryContainer = document.getElementById("cart-summary");
        if (!container) return;
        if (cart.length === 0) { container.innerHTML = "<div style='text-align:center; width:100%;'><h1 class='section-title'>Seu carrinho está vazio.</h1><a href='produtos.html' class='btn'>Ver produtos</a></div>"; return; }
        let subtotal = 0;
        itemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity; subtotal += itemTotal;
            return `<tr><td data-label="Produto"><div class="cart-product-info"><img src="${item.images[0]}" alt="${item.name}"><div><span>${item.name}</span><br><small>${item.selectedSize ? 'Tam: ' + item.selectedSize : ''}</small></div></div></td><td data-label="Preço">R$ ${item.price.toFixed(2).replace('.', ',')}</td><td data-label="Quantidade"><input class="cart-quantity-input" type="number" value="${item.quantity}" min="1" data-product-id="${item.cartItemId || item.id}"></td><td data-label="Total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td><td data-label="Remover"><button class="remove-from-cart-btn" data-product-id="${item.cartItemId || item.id}">Remover</button></td></tr>`;
        }).join('');
        const frete = 15.00; const total = subtotal + frete;
        summaryContainer.innerHTML = `<h3>Resumo do Pedido</h3><p><span>Subtotal</span> <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></p><p><span>Frete</span> <strong>R$ ${frete.toFixed(2).replace('.', ',')}</strong></p><hr><p><span>Total</span> <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></p><a href="checkout.html" class="btn">Finalizar Compra</a>`; // Link para checkout.html
    },
    updateCartCount: function() {
        const cart = cartService.get(); const countElement = document.getElementById("cart-count");
        if (countElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            countElement.textContent = totalItems; countElement.style.display = totalItems > 0 ? "block" : "none";
        }
    },
    initPopup: function() {
        const popup = document.getElementById('newsletter-popup');
        if (!popup || sessionStorage.getItem('popupShown')) return;
        setTimeout(() => { popup.classList.add('active'); sessionStorage.setItem('popupShown', 'true'); }, 2000);
    },
    closePopup: function() {
        const popup = document.getElementById('newsletter-popup');
        if (popup) popup.classList.remove('active');
    },
    showNotification: function(message, type = 'success') {
        const notification = document.getElementById('notification'); // Usado no login/checkout
        if (!notification && document.body.id !== 'login-page' && document.body.id !== 'checkout-page') { 
            alert(message); // Fallback para outras páginas
            return; 
        }
        if (notification) {
            notification.textContent = message; notification.className = `notification ${type} show`;
            setTimeout(() => { notification.classList.remove('show'); }, 4000);
        }
    }
};

// --- SERVIÇO DE CARRINHO ---
const cartService = {
    get: function() { return JSON.parse(localStorage.getItem("tutty_pijamas_cart")) || []; },
    save: function(cart) { localStorage.setItem("tutty_pijamas_cart", JSON.stringify(cart)); uiService.updateCartCount(); },
    add: function(productId, quantity = 1, size = null) {
        let cart = this.get();
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;
        const cartItemId = size ? `${product.id}-${size}` : `${product.id}-default`; // Garante um ID único mesmo sem tamanho
        const existingProduct = cart.find(item => item.cartItemId === cartItemId);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity, selectedSize: size, cartItemId: cartItemId });
        }
        this.save(cart);
        uiService.showNotification(`${product.name} ${size ? '(Tamanho: ' + size + ')' : ''} foi adicionado ao carrinho!`);
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
    clearCart: function() { // Função para limpar o carrinho após a compra
        this.save([]);
    }
};

// --- APLICAÇÃO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    const App = {
        init() {
            uiService.updateCartCount();
            this.handlePageSpecifics();
            this.bindEvents();
        },
        bindEvents() {
            document.body.addEventListener('click', event => {
                if (event.target.matches('.view-product-btn')) {
                    const productId = event.target.dataset.productId;
                    if (productId) window.location.href = `produto-detalhe.html?id=${productId}`;
                }
                if (event.target.matches('.remove-from-cart-btn')) {
                    const cartItemId = event.target.dataset.productId; // Este deve ser o cartItemId
                    cartService.remove(cartItemId);
                    if (document.body.id === 'cart-page') uiService.renderCartPage();
                }
                if (event.target.matches('.popup-close') || event.target.matches('.popup-overlay')) {
                    uiService.closePopup();
                }
                if (event.target.matches('.collection-button')) {
                    const targetPage = event.target.dataset.target;
                    if (targetPage) window.location.href = targetPage;
                }
                if(document.body.id === 'product-detail-page'){
                    if(event.target.matches('#size-guide-link')) {
                        event.preventDefault();
                        document.getElementById('size-guide-modal').classList.add('active');
                    }
                     if(event.target.matches('.modal-close') || (event.target.matches('.modal-overlay') && event.target.id === 'size-guide-modal')) {
                        document.getElementById('size-guide-modal').classList.remove('active');
                    }
                    if(event.target.matches('.thumbnail')) {
                        const mainImage = document.getElementById('main-product-image');
                        if(mainImage) mainImage.src = event.target.src;
                        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                        event.target.classList.add('active');
                    }
                    if(event.target.matches('.size-btn')) {
                        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
                        event.target.classList.add('active');
                    }
                     if(event.target.matches('.tab-link')) {
                        const tabId = event.target.dataset.tab;
                        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        event.target.classList.add('active');
                        const targetTabContent = document.getElementById(tabId);
                        if(targetTabContent) targetTabContent.classList.add('active');
                    }
                    if(event.target.matches('#add-to-cart-detail')) {
                        const productId = event.target.dataset.productId;
                        const quantityInput = document.getElementById('quantity');
                        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                        const selectedSizeEl = document.querySelector('.size-btn.active');
                        if(!selectedSizeEl) {
                            uiService.showNotification('Por favor, selecione um tamanho.', 'error'); // Usando notificação
                            return;
                        }
                        const size = selectedSizeEl.textContent;
                        cartService.add(productId, quantity, size);
                    }
                }
            });
            document.body.addEventListener('change', event => {
                if (event.target.matches('.cart-quantity-input')) {
                    const cartItemId = event.target.dataset.productId; // Este deve ser o cartItemId
                    cartService.updateQuantity(cartItemId, event.target.value);
                    if (document.body.id === 'cart-page') uiService.renderCartPage();
                }
            });
            const filters = document.getElementById("filters");
            if (filters) { filters.addEventListener("change", () => this.applyFilters()); }
            
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                 newsletterForm.addEventListener('submit', event => {
                    event.preventDefault();
                    const formContent = document.getElementById('popup-form-content');
                    const successContent = document.getElementById('popup-success-content');
                    if(formContent) formContent.style.display = 'none';
                    if(successContent) successContent.style.display = 'block';
                    setTimeout(() => uiService.closePopup(), 4000);
                });
            }
        },
        handlePageSpecifics() {
            const pageId = document.body.id;
            switch (pageId) {
                case 'home-page': uiService.renderFeaturedProducts(products); uiService.initPopup(); break;
                case 'products-page': this.applyFilters(); break;
                case 'cart-page': uiService.renderCartPage(); break;
                case 'product-detail-page': this.initProductDetailPage(); break;
                case 'checkout-page': this.initCheckoutPage(); break; // NOVA CHAMADA
            }
        },
        initProductDetailPage() {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            const layoutElement = document.querySelector('.product-page-layout');
            if (!productId) { if(layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
            const product = products.find(p => p.id === parseInt(productId));
            if (!product) { if(layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
            document.title = `${product.name} - Tutty Pijamas`;
            const elementsToUpdate = {
                'product-name': product.name,
                'product-rating': `⭐ ${product.rating} (${product.reviews} avaliações)`,
                'reviews-count': `Ver todas as ${product.reviews} avaliações`,
                'product-price': `R$ ${product.price.toFixed(2).replace('.', ',')}`,
                'product-installments': `em até ${product.installments}x de R$ ${(product.price / product.installments).toFixed(2).replace('.', ',')}`,
                'product-short-description': product.description,
                'product-full-description': product.description + " Detalhes adicionais sobre material, caimento, e ocasiões de uso para uma descrição completa e atraente.",
            };
            for (const id in elementsToUpdate) {
                const el = document.getElementById(id);
                if (el) el.innerHTML = elementsToUpdate[id];
            }
            const specsListEl = document.getElementById('product-specs');
            if(specsListEl) specsListEl.innerHTML = `<li><strong>Composição:</strong> ${product.fabric}</li><li><strong>Cor:</strong> ${product.color}</li><li><strong>Estilo:</strong> ${product.style}</li><li><strong>Cuidados:</strong> Lavar à mão com água fria. Não usar alvejante. Secar à sombra.</li>`;
            const mainImageEl = document.getElementById('main-product-image');
            if(mainImageEl) mainImageEl.src = product.images[0];
            const thumbnailsContainerEl = document.getElementById('product-thumbnails');
            if(thumbnailsContainerEl) thumbnailsContainerEl.innerHTML = product.images.map((img, index) => `<img src="${img}" alt="Miniatura ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}">`).join('');
            const sizeSelectorEl = document.getElementById('size-selector');
            if(sizeSelectorEl) sizeSelectorEl.innerHTML = product.sizes.map(size => `<button class="size-btn">${size}</button>`).join('');
            const addToCartDetailBtn = document.getElementById('add-to-cart-detail');
            if(addToCartDetailBtn) addToCartDetailBtn.dataset.productId = product.id;
            const relatedProducts = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
            const relatedProductsGridEl = document.getElementById('related-products-grid');
            if(relatedProductsGridEl && relatedProducts.length > 0) {
                relatedProductsGridEl.innerHTML = relatedProducts.map(p => uiService.renderProductCard(p)).join('');
            } else if (relatedProductsGridEl) {
                relatedProductsGridEl.innerHTML = "<p>Sem produtos relacionados no momento.</p>";
            }
            this.initZoomEffect();
        },
        initZoomEffect() {
            const container = document.querySelector('.main-image-container');
            const img = document.getElementById('main-product-image');
            if (!container || !img) return;
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) * 100; const yPercent = (y / rect.height) * 100;
                img.style.transformOrigin = `${xPercent}% ${yPercent}%`; img.style.transform = 'scale(2)';
            });
            container.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; img.style.transformOrigin = 'center center'; });
        },
        applyFilters() {
            let filteredProducts = [...products];
            const categoryElement = document.getElementById("filter-category");
            const colorElement = document.getElementById("filter-color");
            const priceElement = document.getElementById("filter-price");
            const sortElement = document.getElementById("sort-order");
            const category = categoryElement ? categoryElement.value : "";
            const color = colorElement ? colorElement.value : "";
            const maxPrice = priceElement ? parseFloat(priceElement.value) : Infinity;
            const sortOrder = sortElement ? sortElement.value : "relevance";
            if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
            if (color) filteredProducts = filteredProducts.filter(p => p.color === color);
            if (priceElement && !isNaN(maxPrice) && maxPrice !== Infinity) {
                 filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
            }
            switch (sortOrder) {
                case "price-asc": filteredProducts.sort((a, b) => a.price - b.price); break;
                case "price-desc": filteredProducts.sort((a, b) => b.price - a.price); break;
            }
            uiService.renderProductGrid(filteredProducts);
        },

        // === NOVA FUNÇÃO PARA A PÁGINA DE CHECKOUT ===
        initCheckoutPage() {
            const form = document.getElementById('checkout-form');
            if (!form) return;

            const inputs = {
                nome: document.getElementById('nome'), email: document.getElementById('email'),
                cpf: document.getElementById('cpf'), celular: document.getElementById('celular'),
                cep: document.getElementById('cep'), endereco: document.getElementById('endereco'),
                numero: document.getElementById('numero'), complemento: document.getElementById('complemento'),
                bairro: document.getElementById('bairro'), cidade: document.getElementById('cidade'),
                estado: document.getElementById('estado'), cardNumber: document.getElementById('card-number'),
                cardName: document.getElementById('card-name'), cardExpiry: document.getElementById('card-expiry'),
                cardCvv: document.getElementById('card-cvv'),
            };

            const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
            const paymentDetailsDivs = {
                card: document.getElementById('card-details'), pix: document.getElementById('pix-details'),
                boleto: document.getElementById('boleto-details'), wallet: document.getElementById('wallet-details'),
            };
            const finalizeBtn = document.getElementById('finalize-purchase-btn');
            const buscarCepBtn = document.getElementById('buscar-cep-btn');
            const copyPixBtn = document.getElementById('copy-pix-code-btn');
            const cardBrandIcon = document.getElementById('card-brand-icon');
            const cardInstallmentsSelect = document.getElementById('card-installments');
            const summaryTotalEl = document.getElementById('summary-total');

            // --- MÁSCARAS ---
            const applyMask = (element, maskFunction) => {
                if(element) element.addEventListener('input', (e) => {
                    e.target.value = maskFunction(e.target.value);
                    validateAllFields();
                });
            };
            const cpfMask = value => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            const celularMask = value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
            const cepMask = value => value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0,9);
            const cardExpiryMask = value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
            const cardNumberMask = value => value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
            const cvvMask = value => value.replace(/\D/g, '').slice(0,4);

            applyMask(inputs.cpf, cpfMask);
            applyMask(inputs.celular, celularMask);
            applyMask(inputs.cep, cepMask);
            applyMask(inputs.cardExpiry, cardExpiryMask);
            applyMask(inputs.cardNumber, cardNumberMask);
            applyMask(inputs.cardCvv, cvvMask);
            
            if (summaryTotalEl && cardInstallmentsSelect) {
                const totalValue = parseFloat(summaryTotalEl.textContent.replace('R$ ', '').replace(',', '.'));
                if (!isNaN(totalValue) && totalValue > 0) {
                    cardInstallmentsSelect.innerHTML = ''; 
                    for (let i = 1; i <= 10; i++) {
                        const installmentValue = (totalValue / i).toFixed(2).replace('.', ',');
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `${i}x de R$ ${installmentValue} ${i === 1 ? '' : (i <= 3 ? 'sem juros' : 'com juros')}`; // Exemplo de lógica de juros
                        cardInstallmentsSelect.appendChild(option);
                    }
                } else {
                     cardInstallmentsSelect.innerHTML = '<option value="1">1x de R$ 0,00</option>';
                }
            }

            const showError = (inputElement, message) => {
                const formGroup = inputElement.closest('.form-group');
                if (!formGroup) return;
                const errorElement = formGroup.querySelector('.error-message');
                if (errorElement) errorElement.textContent = message;
                inputElement.classList.add('input-error'); // Para CSS
            };
            const clearError = (inputElement) => {
                const formGroup = inputElement.closest('.form-group');
                 if (!formGroup) return;
                const errorElement = formGroup.querySelector('.error-message');
                if (errorElement) errorElement.textContent = '';
                inputElement.classList.remove('input-error');
            };

            const validators = {
                nome: value => value.trim().length > 2 ? null : "Nome muito curto.",
                email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "E-mail inválido.",
                cpf: value => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) ? null : "CPF inválido.",
                celular: value => /^\(\d{2}\)\s\d{5}-\d{4}$/.test(value) ? null : "Celular inválido.",
                cep: value => /^\d{5}-\d{3}$/.test(value) ? null : "CEP inválido.",
                endereco: value => value.trim().length > 5 ? null : "Endereço muito curto.",
                numero: value => value.trim().length > 0 ? null : "Número obrigatório.",
                bairro: value => value.trim().length > 2 ? null : "Bairro muito curto.",
                cidade: value => value.trim().length > 2 ? null : "Cidade muito curta.",
                estado: value => value.trim().length === 2 ? null : "Estado inválido (use sigla, ex: SC).",
                cardNumber: value => value.replace(/\s/g, '').length >= 13 && value.replace(/\s/g, '').length <= 16 ? null : "Número do cartão inválido.",
                cardName: value => value.trim().length > 5 ? null : "Nome no cartão muito curto.",
                cardExpiry: value => {
                    if (!/^\d{2}\/\d{2}$/.test(value)) return "Data inválida (MM/AA).";
                    const [month, year] = value.split('/');
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;
                    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) return "Cartão expirado.";
                    if (parseInt(month) < 1 || parseInt(month) > 12) return "Mês inválido.";
                    return null;
                },
                cardCvv: value => /^\d{3,4}$/.test(value) ? null : "CVV inválido."
            };

            const validateField = (inputElement) => {
                if (!inputElement) return true; // Se o elemento não existe na tela, considera válido
                if (!inputElement.hasAttribute('required') && !inputElement.value.trim()) {
                    clearError(inputElement); return true;
                }
                if (!inputElement.value.trim() && inputElement.hasAttribute('required')){
                    showError(inputElement, "Campo obrigatório."); return false;
                }
                const validator = validators[inputElement.id];
                if (validator) {
                    const error = validator(inputElement.value);
                    if (error) { showError(inputElement, error); return false; }
                }
                clearError(inputElement); return true;
            };
            
            const validateAllFields = () => {
                let allValid = true;
                let firstInvalidField = null;

                const fieldsToValidate = ['nome', 'email', 'cpf', 'celular', 'cep'];
                if (inputs.endereco && !inputs.endereco.disabled) { // Valida endereço apenas se não estiver desabilitado
                    fieldsToValidate.push('endereco', 'numero', 'bairro', 'cidade', 'estado');
                }

                fieldsToValidate.forEach(id => {
                    if (inputs[id] && !validateField(inputs[id])) {
                        allValid = false;
                        if (!firstInvalidField) firstInvalidField = inputs[id];
                    }
                });

                const selectedPaymentMethodRadio = form.querySelector('input[name="payment-method"]:checked');
                if (selectedPaymentMethodRadio) {
                    const selectedPaymentMethod = selectedPaymentMethodRadio.value;
                    if (selectedPaymentMethod === 'card') {
                        if (inputs.cardNumber && !validateField(inputs.cardNumber)) { allValid = false; if (!firstInvalidField) firstInvalidField = inputs.cardNumber;}
                        if (inputs.cardName && !validateField(inputs.cardName)) { allValid = false; if (!firstInvalidField) firstInvalidField = inputs.cardName;}
                        if (inputs.cardExpiry && !validateField(inputs.cardExpiry)) { allValid = false; if (!firstInvalidField) firstInvalidField = inputs.cardExpiry;}
                        if (inputs.cardCvv && !validateField(inputs.cardCvv)) { allValid = false; if (!firstInvalidField) firstInvalidField = inputs.cardCvv;}
                    }
                } else { // Nenhum método de pagamento selecionado
                    allValid = false;
                     // Poderia adicionar uma mensagem de erro geral para seleção de pagamento
                }
                
                finalizeBtn.disabled = !allValid;
                return { allValid, firstInvalidField };
            };

            Object.values(inputs).forEach(input => {
                if(input) input.addEventListener('input', () => {
                    validateField(input); 
                    validateAllFields(); 
                });
            });

            paymentMethodRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    Object.values(paymentDetailsDivs).forEach(div => { if(div) div.classList.remove('active'); });
                    const activeDiv = paymentDetailsDivs[radio.value];
                    if (activeDiv) activeDiv.classList.add('active');
                    
                    Object.keys(inputs).forEach(id => {
                        if (inputs[id] && inputs[id].closest('.payment-details') && !inputs[id].closest('.payment-details.active')) {
                            clearError(inputs[id]);
                        }
                    });
                    validateAllFields(); 
                });
            });

            if(buscarCepBtn) buscarCepBtn.addEventListener('click', () => {
                clearError(inputs.cep);
                if (inputs.cep && /^\d{5}-\d{3}$/.test(inputs.cep.value)) {
                    uiService.showNotification('CEP encontrado! (Simulação)');
                    ['endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado'].forEach(id => {
                        if(inputs[id]) {
                            inputs[id].disabled = false;
                            inputs[id].dispatchEvent(new Event('input')); // Para revalidar e limpar erros
                        }
                    });
                    if(inputs.endereco) inputs.endereco.value = "Rua dos Pijamas Felizes";
                    if(inputs.bairro) inputs.bairro.value = "Centro Sonolento";
                    if(inputs.cidade) inputs.cidade.value = "Cidade dos Sonhos";
                    if(inputs.estado) inputs.estado.value = "SC";
                     ['endereco', 'bairro', 'cidade', 'estado'].forEach(id => {
                        if(inputs[id]) validateField(inputs[id]); // Validar campos preenchidos
                    });
                    validateAllFields();
                } else if (inputs.cep) {
                    showError(inputs.cep, "CEP inválido.");
                }
            });

            const applyCouponBtn = document.getElementById('apply-coupon-btn');
            if(applyCouponBtn) applyCouponBtn.addEventListener('click', () => {
                const couponCodeInput = document.getElementById('coupon-code');
                if (couponCodeInput && couponCodeInput.value.trim()) {
                    uiService.showNotification(`Cupom "${couponCodeInput.value}" aplicado! (Simulação)`);
                } else {
                    uiService.showNotification('Por favor, insira um código de cupom.', 'error');
                }
            });
            
            if(inputs.cardNumber && cardBrandIcon) inputs.cardNumber.addEventListener('input', () => {
                const num = inputs.cardNumber.value.replace(/\s/g, '');
                let iconClass = '';
                if (/^4/.test(num)) iconClass = 'fab fa-cc-visa';
                else if (/^5[1-5]/.test(num)) iconClass = 'fab fa-cc-mastercard';
                else if (/^3[47]/.test(num)) iconClass = 'fab fa-cc-amex';
                else if (/^(5067|4576|5090|6362|6363|4389|5041|4514|6277)/.test(num)) iconClass = 'fas fa-credit-card';
                cardBrandIcon.className = `card-brand-icon ${iconClass}`;
            });

            if(copyPixBtn) copyPixBtn.addEventListener('click', () => {
                const pixCodeInput = document.getElementById('pix-code');
                if (pixCodeInput) {
                    pixCodeInput.select();
                    pixCodeInput.setSelectionRange(0, 99999); 
                    try {
                        document.execCommand('copy');
                        copyPixBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        setTimeout(() => { copyPixBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar'; }, 2000);
                    } catch (err) {
                        uiService.showNotification('Erro ao copiar o código Pix.', 'error');
                    }
                }
            });

            document.querySelectorAll('.wallet-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    uiService.showNotification(`Iniciando pagamento com ${e.target.textContent.trim()}... (Simulação)`);
                });
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const { allValid, firstInvalidField } = validateAllFields(); // Valida tudo uma última vez
                if (allValid) {
                    const selectedPaymentMethodRadio = form.querySelector('input[name="payment-method"]:checked');
                    let paymentMethodText = "Não selecionado";
                    if (selectedPaymentMethodRadio) {
                        switch(selectedPaymentMethodRadio.value) {
                            case 'card': paymentMethodText = 'Cartão de Crédito'; break;
                            case 'pix': paymentMethodText = 'Pix'; break;
                            case 'boleto': paymentMethodText = 'Boleto Bancário'; break;
                            case 'wallet': paymentMethodText = 'Carteira Digital'; break;
                        }
                    }
                    uiService.showNotification(`Pedido realizado com sucesso via ${paymentMethodText}! Obrigado, ${inputs.nome.value}!`);
                    cartService.clearCart(); // Limpa o carrinho
                    setTimeout(() => window.location.href = 'index.html', 3000); // Redireciona para home
                } else {
                     uiService.showNotification('Por favor, corrija os erros no formulário.', 'error');
                     if (firstInvalidField) firstInvalidField.focus();
                }
            });
            validateAllFields(); // Estado inicial do botão
        }

    };
    App.init();
});
