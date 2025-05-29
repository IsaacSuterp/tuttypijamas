// js/pageHandlers.js (agora na raiz: pageHandlers.js)
const PageInitializers = {
    initHomePage: function() {
        if (typeof uiService !== 'undefined' && typeof products !== 'undefined') {
            uiService.renderFeaturedProducts(products);
            uiService.initPopup();
        } else {
            console.error("Dependências faltando para initHomePage (uiService ou products)");
        }
    },
    initProductListPage: function() {
        if (typeof App !== 'undefined' && App.applyFilters) {
            App.applyFilters();
        } else {
             console.error("App.applyFilters não está definido para initProductListPage.");
        }
    },
    initCartPage: function() {
        if (typeof uiService !== 'undefined') {
            uiService.renderCartPage();
        } else {
            console.error("uiService não está definido para initCartPage.");
        }
    },
    initProductDetailPage: function() {
        if (typeof products === 'undefined' || typeof uiService === 'undefined') {
            console.error("Dependências faltando para initProductDetailPage (products ou uiService)");
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const layoutElement = document.querySelector('.product-page-layout');
        if (!productId) { if (layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) { if (layoutElement) layoutElement.innerHTML = '<h1>Produto não encontrado.</h1>'; return; }

        document.title = `${product.name} - Tutty Pijamas`;
        const elementsToUpdate = {
            'product-name': product.name, 'product-rating': `⭐ ${product.rating} (${product.reviews} avaliações)`,
            'reviews-count': `Ver todas as ${product.reviews} avaliações`, 'product-price': `R$ ${product.price.toFixed(2).replace('.', ',')}`,
            'product-installments': `em até ${product.installments}x de R$ ${(product.price / product.installments).toFixed(2).replace('.', ',')}`,
            'product-short-description': product.description,
            'product-full-description': product.description + " Detalhes adicionais sobre material, caimento, e ocasiões de uso para uma descrição completa e atraente.",
        };
        for (const id in elementsToUpdate) { const el = document.getElementById(id); if (el) el.innerHTML = elementsToUpdate[id];}
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
        if(relatedProductsGridEl && relatedProducts.length > 0) { relatedProductsGridEl.innerHTML = relatedProducts.map(p => uiService.renderProductCard(p)).join(''); }
        else if (relatedProductsGridEl) { relatedProductsGridEl.innerHTML = "<p>Sem produtos relacionados no momento.</p>";}
        this.initZoomEffect();
    },
    initZoomEffect: function() {
        const container = document.querySelector('.main-image-container'); const img = document.getElementById('main-product-image');
        if (!container || !img) return;
        container.addEventListener('mousemove', (e) => { const rect = container.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const xPercent = (x / rect.width) * 100; const yPercent = (y / rect.height) * 100; img.style.transformOrigin = `${xPercent}% ${yPercent}%`; img.style.transform = 'scale(2)'; });
        container.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; img.style.transformOrigin = 'center center'; });
    },
    initCheckoutPage: function() {
        const form = document.getElementById('checkout-form'); if (!form) return;
        if (typeof cartService === 'undefined' || typeof uiService === 'undefined' || typeof App === 'undefined') { console.error("Dependências faltando para initCheckoutPage"); return; }
        App.renderCheckoutSummary(); 
        const inputs = { nome: document.getElementById('nome'), email: document.getElementById('email'), cpf: document.getElementById('cpf'), celular: document.getElementById('celular'), cep: document.getElementById('cep'), endereco: document.getElementById('endereco'), numero: document.getElementById('numero'), complemento: document.getElementById('complemento'), bairro: document.getElementById('bairro'), cidade: document.getElementById('cidade'), estado: document.getElementById('estado'), cardNumber: document.getElementById('card-number'), cardName: document.getElementById('card-name'), cardExpiry: document.getElementById('card-expiry'), cardCvv: document.getElementById('card-cvv'),};
        const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
        const paymentDetailsDivs = { card: document.getElementById('card-details'), pix: document.getElementById('pix-details'), boleto: document.getElementById('boleto-details'), wallet: document.getElementById('wallet-details'),};
        const finalizeBtn = document.getElementById('finalize-purchase-btn'); const buscarCepBtn = document.getElementById('buscar-cep-btn');
        const copyPixBtn = document.getElementById('copy-pix-code-btn'); const cardBrandIcon = document.getElementById('card-brand-icon');
        const applyMask = (el, mF) => { if(el) el.addEventListener('input', (e) => { e.target.value = mF(e.target.value); validateAllFields(); }); };
        const cpfMask = v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        const celMask = v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
        const cepMask = v => v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0,9);
        const expMask = v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
        const cardNumMask = v => v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        const cvvMask = v => v.replace(/\D/g, '').slice(0,4);
        applyMask(inputs.cpf, cpfMask); applyMask(inputs.celular, celMask); applyMask(inputs.cep, cepMask);
        applyMask(inputs.cardExpiry, expMask); applyMask(inputs.cardNumber, cardNumMask); applyMask(inputs.cardCvv, cvvMask);
        const sE = (iE, m) => { const fG=iE.closest('.form-group'); if(!fG)return; const eE=fG.querySelector('.error-message'); if(eE)eE.textContent=m; iE.classList.add('input-error');};
        const cE = (iE) => { const fG=iE.closest('.form-group'); if(!fG)return; const eE=fG.querySelector('.error-message'); if(eE)eE.textContent=''; iE.classList.remove('input-error');};
        const validators = { nome:v=>v.trim().length>2?null:"Nome.", email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?null:"E-mail.", cpf:v=>/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)?null:"CPF.", celular:v=>/^\(\d{2}\)\s\d{5}-\d{4}$/.test(v)?null:"Celular.", cep:v=>/^\d{5}-\d{3}$/.test(v)?null:"CEP.", endereco:v=>v.trim().length>5?null:"Endereço.", numero:v=>v.trim().length>0?null:"Número.", bairro:v=>v.trim().length>2?null:"Bairro.", cidade:v=>v.trim().length>2?null:"Cidade.", estado:v=>v.trim().length===2?null:"UF.", cardNumber:v=>v.replace(/\s/g,'').length>=13&&v.replace(/\s/g,'').length<=16?null:"Nº cartão.", cardName:v=>v.trim().length>5?null:"Nome cartão.", cardExpiry:v=>{if(!/^\d{2}\/\d{2}$/.test(v))return"MM/AA.";const[m,y]=v.split('/');const cY=new Date().getFullYear()%100;const cM=new Date().getMonth()+1;if(parseInt(y)<cY||(parseInt(y)===cY&&parseInt(m)<cM))return"Expirado.";if(parseInt(m)<1||parseInt(m)>12)return"Mês.";return null;}, cardCvv:v=>/^\d{3,4}$/.test(v)?null:"CVV."};
        const vF=(el)=>{if(!el)return true;if(!el.hasAttribute('required')&&!el.value.trim()){cE(el);return true;}if(!el.value.trim()&&el.hasAttribute('required')){sE(el,"Obrigatório.");return false;}const vd=validators[el.id];if(vd){const err=vd(el.value);if(err){sE(el,err);return false;}}cE(el);return true;};
        const vAF=()=>{let aV=true;let fIF=null;const fTV=['nome','email','cpf','celular','cep'];if(inputs.endereco&&!inputs.endereco.disabled){fTV.push('endereco','numero','bairro','cidade','estado');} fTV.forEach(id=>{if(inputs[id]&&!vF(inputs[id])){aV=false;if(!fIF)fIF=inputs[id];}});const sPMR=form.querySelector('input[name="payment-method"]:checked');if(sPMR){const sPM=sPMR.value;if(sPM==='card'){['cardNumber','cardName','cardExpiry','cardCvv'].forEach(id=>{if(inputs[id]&&!vF(inputs[id])){aV=false;if(!fIF)fIF=inputs[id];}});}}else{aV=false;} if(finalizeBtn)finalizeBtn.disabled=!aV;return{allValid:aV,firstInvalidField:fIF};};
        Object.values(inputs).forEach(i=>{if(i)i.addEventListener('input',()=>{vF(i);vAF();});});
        paymentMethodRadios.forEach(r=>{r.addEventListener('change',()=>{Object.values(paymentDetailsDivs).forEach(d=>{if(d)d.classList.remove('active');});const aD=paymentDetailsDivs[r.value];if(aD)aD.classList.add('active');Object.keys(inputs).forEach(id=>{if(inputs[id]&&inputs[id].closest('.payment-details')&&!inputs[id].closest('.payment-details.active')){cE(inputs[id]);}});vAF();});});
        if(buscarCepBtn)buscarCepBtn.addEventListener('click',()=>{cE(inputs.cep);if(inputs.cep&&/^\d{5}-\d{3}$/.test(inputs.cep.value)){uiService.showNotification('CEP! (Simul.)');['endereco','numero','complemento','bairro','cidade','estado'].forEach(id=>{if(inputs[id])inputs[id].disabled=false;});if(inputs.endereco)inputs.endereco.value="Rua Pijama Feliz";if(inputs.bairro)inputs.bairro.value="Centro";if(inputs.cidade)inputs.cidade.value="Cidade Sonhos";if(inputs.estado)inputs.estado.value="SC";if(inputs.numero)inputs.numero.value="123";['endereco','bairro','cidade','estado','numero'].forEach(id=>{if(inputs[id])vF(inputs[id]);});vAF();}else if(inputs.cep){sE(inputs.cep,"CEP.");}});
        const applyCouponBtn=document.getElementById('apply-coupon-btn');if(applyCouponBtn)applyCouponBtn.addEventListener('click',()=>{const cci=document.getElementById('coupon-code');if(cci&&cci.value.trim())uiService.showNotification(`Cupom "${cci.value}"! (Simul.)`);else uiService.showNotification('Cupom.','error');});
        if(inputs.cardNumber&&cardBrandIcon)inputs.cardNumber.addEventListener('input',()=>{const n=inputs.cardNumber.value.replace(/\s/g,'');let iCl='';if(/^4/.test(n))iCl='fab fa-cc-visa';else if(/^5[1-5]/.test(n))iCl='fab fa-cc-mastercard';else if(/^3[47]/.test(n))iCl='fab fa-cc-amex';else if(/^(5067|4576|5090|6362|6363|4389|5041|4514|6277)/.test(n))iCl='fas fa-credit-card';cardBrandIcon.className=`card-brand-icon ${iCl}`;});
        if(copyPixBtn)copyPixBtn.addEventListener('click',()=>{const pci=document.getElementById('pix-code');if(pci){pci.select();pci.setSelectionRange(0,99999);try{document.execCommand('copy');copyPixBtn.innerHTML='<i class="fas fa-check"></i> Copiado!';setTimeout(()=>{copyPixBtn.innerHTML='<i class="fas fa-copy"></i> Copiar';},2000);}catch(err){uiService.showNotification('Erro Pix.','error');}}});
        document.querySelectorAll('.wallet-btn').forEach(b=>{b.addEventListener('click',(e)=>{uiService.showNotification(`Pagando com ${e.target.textContent.trim()}... (Simul.)`);});});
        form.addEventListener('submit',(e)=>{e.preventDefault();const{allValid,firstInvalidField}=vAF();if(allValid){const sPMR=form.querySelector('input[name="payment-method"]:checked');let pmt="N/A";if(sPMR){switch(sPMR.value){case'card':pmt='Cartão';break;case'pix':pmt='Pix';break;case'boleto':pmt='Boleto';break;case'wallet':pmt='Carteira';break;}}uiService.showNotification(`Pedido via ${pmt}! Obrigado, ${inputs.nome.value}!`);cartService.clearCart();setTimeout(()=>window.location.href='index.html',3000);}else{uiService.showNotification('Corrija os erros.','error');if(firstInvalidField)firstInvalidField.focus();}});
        vAF();
    }
};
