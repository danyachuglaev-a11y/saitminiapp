// ============================================================
// API — ВСЕ ЗАПРОСЫ К БОТУ
// ============================================================

const API_BASE = 'https://otc-bot-hwua.onrender.com';
const BOT_USERNAME = 'tonkeeperp2p_bot';

// Текущий пользователь из Telegram
const user = {
    id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Math.floor(100000 + Math.random() * 900000),
    username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'user_' + Math.floor(1000 + Math.random() * 9000),
    firstName: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Пользователь'
};

/**
 * Базовый API вызов
 */
async function apiCall(endpoint, data = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-User-Id': user.id,
                'X-Telegram-Username': user.username
            },
            body: JSON.stringify({ ...data, user_id: user.id, username: user.username })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Получить баланс
 */
async function getBalance() {
    return apiCall('/api/balance');
}

/**
 * Получить статистику
 */
async function getStats() {
    return apiCall('/api/stats');
}

/**
 * Получить онлайн
 */
async function getOnline() {
    return apiCall('/api/online');
}

/**
 * Получить сделки пользователя
 */
async function getUserDeals() {
    return apiCall('/api/deals');
}

/**
 * Создать сделку
 */
async function createDeal(data) {
    return apiCall('/api/create_deal', data);
}

/**
 * Оплатить с баланса
 */
async function payWithBalance(dealId) {
    return apiCall('/api/pay_balance', { deal_id: dealId });
}

/**
 * Подтвердить оплату по реквизитам
 */
async function confirmRekvisitsPayment(dealId) {
    return apiCall('/api/confirm_rekvisits_payment', { deal_id: dealId });
}

/**
 * Получить реквизиты для оплаты
 */
async function getRekvisits(dealId) {
    return apiCall('/api/get_rekvisits', { deal_id: dealId });
}

/**
 * Продавец передал товар
 */
async function sellerDelivered(dealId) {
    return apiCall('/api/seller_delivered', { deal_id: dealId });
}

/**
 * Покупатель подтвердил получение
 */
async function buyerConfirm(dealId) {
    return apiCall('/api/buyer_confirm', { deal_id: dealId });
}

/**
 * Проверка 2 сделок
 */
async function has2Deals() {
    return apiCall('/api/has_2_deals');
}

/**
 * Проверка админа
 */
async function checkAdmin() {
    return apiCall('/api/is_admin');
}

/**
 * Запрос на вывод
 */
async function withdrawRequest(data) {
    return apiCall('/api/withdraw', data);
}

/**
 * Заявки на вывод (админ)
 */
async function getWithdrawRequests() {
    return apiCall('/api/withdraw_requests');
}

/**
 * Подтвердить вывод (админ)
 */
async function confirmWithdraw(requestId) {
    return apiCall('/api/confirm_withdraw', { request_id: requestId });
}

/**
 * Отклонить вывод (админ)
 */
async function rejectWithdraw(requestId) {
    return apiCall('/api/reject_withdraw', { request_id: requestId });
}

/**
 * Все сделки (админ)
 */
async function getAllDeals() {
    return apiCall('/api/all_deals');
}

/**
 * Начислить баланс (админ)
 */
async function addBalance(data) {
    return apiCall('/api/add_balance', data);
}

/**
 * Накрутить статистику (админ)
 */
async function setStats(data) {
    return apiCall('/api/admin_set_stats', data);
}

/**
 * Отзывы
 */
async function getReviews(limit = 10, page = 0) {
    return apiCall('/api/reviews', { limit, page });
}

/**
 * Добавить отзыв
 */
async function addReview(data) {
    return apiCall('/api/add_review', data);
}

/**
 * Удалить отзыв (админ)
 */
async function deleteReview(reviewId) {
    return apiCall('/api/delete_review', { review_id: reviewId });
}

/**
 * Очистить отзывы (админ)
 */
async function clearReviews() {
    return apiCall('/api/clear_reviews');
}

/**
 * Проверить верификацию
 */
async function checkVerification() {
    return apiCall('/api/check_verification');
}

/**
 * Пройти верификацию
 */
async function verifyUser(data) {
    return apiCall('/api/verify', data);
}
