// ============================================================
// MODAL SYSTEM
// ============================================================

const modalOverlay = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');

/**
 * Показать модальное окно
 */
function showModal(html, title = '') {
    modalBody.innerHTML = html;
    if (title) {
        modalBody.innerHTML = `<h3 class="modal-title">${title}</h3>` + html;
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Закрыть модальное окно
 */
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Закрытие по клику на фон
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Экспорты
window.showModal = showModal;
window.closeModal = closeModal;
