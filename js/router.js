// ============================================================
// ROUTER — УПРАВЛЕНИЕ СТРАНИЦАМИ
// ============================================================

const mainContent = document.getElementById('main-content');
let currentPage = 'main';
let isAdmin = false;

/**
 * Навигация по страницам
 */
function navigateTo(page) {
    if (page === currentPage && page !== 'create') return;
    
    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    currentPage = page;
    
    // Рендерим страницу
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
 * Рендеринг главной страницы
 */
async function renderMain() {
    try {
        const [stats, balance, online, reviews] = await Promise.all([
            getStats(),
            getBalance(),
            getOnline(),
            getReviews(3)
        ]);

        const statsData = stats.success ? stats : { deals_today: 1264, users: 21374, reviews: 5427, volume: 47.6 };
        const bal = balance.success ? balance.balance : { ton: 0, stars: 0, rub: 0, uah: 0 };
        const onlineCount = online.success ? online.online : 6500;
        const reviewsList = reviews.success ? reviews.reviews : [];

        // Обновляем онлайн
        document.getElementById('onlineCount').textContent = onlineCount;

        let html = `
            <!-- Приветствие -->
            <div style="padding: 4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    Привет, ${user.firstName} 👋
                </h1>
                <p style="color:var(--text-secondary); font-size:14px; margin-top:2px;">
                    Добро пожаловать в Tonkeeper P2P
                </p>
            </div>

            <!-- Баланс -->
            ${createBalanceCard(bal)}

            <!-- Быстрые действия -->
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:12px 0;">
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('create')" style="padding:12px 8px; flex-direction:column; gap:4px; border-radius:var(--radius-sm);">
                    <i class="fas fa-plus-circle" style="font-size:20px; color:var(--primary);"></i>
                    <span style="font-size:10px;">Создать</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('deals')" style="padding:12px 8px; flex-direction:column; gap:4px; border-radius:var(--radius-sm);">
                    <i class="fas fa-list-ul" style="font-size:20px; color:var(--text-secondary);"></i>
                    <span style="font-size:10px;">Сделки</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('balance')" style="padding:12px 8px; flex-direction:column; gap:4px; border-radius:var(--radius-sm);">
                    <i class="fas fa-wallet" style="font-size:20px; color:var(--gold);"></i>
                    <span style="font-size:10px;">Баланс</span>
                </button>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('reviews')" style="padding:12px 8px; flex-direction:column; gap:4px; border-radius:var(--radius-sm);">
                    <i class="fas fa-star" style="font-size:20px; color:var(--warning);"></i>
                    <span style="font-size:10px;">Отзывы</span>
                </button>
            </div>

            <!-- Статистика -->
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px;">
                <div class="card" style="padding:12px; text-align:center; border-color:var(--border);">
                    <div style="font-size:18px; font-weight:800; color:var(--primary);">${shortenNumber(statsData.deals_today || 1264)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Сделок сегодня</div>
                </div>
                <div class="card" style="padding:12px; text-align:center; border-color:var(--border);">
                    <div style="font-size:18px; font-weight:800; color:var(--text-primary);">${shortenNumber(statsData.users || 21374)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Пользователей</div>
                </div>
                <div class="card" style="padding:12px; text-align:center; border-color:var(--border);">
                    <div style="font-size:18px; font-weight:800; color:var(--warning);">${shortenNumber(statsData.reviews || 5427)}</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Отзывов</div>
                </div>
                <div class="card" style="padding:12px; text-align:center; border-color:var(--border);">
                    <div style="font-size:18px; font-weight:800; color:var(--gold);">${(statsData.volume || 47.6).toFixed(1)}K</div>
                    <div style="font-size:9px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Объём TON</div>
                </div>
            </div>

            <!-- Последние отзывы -->
            <div style="margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:16px; font-weight:700;">📝 Последние отзывы</span>
                    <button class="btn btn-secondary btn-sm" onclick="navigateTo('reviews')" style="width:auto; padding:4px 12px; font-size:12px;">
                        Все → 
                    </button>
                </div>
                ${reviewsList.length > 0 ? reviewsList.map(r => createReviewCard(r)).join('') : createSkeleton('avatar', 2)}
            </div>

            <!-- Поддержка -->
            <div class="card" style="margin-top:8px; border-color:rgba(0,152,234,0.1); background:rgba(0,152,234,0.03);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <i class="fas fa-headset" style="font-size:20px; color:var(--primary);"></i>
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:14px;">Поддержка 24/7</div>
                        <div style="font-size:12px; color:var(--text-secondary);">Свяжитесь с нами в любой момент</div>
                    </div>
                    <a href="https://t.me/p2psupbot" target="_blank" class="btn btn-primary btn-sm" style="width:auto; padding:8px 16px; font-size:12px;">
                        Написать
                    </a>
                </div>
            </div>
        `;

        mainContent.innerHTML = html;
        mainContent.querySelectorAll('.card').forEach(el => {
            el.classList.add('animate-fade-in');
        });

    } catch (error) {
        console.error('Render main error:', error);
        mainContent.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px; color:var(--danger); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ошибка загрузки данных. Проверьте подключение.</p>
                <button class="btn btn-primary btn-sm" onclick="renderMain()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-sync"></i> Обновить
                </button>
            </div>
        `;
    }
}

// Экспорты
window.navigateTo = navigateTo;
window.renderPage = renderPage;
