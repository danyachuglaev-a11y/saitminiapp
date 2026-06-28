// ============================================================
// TOAST SYSTEM
// ============================================================

const toastContainer = document.getElementById('toast-container');

/**
 * Показать уведомление
 */
function showToast(message, type = 'info', duration = 3500) {
    const existing = toastContainer.querySelectorAll('.toast');
    existing.forEach(t => t.classList.add('out'));
    
    setTimeout(() => {
        existing.forEach(t => t.remove());
    }, 300);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Экспортируем в глобальную область
window.showToast = showToast;
