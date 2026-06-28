// ============================================================
// UI — ОБЩИЕ КОМПОНЕНТЫ
// ============================================================

/**
 * Создать карточку баланса
 */
function createBalanceCard(balance) {
    const total = (balance.ton || 0) + (balance.stars || 0) + (balance.rub || 0) + (balance.uah || 0);
    return `
        <div class="card" style="background: linear-gradient(135deg, var(--bg-card), var(--bg-card-hover)); border-color: rgba(0,152,234,0.2);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                    <span style="font-size:12px; color:var(--text-muted); font-weight:500;">Общий баланс</span>
                    <div style="font-size:28px; font-weight:900; margin-top:2px; letter-spacing:-0.5px;">
                        ${total.toFixed(2)} <span style="font-size:16px; font-weight:600; color:var(--text-secondary);">USD</span>
                    </div>
                </div>
                <div style="background:var(--primary); padding:8px 14px; border-radius:30px; font-size:12px; font-weight:700;">
                    ● Живой
                </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:8px;">
                <div style="text-align:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm);">
                    <div style="font-size:10px; color:var(--text-muted);">TON</div>
                    <div style="font-size:16px; font-weight:700; color:#0098ea;">${balance.ton || 0}</div>
                </div>
                <div style="text-align:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm);">
                    <div style="font-size:10px; color:var(--text-muted);">STARS</div>
                    <div style="font-size:16px; font-weight:700; color:#f0b90b;">${balance.stars || 0}</div>
                </div>
                <div style="text-align:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm);">
                    <div style="font-size:10px; color:var(--text-muted);">RUB</div>
                    <div style="font-size:16px; font-weight:700; color:#4ecdc4;">${balance.rub || 0}</div>
                </div>
                <div style="text-align:center; padding:8px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm);">
                    <div style="font-size:10px; color:var(--text-muted);">UAH</div>
                    <div style="font-size:16px; font-weight:700; color:#ff6b6b;">${balance.uah || 0}</div>
                </div>
            </div>
            <div style="display:flex; gap:8px; margin-top:12px;">
                <button class="btn btn-primary btn-sm" onclick="window.navigateTo('balance')">
                    <i class="fas fa-arrow-up"></i> Вывести
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.showToast('Пополнение временно недоступно', 'info')">
                    <i class="fas fa-arrow-down"></i> Пополнить
                </button>
            </div>
        </div>
    `;
}

/**
 * Создать карточку сделки
 */
