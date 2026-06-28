// ============================================================
// ROUTER — УПРАВЛЕНИЕ СТРАНИЦАМИ
// ============================================================

const mainContent = document.getElementById('main-content');
let currentPage = 'main';

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

// Экспорты
window.navigateTo = navigateTo;
window.renderPage = renderPage;
