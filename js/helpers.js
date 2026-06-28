// ============================================================
// HELPERS
// ============================================================

/**
 * Форматирование валюты
 */
function formatCurrency(amount, currency = 'TON') {
    if (amount === undefined || amount === null) return '0';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return '0';
    if (Number.isInteger(num)) {
        return num.toLocaleString('ru-RU') + ' ' + currency;
    }
    return num.toFixed(2).toLocaleString('ru-RU') + ' ' + currency;
}

/**
 * Форматирование даты
 */
function formatDate(dateStr) {
    if (!dateStr) return 'только что';
    const date = new Date(dateStr);
    if (isNaN(date)) return 'недавно';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'только что';
    if (diff < 3600) return Math.floor(diff / 60) + ' мин назад';
    if (diff < 86400) return Math.floor(diff / 3600) + ' ч назад';
    if (diff < 604800) return Math.floor(diff / 86400) + ' д назад';
    return date.toLocaleDateString('ru-RU');
}

/**
 * Сокращение чисел (1K, 1.5M, etc)
 */
function shortenNumber(num) {
    if (num === undefined || num === null) return '0';
    const n = typeof num === 'number' ? num : parseFloat(num);
    if (isNaN(n)) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

/**
 * Генерация ID
 */
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Задержка (для анимаций)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Проверка на пустой объект
 */
function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

/**
 * Безопасный доступ к вложенному объекту
 */
function getSafe(obj, path, fallback = undefined) {
    try {
        return path.split('.').reduce((o, p) => o?.[p], obj) ?? fallback;
    } catch {
        return fallback;
    }
}

/**
 * Скопировать в буфер обмена
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
    }
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