function createDealCard(deal) {
    const statusMap = {
        'waiting_payment': { label: 'Ожидает оплаты', color: 'var(--warning)' },
        'paid': { label: 'Оплачено', color: 'var(--success)' },
        'awaiting_confirmation': { label: 'Ожидает подтверждения', color: 'var(--primary)' },
        'completed': { label: 'Завершено', color: 'var(--text-secondary)' }
    };
    const status = statusMap[deal.status] || statusMap['waiting_payment'];
    
    const steps = [
        { label: 'Оплата', done: deal.status !== 'waiting_payment' },
        { label: 'Передача', done: deal.status === 'paid' || deal.status === 'awaiting_confirmation' || deal.status === 'completed' },
        { label: 'Подтверждение', done: deal.status === 'awaiting_confirmation' || deal.status === 'completed' },
        { label: 'Завершено', done: deal.status === 'completed' }
    ];

    const isSeller = deal.seller_id === user.id;
    const isBuyer = deal.buyer_id === user.id;

    return `
        <div class="card deal-card" data-deal-id="${deal.deal_id}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                    <div style="font-weight:700; font-size:16px;">${escapeHtml(deal.product)}</div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-top:2px;">
                        ${formatCurrency(deal.amount, deal.currency)}
                    </div>
                </div>
                <span style="font-size:11px; font-weight:600; color:${status.color}; background:${status.color}15; padding:4px 12px; border-radius:30px;">
                    ${status.label}
                </span>
            </div>

            <!-- Progress Stepper -->
            <div style="display:flex; gap:4px; margin:12px 0; padding:0 4px; position:relative;">
                ${steps.map((step, i) => `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; position:relative;">
                        ${i > 0 ? `<div style="position:absolute; top:8px; left:-50%; width:100%; height:2px; background:${step.done ? 'var(--success)' : 'var(--border)'};"></div>` : ''}
                        <div style="width:16px; height:16px; border-radius:50%; background:${step.done ? 'var(--success)' : step.label === 'Оплата' && deal.status === 'waiting_payment' ? 'var(--primary)' : 'var(--border)'}; 
                                    border:2px solid ${step.done ? 'var(--success)' : step.label === 'Оплата' && deal.status === 'waiting_payment' ? 'var(--primary)' : 'var(--border)'};
                                    box-shadow: ${step.done ? '0 0 20px rgba(34,197,94,0.2)' : 'none'};
                                    transition: var(--transition); z-index:1;">
                        </div>
                        <span style="font-size:7px; color:${step.done ? 'var(--text-secondary)' : 'var(--text-muted)'}; text-align:center; font-weight:600; white-space:nowrap;">
                            ${step.label}
                        </span>
                    </div>
                `).join('')}
            </div>

            <!-- Действия -->
            ${deal.status === 'waiting_payment' && isBuyer ? `
                <button class="btn btn-primary btn-sm" onclick="window.payDeal('${deal.deal_id}')">
                    <i class="fas fa-credit-card"></i> Оплатить
                </button>
            ` : ''}
            ${deal.status === 'waiting_payment' && isSeller ? `
                <button class="btn btn-secondary btn-sm" onclick="window.copyDealLink('${deal.deal_id}')">
                    <i class="fas fa-link"></i> Скопировать ссылку
                </button>
            ` : ''}
            ${deal.status === 'paid' && isSeller ? `
                <button class="btn btn-success btn-sm" onclick="window.sellerDelivered('${deal.deal_id}')">
                    <i class="fas fa-box"></i> Передал товар
                </button>
            ` : ''}
            ${deal.status === 'awaiting_confirmation' && isBuyer ? `
                <button class="btn btn-success btn-sm" onclick="window.confirmReceipt('${deal.deal_id}')">
                    <i class="fas fa-check"></i> Подтвердить получение
                </button>
            ` : ''}
            ${deal.status === 'completed' ? `
                <div style="font-size:12px; color:var(--success); text-align:center; padding:4px; background:var(--success-bg); border-radius:var(--radius-sm);">
                    <i class="fas fa-check-circle"></i> Сделка завершена
                </div>
            ` : ''}
            ${deal.status === 'awaiting_confirmation' && isSeller ? `
                <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:4px;">
                    ⏳ Ожидание подтверждения покупателя
                </div>
            ` : ''}
            ${deal.status === 'paid' && isBuyer ? `
                <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:4px;">
                    ⏳ Ожидание передачи товара
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Создать карточку отзыва
 */
function createReviewCard(review) {
    return `
        <div class="card review-card" style="padding:16px;">
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; color:#fff; flex-shrink:0;">
                    ${review.user ? review.user.charAt(0).toUpperCase() : 'А'}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:14px;">${review.anonymous ? 'Аноним' : escapeHtml(review.user)}</div>
                    <div style="font-size:12px; color:var(--text-muted);">${formatDate(review.date)}</div>
                </div>
                <div style="color:var(--gold); font-size:14px;">
                    ${'⭐'.repeat(review.rating || 5)}
                </div>
            </div>
            <div style="margin-top:8px; font-size:14px; color:var(--text-secondary); line-height:1.5;">
                ${escapeHtml(review.text)}
            </div>
            ${window.isAdmin ? `
                <button class="btn btn-danger btn-sm" style="margin-top:8px; width:auto; padding:4px 12px;" onclick="window.deleteReview('${review.id}')">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            ` : ''}
        </div>
    `;
}

/**
 * Создать скелетон
 */
function createSkeleton(type = 'card', count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            html += `
                <div class="card skeleton" style="padding:20px; margin-bottom:12px;">
                    <div class="skeleton skeleton-title" style="width:60%;"></div>
                    <div class="skeleton skeleton-text" style="width:80%;"></div>
                    <div class="skeleton skeleton-text" style="width:40%;"></div>
                </div>
            `;
        } else if (type === 'avatar') {
            html += `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                    <div class="skeleton skeleton-avatar"></div>
                    <div style="flex:1;">
                        <div class="skeleton skeleton-text" style="width:60%;"></div>
                        <div class="skeleton skeleton-text" style="width:40%;"></div>
                    </div>
                </div>
            `;
        }
    }
    return html;
}

// Экспорты
window.createBalanceCard = createBalanceCard;
window.createDealCard = createDealCard;
window.createReviewCard = createReviewCard;
window.createSkeleton = createSkeleton;
