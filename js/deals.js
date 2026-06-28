// ============================================================
// DEALS — СТРАНИЦА СДЕЛОК
// ============================================================

/**
 * Рендеринг страницы сделок
 */
async function renderDeals() {
    try {
        const data = await getUserDeals();
        const deals = data.success ? data.deals : [];

        let html = `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    📊 Мои сделки
                </h1>
                <p style="color:var(--text-secondary); font-size:14px; margin-top:2px;">
                    ${deals.length} ${declension(deals.length, 'сделка', 'сделки', 'сделок')}
                </p>
            </div>
        `;

        if (deals.length === 0) {
            html += `
                <div class="card" style="text-align:center; padding:40px 20px;">
                    <i class="fas fa-inbox" style="font-size:48px; color:var(--text-muted); margin-bottom:12px;"></i>
                    <p style="color:var(--text-secondary);">У вас пока нет сделок</p>
                    <button class="btn btn-primary btn-sm" onclick="navigateTo('create')" style="margin-top:12px; width:auto; padding:8px 24px;">
                        <i class="fas fa-plus-circle"></i> Создать сделку
                    </button>
                </div>
            `;
        } else {
            html += deals.map(d => createDealCard(d)).join('');
        }

        html += `
            <div style="height:20px;"></div>
        `;

        mainContent.innerHTML = html;
        mainContent.querySelectorAll('.card').forEach(el => {
            el.classList.add('animate-fade-in');
        });

    } catch (error) {
        console.error('Render deals error:', error);
        mainContent.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px; color:var(--danger); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ошибка загрузки сделок</p>
                <button class="btn btn-primary btn-sm" onclick="renderDeals()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-sync"></i> Обновить
                </button>
            </div>
        `;
    }
}

/**
 * Склонение существительных
 */
function declension(n, one, two, five) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return five;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
}

/**
 * Копирование ссылки на сделку
 */
async function copyDealLink(dealId) {
    const link = `https://t.me/${BOT_USERNAME}?start=deal_${dealId}`;
    await copyToClipboard(link);
    showToast('✅ Ссылка скопирована!', 'success');
}

/**
 * Продавец передал товар
 */
async function sellerDelivered(dealId) {
    if (!confirm('Подтвердить передачу товара?')) return;
    
    const btn = document.querySelector(`[onclick*="sellerDelivered('${dealId}')"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        const data = await sellerDelivered(dealId);
        if (data.success) {
            showToast('✅ Вы подтвердили передачу товара', 'success');
            renderDeals();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-box"></i> Передал товар';
            }
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-box"></i> Передал товар';
        }
    }
}

/**
 * Покупатель подтвердил получение
 */
async function confirmReceipt(dealId) {
    if (!confirm('Подтвердить получение товара?')) return;
    
    const btn = document.querySelector(`[onclick*="confirmReceipt('${dealId}')"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        const data = await buyerConfirm(dealId);
        if (data.success) {
            showToast('✅ Получение подтверждено! Средства зачислены', 'success');
            renderDeals();
            if (document.getElementById('page-balance')) {
                renderBalance();
            }
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Подтвердить получение';
            }
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Подтвердить получение';
        }
    }
}

// Экспорты
window.copyDealLink = copyDealLink;
window.sellerDelivered = sellerDelivered;
window.confirmReceipt = confirmReceipt;
