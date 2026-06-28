// ============================================================
// ADMIN — АДМИН-ПАНЕЛЬ
// ============================================================

let isAdmin = false;

/**
 * Проверка прав админа
 */
async function checkAdminStatus() {
    try {
        const data = await checkAdmin();
        isAdmin = data.is_admin || false;
        return isAdmin;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

/**
 * Рендеринг админ-панели
 */
async function renderAdmin() {
    // Проверяем права
    if (!isAdmin) {
        // Просто показываем страницу профиля вместо админки
        await renderProfile();
        return;
    }

    try {
        const [stats, deals, withdraws] = await Promise.all([
            getStats(),
            getAllDeals(),
            getWithdrawRequests()
        ]);

        const statsData = stats.success ? stats : { deals_today: 1264, users: 21374, reviews: 5427, volume: 47.6 };
        const dealsList = deals.success ? deals.deals : [];
        const withdrawList = withdraws.success ? withdraws.requests : [];

        let html = `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    👑 Админ панель
                </h1>
                <p style="color:var(--text-secondary); font-size:14px; margin-top:2px;">
                    Управление платформой
                </p>
            </div>

            <!-- Статистика -->
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px;">
                <div class="card" style="padding:12px; text-align:center;">
                    <div style="font-size:18px; font-weight:800; color:var(--primary);">${shortenNumber(statsData.deals_today || 1264)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase;">Сделок сегодня</div>
                </div>
                <div class="card" style="padding:12px; text-align:center;">
                    <div style="font-size:18px; font-weight:800; color:var(--text-primary);">${shortenNumber(statsData.users || 21374)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase;">Пользователей</div>
                </div>
                <div class="card" style="padding:12px; text-align:center;">
                    <div style="font-size:18px; font-weight:800; color:var(--warning);">${shortenNumber(statsData.reviews || 5427)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase;">Отзывов</div>
                </div>
                <div class="card" style="padding:12px; text-align:center;">
                    <div style="font-size:18px; font-weight:800; color:var(--gold);">${(statsData.volume || 47.6).toFixed(1)}K</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase;">Объём TON</div>
                </div>
            </div>

            <!-- Инструменты -->
            <div class="card">
                <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">🛠 Инструменты</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="adminAddBalance()">
                        <i class="fas fa-plus-circle"></i> Начислить баланс
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminSetStats()">
                        <i class="fas fa-chart-line"></i> Накрутить статистику
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminClearReviews()">
                        <i class="fas fa-trash-alt"></i> Очистить отзывы
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminViewDeals()">
                        <i class="fas fa-list"></i> Все сделки
                    </button>
                </div>
            </div>

            <!-- Заявки на вывод -->
            ${withdrawList.length > 0 ? `
                <div class="card">
                    <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">
                        💲 Заявки на вывод (${withdrawList.length})
                    </h4>
                    ${withdrawList.map(r => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
                            <div>
                                <div style="font-weight:600;">${r.username}</div>
                                <div style="font-size:12px; color:var(--text-muted);">${r.amount} ${r.currency}</div>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-success btn-sm" onclick="adminConfirmWithdraw('${r.id}')" style="width:auto; padding:4px 12px; font-size:11px;">
                                    ✅
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="adminRejectWithdraw('${r.id}')" style="width:auto; padding:4px 12px; font-size:11px;">
                                    ❌
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="height:20px;"></div>
        `;

        mainContent.innerHTML = html;
        mainContent.querySelectorAll('.card').forEach(el => {
            el.classList.add('animate-fade-in');
        });

    } catch (error) {
        console.error('Render admin error:', error);
        mainContent.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px; color:var(--danger); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ошибка загрузки админ-панели</p>
                <button class="btn btn-primary btn-sm" onclick="renderAdmin()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-sync"></i> Обновить
                </button>
            </div>
        `;
    }
}

/**
 * Админ: начислить баланс
 */
async function adminAddBalance() {
    const userId = prompt('Telegram ID пользователя:');
    if (!userId) return;
    
    const currency = prompt('Валюта (TON/STARS/RUB/UAH):');
    if (!currency) return;
    
    const amount = prompt('Сумма:');
    if (!amount) return;

    try {
        const data = await addBalance({
            target_user_id: parseInt(userId),
            currency: currency.toUpperCase(),
            amount: parseFloat(amount)
        });
        if (data.success) {
            showToast(`✅ Начислено ${amount} ${currency} пользователю ${userId}`, 'success');
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

/**
 * Админ: накрутить статистику
 */
async function adminSetStats() {
    const key = prompt('Ключ (deals_today/users/reviews/volume):');
    if (!key) return;
    
    const value = prompt('Значение:');
    if (!value) return;

    try {
        const data = await setStats({ key, value: parseFloat(value) });
        if (data.success) {
            showToast('✅ Статистика обновлена', 'success');
            renderAdmin();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

/**
 * Админ: подтвердить вывод
 */
async function adminConfirmWithdraw(requestId) {
    if (!confirm('Подтвердить вывод?')) return;
    try {
        const data = await confirmWithdraw(requestId);
        if (data.success) {
            showToast('✅ Вывод подтверждён', 'success');
            renderAdmin();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

/**
 * Админ: отклонить вывод
 */
async function adminRejectWithdraw(requestId) {
    if (!confirm('Отклонить вывод?')) return;
    try {
        const data = await rejectWithdraw(requestId);
        if (data.success) {
            showToast('✅ Вывод отклонён', 'success');
            renderAdmin();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

/**
 * Админ: просмотр всех сделок
 */
async function adminViewDeals() {
    try {
        const data = await getAllDeals();
        if (data.success && data.deals) {
            const html = data.deals.map(d => `
                <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
                    <span>#${d.deal_id}</span>
                    <span>${d.product}</span>
                    <span>${d.amount} ${d.currency}</span>
                    <span style="color:${d.status === 'completed' ? 'var(--success)' : 'var(--warning)'}">${d.status}</span>
                </div>
            `).join('');
            showModal(html, '📊 Все сделки');
        } else {
            showToast('❌ Нет сделок', 'info');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

/**
 * Админ: очистить отзывы
 */
async function adminClearReviews() {
    if (!confirm('Удалить ВСЕ отзывы?')) return;
    try {
        const data = await clearReviews();
        if (data.success) {
            showToast('✅ Все отзывы удалены', 'success');
            renderAdmin();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

// Экспорты
window.adminAddBalance = adminAddBalance;
window.adminSetStats = adminSetStats;
window.adminConfirmWithdraw = adminConfirmWithdraw;
window.adminRejectWithdraw = adminRejectWithdraw;
window.adminViewDeals = adminViewDeals;
window.adminClearReviews = adminClearReviews;
