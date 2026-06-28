// ============================================================
// REVIEWS — СТРАНИЦА ОТЗЫВОВ
// ============================================================

let reviewsPage = 0;
const REVIEWS_LIMIT = 10;

/**
 * Рендеринг страницы отзывов
 */
async function renderReviews() {
    try {
        const data = await getReviews(REVIEWS_LIMIT, reviewsPage);
        const reviews = data.success ? data.reviews : [];
        const total = data.total || 0;

        let html = `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    ⭐ Отзывы
                </h1>
                <p style="color:var(--text-secondary); font-size:14px; margin-top:2px;">
                    ${total} ${declension(total, 'отзыв', 'отзыва', 'отзывов')}
                </p>
            </div>

            <!-- Форма добавления отзыва -->
            <div class="card" style="border-color:rgba(0,152,234,0.1); background:rgba(0,152,234,0.03);">
                <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">📝 Написать отзыв</h4>
                <div class="form-group">
                    <label>Оценка</label>
                    <select id="reviewRating">
                        <option value="5">⭐⭐⭐⭐⭐ 5</option>
                        <option value="4">⭐⭐⭐⭐ 4</option>
                        <option value="3">⭐⭐⭐ 3</option>
                        <option value="2">⭐⭐ 2</option>
                        <option value="1">⭐ 1</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Текст отзыва</label>
                    <textarea id="reviewText" placeholder="Напишите ваш отзыв анонимно..." rows="2"></textarea>
                </div>
                <button class="btn btn-primary btn-sm" onclick="submitReview()">
                    <i class="fas fa-paper-plane"></i> Отправить
                </button>
            </div>

            <!-- Список отзывов -->
            <div id="reviewsList" style="margin-top:12px;">
        `;

        if (reviews.length === 0) {
            html += `
                <p style="color:var(--text-muted); text-align:center; padding:20px;">Пока нет отзывов. Будьте первым!</p>
            `;
        } else {
            html += reviews.map(r => createReviewCard(r)).join('');
        }

        html += `
            </div>
            ${reviews.length >= REVIEWS_LIMIT ? `
                <button class="btn btn-secondary btn-sm" onclick="loadMoreReviews()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-chevron-down"></i> Загрузить ещё
                </button>
            ` : ''}
            <div style="height:20px;"></div>
        `;

        mainContent.innerHTML = html;
        mainContent.querySelectorAll('.card').forEach(el => {
            el.classList.add('animate-fade-in');
        });

    } catch (error) {
        console.error('Render reviews error:', error);
        mainContent.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px; color:var(--danger); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ошибка загрузки отзывов</p>
                <button class="btn btn-primary btn-sm" onclick="renderReviews()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-sync"></i> Обновить
                </button>
            </div>
        `;
    }
}

/**
 * Отправить отзыв
 */
async function submitReview() {
    const rating = parseInt(document.getElementById('reviewRating').value);
    const text = document.getElementById('reviewText').value.trim();

    if (!text) {
        showToast('❌ Напишите текст отзыва', 'error');
        return;
    }

    const btn = document.querySelector('#reviewsList .btn-primary');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        const data = await addReview({ rating, text, anonymous: true });
        if (data.success) {
            showToast('✅ Отзыв опубликован!', 'success');
            document.getElementById('reviewText').value = '';
            reviewsPage = 0;
            renderReviews();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить';
        }
    }
}

/**
 * Загрузить ещё отзывы
 */
function loadMoreReviews() {
    reviewsPage++;
    renderReviews();
}

/**
 * Удалить отзыв (админ)
 */
async function deleteReview(reviewId) {
    if (!confirm('Удалить этот отзыв?')) return;
    
    try {
        const data = await deleteReview(reviewId);
        if (data.success) {
            showToast('✅ Отзыв удалён', 'success');
            reviewsPage = 0;
            renderReviews();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    }
}

// Экспорты
window.submitReview = submitReview;
window.loadMoreReviews = loadMoreReviews;
window.deleteReview = deleteReview;
