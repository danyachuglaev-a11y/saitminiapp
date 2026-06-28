// ============================================================
// API — ВСЕ ЗАПРОСЫ К БОТУ
// ============================================================

const API_BASE = 'https://otc-bot-hwua.onrender.com';
const BOT_USERNAME = 'tonkeeperp2p_bot';

// ===== ПОЛЬЗОВАТЕЛЬ (ОПРЕДЕЛЯЕМ ОДИН РАЗ) =====
const user = {
    id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || Math.floor(100000 + Math.random() * 900000),
    username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'user_' + Math.floor(1000 + Math.random() * 9000),
    firstName: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Пользователь'
};

// Делаем user глобальным
window.user = user;

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

// ===== ВСЕ API ФУНКЦИИ =====
async function getBalance() {
    return apiCall('/api/balance');
}

async function getStats() {
    return apiCall('/api/stats');
}

async function getOnline() {
    return apiCall('/api/online');
}

async function getUserDeals() {
    return apiCall('/api/deals');
}

async function createDeal(data) {
    return apiCall('/api/create_deal', data);
}

async function payWithBalance(dealId) {
    return apiCall('/api/pay_balance', { deal_id: dealId });
}

async function confirmRekvisitsPayment(dealId) {
    return apiCall('/api/confirm_rekvisits_payment', { deal_id: dealId });
}

async function getRekvisits(dealId) {
    return apiCall('/api/get_rekvisits', { deal_id: dealId });
}

async function sellerDelivered(dealId) {
    return apiCall('/api/seller_delivered', { deal_id: dealId });
}

async function buyerConfirm(dealId) {
    return apiCall('/api/buyer_confirm', { deal_id: dealId });
}

async function has2Deals() {
    return apiCall('/api/has_2_deals');
}

async function checkAdmin() {
    return apiCall('/api/is_admin');
}

async function withdrawRequest(data) {
    return apiCall('/api/withdraw', data);
}

async function getWithdrawRequests() {
    return apiCall('/api/withdraw_requests');
}

async function confirmWithdraw(requestId) {
    return apiCall('/api/confirm_withdraw', { request_id: requestId });
}

async function rejectWithdraw(requestId) {
    return apiCall('/api/reject_withdraw', { request_id: requestId });
}

async function getAllDeals() {
    return apiCall('/api/all_deals');
}

async function addBalance(data) {
    return apiCall('/api/add_balance', data);
}

async function setStats(data) {
    return apiCall('/api/admin_set_stats', data);
}

async function getReviews(limit = 10, page = 0) {
    return apiCall('/api/reviews', { limit, page });
}

async function addReview(data) {
    return apiCall('/api/add_review', data);
}

async function deleteReview(reviewId) {
    return apiCall('/api/delete_review', { review_id: reviewId });
}

async function clearReviews() {
    return apiCall('/api/clear_reviews');
}

async function checkVerification() {
    return apiCall('/api/check_verification');
}

async function verifyUser(data) {
    return apiCall('/api/verify', data);
}

// Экспорты
window.apiCall = apiCall;
window.getBalance = getBalance;
window.getStats = getStats;
window.getOnline = getOnline;
window.getUserDeals = getUserDeals;
window.createDeal = createDeal;
window.payWithBalance = payWithBalance;
window.confirmRekvisitsPayment = confirmRekvisitsPayment;
window.getRekvisits = getRekvisits;
window.sellerDelivered = sellerDelivered;
window.buyerConfirm = buyerConfirm;
window.has2Deals = has2Deals;
window.checkAdmin = checkAdmin;
window.withdrawRequest = withdrawRequest;
window.getWithdrawRequests = getWithdrawRequests;
window.confirmWithdraw = confirmWithdraw;
window.rejectWithdraw = rejectWithdraw;
window.getAllDeals = getAllDeals;
window.addBalance = addBalance;
window.setStats = setStats;
window.getReviews = getReviews;
window.addReview = addReview;
window.deleteReview = deleteReview;
window.clearReviews = clearReviews;
window.checkVerification = checkVerification;
window.verifyUser = verifyUser;
window.user = user;
