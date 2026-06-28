// ============================================================
// APP — ГЛАВНЫЙ ФАЙЛ ЗАПУСКА
// ============================================================

/**
 * Инициализация приложения
 */
async function initApp() {
    console.log('⚡ Tonkeeper P2P v2.0');
    console.log('👤 Пользователь:', user);

    // Проверка языка
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        document.getElementById('languageOverlay').classList.remove('active');
        window.currentLang = savedLang;
    } else {
        document.getElementById('languageOverlay').classList.add('active');
    }

    // Проверка админа
    isAdmin = await checkAdminStatus();
    console.log('👑 Админ:', isAdmin);

    // Навигация по кнопкам
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            // Если админка и не админ — перенаправляем на профиль
            if (page === 'admin' && !isAdmin) {
                navigateTo('profile');
                return;
            }
            navigateTo(page);
        });
    });

    // Загружаем главную страницу
    navigateTo('main');

    // Автообновление
    setInterval(() => {
        if (currentPage === 'main') {
            document.getElementById('onlineCount').textContent = Math.floor(6200 + Math.random() * 600);
        }
    }, 10000);

    // Обработка свайпов (Telegram)
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
    }
}

/**
 * Установка языка
 */
function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    window.currentLang = lang;
    document.getElementById('languageOverlay').classList.remove('active');
    showToast('✅ Язык установлен', 'success');
    // Перезагружаем данные
    if (currentPage === 'main') renderMain();
}

/**
 * Страница профиля (заглушка)
 */
async function renderProfile() {
    mainContent.innerHTML = `
        <div style="padding:4px 0 12px 0;">
            <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                👤 Профиль
            </h1>
        </div>
        <div class="card" style="text-align:center; padding:40px 20px;">
            <div style="width:80px; height:80px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:700; color:#fff; margin:0 auto 12px;">
                ${user.firstName.charAt(0).toUpperCase()}
            </div>
            <h3 style="font-size:20px; font-weight:700;">${user.firstName}</h3>
            <p style="color:var(--text-secondary);">@${user.username}</p>
            <p style="color:var(--text-muted); font-size:12px; margin-top:8px;">ID: ${user.id}</p>
            <div style="margin-top:16px; display:flex; gap:10px; justify-content:center;">
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('balance')" style="width:auto; padding:8px 16px;">
                    <i class="fas fa-wallet"></i> Баланс
                </button>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('deals')" style="width:auto; padding:8px 16px;">
                    <i class="fas fa-list"></i> Сделки
                </button>
            </div>
        </div>
        <div style="height:20px;"></div>
    `;
}

// Глобальные функции
window.setLanguage = setLanguage;
window.renderProfile = renderProfile;

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
