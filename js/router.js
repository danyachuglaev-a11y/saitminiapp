// ============================================================
// ROUTER — УПРАВЛЕНИЕ СТРАНИЦАМИ
// ============================================================

const mainContent = document.getElementById('main-content');
let currentPage = 'main';

/**
 * Навигация по страницам
 */
function navigateTo(page) {
    if (page === currentPage && page !== 'create') return;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    currentPage = page;
    renderPage(page);
}

/**
 * Рендеринг страницы
 */
async function renderPage(page) {
    mainContent.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner animate-spin"></i></div>`;
    
    switch (page) {
        case 'main':
            await renderMain();
            break;
        case 'deals':
            await renderDeals();
            break;
        case 'create':
            await renderCreateDeal();
            break;
        case 'balance':
            await renderBalance();
            break;
        case 'reviews':
            await renderReviews();
            break;
        case 'profile':
            await renderProfile();
            break;
        case 'admin':
            await renderAdmin();
            break;
        default:
            await renderMain();
    }
}

/**
 * Рендеринг создания сделки (Wizard)
 */
async function renderCreateDeal() {
    let step = 1;
    let data = {};

    const steps = [
        { title: 'Что продаёте?', field: 'product', placeholder: 'NFT-подарок Telegram Premium' },
        { title: 'Цена', field: 'amount', placeholder: '100' },
        { title: 'Покупатель', field: 'buyer', placeholder: 'john_doe' }
    ];

    function renderStep() {
        const s = steps[step - 1];
        const progress = steps.map((_, i) => 
            `<div class="wizard-progress-dot ${i < step ? 'active' : ''}"></div>`
        ).join('');

        return `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    📱 Создать сделку
                </h1>
                <p style="color:var(--text-secondary); font-size:14px; margin-top:2px;">
                    Шаг ${step} из ${steps.length}
                </p>
            </div>
            <div class="wizard-progress" style="display:flex; gap:8px; margin-bottom:20px; justify-content:center;">
                ${progress}
            </div>
            <div class="wizard-step active">
                <h3 style="font-size:18px; font-weight:700; margin-bottom:12px;">${s.title}</h3>
                <div class="form-group">
                    <input type="text" id="wizardInput" placeholder="${s.placeholder}" value="${data[s.field] || ''}" 
                           style="width:100%; padding:14px 16px; background:var(--bg-input); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text-primary); font-size:15px; font-family:var(--font);">
                </div>
                <div style="display:flex; gap:8px; margin-top:16px;">
                    ${step > 1 ? `<button class="btn btn-secondary btn-sm" onclick="wizardPrev()" style="flex:1;"><i class="fas fa-arrow-left"></i> Назад</button>` : ''}
                    <button class="btn btn-primary btn-sm" onclick="wizardNext()" style="flex:1;">
                        ${step < steps.length ? 'Далее →' : '✅ Создать'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderComplete(link) {
        return `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    ✅ Сделка создана!
                </h1>
            </div>
            <div class="card" style="text-align:center; padding:30px 20px;">
                <i class="fas fa-check-circle" style="font-size:48px; color:var(--success); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ссылка для покупателя:</p>
                <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-sm); margin:12px 0; word-break:break-all;">
                    <span id="dealLink" style="font-size:13px; color:var(--text-primary);">${link}</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="copyDealLinkFromWizard()" style="width:auto; padding:8px 24px; margin:0 auto;">
                    <i class="fas fa-copy"></i> Скопировать ссылку
                </button>
                <button class="btn btn-primary btn-sm" onclick="navigateTo('main')" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-home"></i> На главную
                </button>
            </div>
        `;
    }

    window.wizardNext = async function() {
        const input = document.getElementById('wizardInput');
        if (!input) return;
        
        const value = input.value.trim();
        if (!value) {
            showToast('❌ Заполните поле', 'error');
            return;
        }

        const s = steps[step - 1];
        data[s.field] = value;

        if (step < steps.length) {
            step++;
            mainContent.innerHTML = renderStep();
            mainContent.querySelectorAll('.card').forEach(el => el.classList.add('animate-fade-in'));
        } else {
            const btn = document.querySelector('.wizard-step .btn-primary');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }

            try {
                const result = await createDeal({
                    product: data.product,
                    currency: 'TON',
                    amount: parseFloat(data.amount),
                    buyer_username: data.buyer
                });

                if (result.success) {
                    mainContent.innerHTML = renderComplete(result.link);
                    window._dealLink = result.link;
                    showToast('✅ Сделка создана!', 'success');
                } else {
                    showToast('❌ ' + (result.error || 'Ошибка'), 'error');
                    step--;
                    mainContent.innerHTML = renderStep();
                }
            } catch (e) {
                showToast('❌ Ошибка: ' + e.message, 'error');
                step--;
                mainContent.innerHTML = renderStep();
            }
        }
    };

    window.wizardPrev = function() {
        if (step > 1) {
            step--;
            mainContent.innerHTML = renderStep();
            mainContent.querySelectorAll('.card').forEach(el => el.classList.add('animate-fade-in'));
        }
    };

    window.copyDealLinkFromWizard = function() {
        const link = window._dealLink;
        if (link) {
            navigator.clipboard.writeText(link);
            showToast('✅ Ссылка скопирована!', 'success');
        }
    };

    mainContent.innerHTML = renderStep();
    mainContent.querySelectorAll('.card').forEach(el => el.classList.add('animate-fade-in'));
}

// Экспорты
window.navigateTo = navigateTo;
window.renderPage = renderPage;
window.renderCreateDeal = renderCreateDeal;
