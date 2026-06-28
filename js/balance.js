// ============================================================
// BALANCE — СТРАНИЦА БАЛАНСА
// ============================================================

/**
 * Рендеринг страницы баланса
 */
async function renderBalance() {
    try {
        const data = await getBalance();
        const bal = data.success ? data.balance : { ton: 0, stars: 0, rub: 0, uah: 0 };

        const total = (bal.ton || 0) + (bal.stars || 0) + (bal.rub || 0) + (bal.uah || 0);

        let html = `
            <div style="padding:4px 0 12px 0;">
                <h1 style="font-size:24px; font-weight:900; letter-spacing:-0.5px;">
                    💰 Баланс
                </h1>
            </div>

            <!-- Крупная карточка баланса -->
            <div class="card" style="background: linear-gradient(145deg, var(--bg-card), var(--bg-card-hover)); border-color: rgba(0,152,234,0.15); padding:24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:14px; color:var(--text-secondary); font-weight:500;">Общий баланс</span>
                    <span style="font-size:12px; color:var(--text-muted);">TON</span>
                </div>
                <div style="font-size:40px; font-weight:900; letter-spacing:-1px; line-height:1.1;">
                    ${total.toFixed(2)}
                    <span style="font-size:18px; font-weight:600; color:var(--text-secondary);">USD</span>
                </div>
                <div style="font-size:14px; color:var(--text-muted); margin-top:4px;">
                    ≈ ${total.toFixed(2)} TON
                </div>
                <div style="display:flex; gap:10px; margin-top:16px;">
                    <button class="btn btn-primary btn-sm" onclick="showToast('Пополнение временно недоступно', 'info')">
                        <i class="fas fa-arrow-down"></i> Пополнить                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="toggleWithdraw()">
                        <i class="fas fa-arrow-up"></i> Вывести
                    </button>
                </div>
            </div>

            <!-- Детали по валютам -->
            <div style="margin:12px 0;">
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
                    <span><i class="fas fa-coins" style="color:#0098ea;"></i> TON</span>
                    <span style="font-weight:700;">${bal.ton || 0}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
                    <span><i class="fas fa-star" style="color:#f0b90b;"></i> STARS</span>
                    <span style="font-weight:700;">${bal.stars || 0}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
                    <span><i class="fas fa-ruble-sign" style="color:#4ecdc4;"></i> RUB</span>
                    <span style="font-weight:700;">${bal.rub || 0}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:12px 0;">
                    <span><i class="fas fa-hryvnia-sign" style="color:#ff6b6b;"></i> UAH</span>
                    <span style="font-weight:700;">${bal.uah || 0}</span>
                </div>
            </div>

            <!-- Вывод средств -->
            <div id="withdrawSection" style="display:none;" class="card" style="margin-top:8px; border-color:rgba(239,68,68,0.1);">
                <h4 style="font-size:16px; font-weight:700; margin-bottom:12px;">💸 Вывод средств</h4>
                <div class="form-group">
                    <label>Валюта</label>
                    <select id="withdrawCurrency">
                        <option value="TON">💎 TON</option>
                        <option value="STARS">⭐️ STARS</option>
                        <option value="RUB">💰 RUB</option>
                        <option value="UAH">🌐 UAH</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Реквизиты</label>
                    <input type="text" id="withdrawDetails" placeholder="Кошелёк или номер карты">
                </div>
                <button class="btn btn-primary btn-sm" onclick="confirmWithdraw()">
                    <i class="fas fa-check"></i> Подтвердить вывод
                </button>
            </div>

            <div style="height:20px;"></div>
        `;

        mainContent.innerHTML = html;
        mainContent.querySelectorAll('.card').forEach(el => {
            el.classList.add('animate-fade-in');
        });

    } catch (error) {
        console.error('Render balance error:', error);
        mainContent.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:40px; color:var(--danger); margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);">Ошибка загрузки баланса</p>
                <button class="btn btn-primary btn-sm" onclick="renderBalance()" style="margin-top:12px; width:auto; padding:8px 24px;">
                    <i class="fas fa-sync"></i> Обновить
                </button>
            </div>
        `;
    }
}

/**
 * Показать/скрыть форму вывода
 */
function toggleWithdraw() {
    const section = document.getElementById('withdrawSection');
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Подтвердить вывод
 */
async function confirmWithdraw() {
    const currency = document.getElementById('withdrawCurrency').value;
    const details = document.getElementById('withdrawDetails').value.trim();

    if (!details) {
        showToast('❌ Введите реквизиты', 'error');
        return;
    }

    const btn = document.querySelector('#withdrawSection .btn-primary');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        // Проверка 2 сделок
        const check = await has2Deals();
        if (!check.has_2_deals) {
            showToast('⚠️ Для вывода нужно 2 сделки с одним покупателем', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Подтвердить вывод';
            }
            return;
        }

        const data = await withdrawRequest({ currency, details });
        if (data.success) {
            showToast('✅ Заявка на вывод создана!', 'success');
            document.getElementById('withdrawSection').style.display = 'none';
            document.getElementById('withdrawDetails').value = '';
            renderBalance();
        } else {
            showToast('❌ ' + (data.error || 'Ошибка'), 'error');
        }
    } catch (e) {
        showToast('❌ Ошибка: ' + e.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Подтвердить вывод';
        }
    }
}

// Экспорты
window.toggleWithdraw = toggleWithdraw;
window.confirmWithdraw = confirmWithdraw;
