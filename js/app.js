const services = {
    tire: {
        title: 'Шиномонтаж выездной',
        detail: 'Замена колеса (1 шт.)',
        price: 1500,
        eta: 20,
        masterService: 'Шиномонтаж'
    },
    tow: {
        title: 'Эвакуатор',
        detail: 'Подача платформы по Москве',
        price: 2500,
        eta: 25,
        masterService: 'Эвакуатор'
    },
    battery: {
        title: 'Прикурить аккумулятор',
        detail: 'Запуск от бустера',
        price: 800,
        eta: 15,
        masterService: 'Автоэлектрик'
    },
    other: {
        title: 'СТО рядом',
        detail: 'Диагностика и ремонт в ближайшем сервисе',
        price: 1800,
        eta: 20,
        masterService: 'СТО рядом'
    },
    sos: {
        title: 'SOS',
        detail: 'Экстренная помощь',
        price: 2000,
        eta: 10,
        masterService: 'Экстренный мастер'
    }
};

const order = {
    id: Math.floor(100000 + Math.random() * 900000),
    serviceKey: 'tire',
    location: 'Ленинградское ш., 16к1',
    comment: 'Прокол заднего колеса. Toyota Camry, черный',
    status: 'draft',
    selectedMasterId: null,
    customerRating: 5,
    review: ''
};

let executorFilter = 'all';
let executorOrderFilter = 'new';
let activeExecutorOrderId = localStorage.getItem('katimActiveExecutorOrderId') || null;
let chatBackTarget = 'screen-active-order';

const defaultMasters = [
    { id: 'alexey', name: 'АвтоПрофи', rating: 4.8, eta: 7, distance: 2.1, price: 2500, reviews: 256, orders: 356, experience: 6, avatar: 'АП', car: 'Peugeot Boxer, белый', category: 'sto', diagnostics: 'диагностика', badge: 'Можно доехать самостоятельно', verified: true },
    { id: 'dmitry', name: 'Кволити Моторс', rating: 4.6, eta: 10, distance: 2.8, price: 3200, reviews: 198, orders: 231, experience: 4, avatar: 'QM', car: 'Ford Transit, серебристый', category: 'sto', diagnostics: 'диагностика', badge: 'Лучше записаться на ремонт', verified: true },
    { id: 'mikhail', name: 'Мастер Кар', rating: 4.7, eta: 12, distance: 3.4, price: 2800, reviews: 143, orders: 412, experience: 7, avatar: 'МК', car: 'Volkswagen Crafter, белый', category: 'sto', diagnostics: 'диагностика', badge: 'Можно доехать самостоятельно', verified: true },
    { id: 'igor', name: 'ШинСервис 24', rating: 4.7, eta: 8, distance: 1.6, price: 1800, reviews: 312, orders: 189, experience: 3, avatar: 'Ш', car: 'Mercedes Sprinter, черный', category: 'tire', diagnostics: 'выездной', badge: 'Приедем и поможем на месте', verified: true },
    { id: 'towone', name: 'Эвакуатор 24', rating: 4.8, eta: 11, distance: 2.4, price: 2900, reviews: 121, orders: 208, experience: 5, avatar: 'Э', car: 'MAN TGE, белый', category: 'tow', diagnostics: 'быстрая подача', badge: 'Подача эвакуатора рядом', verified: true },
    { id: 'roadhelp', name: 'Road Help', rating: 4.6, eta: 14, distance: 3.1, price: 1900, reviews: 88, orders: 144, experience: 4, avatar: 'RH', car: 'Ford Transit, черный', category: 'other', diagnostics: 'помощь на дороге', badge: 'Мастер рядом', verified: true }
];

function getMasters() {
    const stored = localStorage.getItem('katimMasterOffers');
    if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(master => ({
            ...defaultMasters.find(defaultMaster => defaultMaster.id === master.id),
            ...master
        }));
    }
    localStorage.setItem('katimMasterOffers', JSON.stringify(defaultMasters));
    return defaultMasters;
}

function getSelectedMaster() {
    const masters = getMasters();
    return masters.find(master => master.id === order.selectedMasterId) || masters[0];
}

function getStoredOrders() {
    const stored = localStorage.getItem('katimCustomerOrders');
    if (stored) return JSON.parse(stored);
    const seed = [
        { id: 123456, serviceTitle: 'Шиномонтаж выездной', status: 'completed', price: 1500, masterName: 'Алексей', masterRating: 4.9, customerRating: 5, date: '12 мая, 10:40', review: 'Быстро и аккуратно.' },
        { id: 123455, serviceTitle: 'Эвакуатор', status: 'completed', price: 2500, masterName: 'Михаил', masterRating: 4.9, customerRating: 5, date: '28 апр., 09:15', review: '' },
        { id: 123454, serviceTitle: 'Шиномонтаж выездной', status: 'cancelled', price: 2000, masterName: 'Игорь', masterRating: 4.7, date: '15 апр., 22:30', review: '' }
    ];
    localStorage.setItem('katimCustomerOrders', JSON.stringify(seed));
    return seed;
}

function saveCustomerOrder(status) {
const service = services[order.serviceKey];
const master = getSelectedMaster();
const orders = getStoredOrders().filter(item => item.id !== order.id);
orders.unshift({
id: order.id,
serviceTitle: service.title,
status,
price: master.price || service.price,
masterName: master.name,
masterRating: master.rating,
location: order.location,
car: 'Toyota Camry · Черный',
comment: order.comment,
customerRating: order.customerRating,
date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
review: order.review || ''
});
localStorage.setItem('katimCustomerOrders', JSON.stringify(orders));
}

const defaultExecutorOrders = [
{ id: 84215, status: 'new', serviceTitle: 'Запуск двигателя', address: 'ул. Ленина, 15, Москва', car: 'Toyota Camry · Черный', price: 1500, distance: 2.4, time: '3 мин назад', comment: 'Сел аккумулятор, не заводится', payment: 'Картой в приложении', clientName: 'Иван Петров' },
{ id: 84216, status: 'new', serviceTitle: 'Замена колеса', address: 'пр. Мира, 102', car: 'BMW X5 · Белый', price: 2000, distance: 4.1, time: '5 мин назад', comment: 'Пробито заднее колесо', payment: 'Картой в приложении', clientName: 'Мария Смирнова' },
{ id: 84217, status: 'new', serviceTitle: 'Эвакуатор', address: 'Кутузовский пр., 36', car: 'Audi A6 · Серый', price: 3500, distance: 6.3, time: '8 мин назад', comment: 'Авто не заводится после ДТП', payment: 'Картой в приложении', clientName: 'Олег Васильев' },
{ id: 84211, status: 'completed', serviceTitle: 'Шиномонтаж', address: 'ТТК, съезд 12', car: 'Kia Rio · Синий', price: 1800, distance: 3.0, time: 'сегодня 12:20', comment: 'Замена колеса', payment: 'Картой в приложении', clientName: 'Анна' }
];

function getExecutorOrders() {
const stored = localStorage.getItem('katimExecutorOrders');
if (stored) return JSON.parse(stored);
localStorage.setItem('katimExecutorOrders', JSON.stringify(defaultExecutorOrders));
return defaultExecutorOrders;
}

function setExecutorOrders(items) {
localStorage.setItem('katimExecutorOrders', JSON.stringify(items));
}

function publishCustomerOrderForExecutor() {
const service = services[order.serviceKey];
const items = getExecutorOrders().filter(item => item.customerOrderId !== order.id);
items.unshift({
id: order.id,
customerOrderId: order.id,
status: 'new',
serviceTitle: service.title,
address: order.location,
car: 'Toyota Camry · Черный',
price: service.price,
distance: 2.4,
time: 'только что',
comment: order.comment,
payment: 'Картой в приложении',
clientName: 'Иван Петров'
});
setExecutorOrders(items);
}

function renderExecutorOrders(filter = executorOrderFilter) {
executorOrderFilter = filter;
document.querySelectorAll('#screen-exec-orders .executor-tabs button').forEach(button => {
const text = button.textContent.trim();
button.classList.toggle('active',
(filter === 'new' && text === 'Новые') ||
(filter === 'active' && text === 'Активные') ||
(filter === 'completed' && text === 'Завершенные')
);
});
const list = document.getElementById('executor-orders-list');
if (!list) return;
const orders = getExecutorOrders().filter(item => item.status === filter);
list.innerHTML = orders.map(item => `
<div class="exec-card exec-order-card">
<div class="exec-order-top">
<span class="hist-status">${item.status === 'new' ? 'Новый' : item.status === 'active' ? 'В работе' : 'Завершен'}</span>
<span class="muted">${escapeHtml(item.time)}</span>
</div>
<h3>${escapeHtml(item.serviceTitle)}</h3>
<div class="muted">${escapeHtml(item.address)}</div>
<div class="exec-order-meta">
<span>${escapeHtml(item.car)}</span>
<span>${item.distance} км</span>
</div>
<div class="exec-row" style="margin-bottom:${item.status === 'new' ? '12px' : '0'};">
<span class="exec-price">${formatPrice(item.price)}</span>
<strong>${item.distance} км</strong>
</div>
${item.status === 'new' ? `
<div class="exec-actions">
<button class="exec-btn" onclick="declineExecutorOrder(${item.id})">Отклонить</button>
<button class="exec-btn gold" onclick="acceptExecutorOrder(${item.id})">Принять</button>
</div>
` : `<button class="exec-btn gold" style="width:100%; margin-top:12px;" onclick="openExecutorOrder(${item.id})">${item.status === 'active' ? 'Открыть заказ' : 'Детали'}</button>`}
</div>
`).join('') || '<div class="profile-empty-state">Заказов в этом разделе пока нет.</div>';
}

function openExecutorOrder(id) {
activeExecutorOrderId = String(id);
localStorage.setItem('katimActiveExecutorOrderId', activeExecutorOrderId);
updateExecutorActiveOrder();
showScreen('screen-exec-active');
}

function acceptExecutorOrder(id) {
const items = getExecutorOrders().map(item => item.id === id ? { ...item, status: 'active', time: 'в работе' } : item);
setExecutorOrders(items);
activeExecutorOrderId = String(id);
localStorage.setItem('katimActiveExecutorOrderId', activeExecutorOrderId);
const accepted = items.find(item => item.id === id);
if (accepted && accepted.customerOrderId) {
const customerOrders = getStoredOrders().map(item => item.id === accepted.customerOrderId ? { ...item, status: 'active', masterName: 'Александр', masterRating: 4.9 } : item);
localStorage.setItem('katimCustomerOrders', JSON.stringify(customerOrders));
}
updateExecutorActiveOrder();
showScreen('screen-exec-active');
}

function declineExecutorOrder(id) {
setExecutorOrders(getExecutorOrders().filter(item => item.id !== id));
renderExecutorOrders('new');
}

function updateExecutorActiveOrder() {
const active = getExecutorOrders().find(item => String(item.id) === String(activeExecutorOrderId)) || getExecutorOrders().find(item => item.status === 'active') || getExecutorOrders()[0];
if (!active) return;
activeExecutorOrderId = String(active.id);
const pairs = {
'exec-active-id': `ID: #${active.id}`,
'exec-active-service': active.serviceTitle,
'exec-active-address': active.address,
'exec-active-car': active.car,
'exec-active-price': formatPrice(active.price),
'exec-active-comment': active.comment,
'exec-client-name': active.clientName
};
Object.entries(pairs).forEach(([id, value]) => {
const node = document.getElementById(id);
if (node) node.textContent = value;
});
}

function executorArrived() {
const status = document.querySelector('#screen-exec-active .status-chip');
if (status) status.textContent = 'На месте';
}

function completeExecutorOrder() {
const items = getExecutorOrders().map(item => String(item.id) === String(activeExecutorOrderId) ? { ...item, status: 'completed', time: 'только что' } : item);
setExecutorOrders(items);
const completed = items.find(item => String(item.id) === String(activeExecutorOrderId));
if (completed && completed.customerOrderId) {
const customerOrders = getStoredOrders().map(item => item.id === completed.customerOrderId ? { ...item, status: 'completed' } : item);
localStorage.setItem('katimCustomerOrders', JSON.stringify(customerOrders));
}
renderExecutorOrders('completed');
showScreen('screen-exec-orders');
}

function switchRole(role) {
localStorage.setItem('katimRole', role);
showScreen(role === 'executor' ? 'screen-exec-home' : 'screen-home');
}

function callActiveMaster() {
    const tel = '+79991234567';
    window.location.href = 'tel:' + tel;
    if (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        showKatimToast('Наберите ' + tel);
    }
}

function showKatimToast(message) {
    let toast = document.getElementById('katim-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'katim-toast';
        toast.style.cssText = 'position:absolute;left:50%;bottom:100px;transform:translateX(-50%);padding:12px 16px;border-radius:12px;background:rgba(20,22,24,0.95);color:#fff;font-size:13px;z-index:200;max-width:280px;text-align:center;pointer-events:none;opacity:0;transition:opacity 0.2s;';
        document.getElementById('app-container').appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(window.katimToastTimer);
    window.katimToastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

function setExecIncomePeriod(period) {
    document.querySelectorAll('#screen-exec-income .executor-tabs button').forEach(button => {
        button.classList.toggle('active', button.dataset.incomePeriod === period);
    });
}

function initFixedClicks() {
    const paymentEdit = document.getElementById('payment-step-edit');
    if (paymentEdit) {
        paymentEdit.addEventListener('click', (event) => {
            event.preventDefault();
            showScreen('screen-payments');
        });
    }

    const callMasterBtn = document.getElementById('call-master-btn');
    if (callMasterBtn) {
        callMasterBtn.addEventListener('click', (event) => {
            event.preventDefault();
            callActiveMaster();
        });
    }

    document.querySelectorAll('#exec-income-tabs [data-income-period]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            setExecIncomePeriod(button.dataset.incomePeriod);
        });
    });
}

function openChat(backTarget) {
chatBackTarget = backTarget;
showScreen('screen-chat');
}

function goChatBack() {
showScreen(chatBackTarget || 'screen-active-order');
}

function formatPrice(value) {
    return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function updateOrderView() {
    const service = services[order.serviceKey];
    const locationInput = document.getElementById('location-input');
    const commentInput = document.getElementById('comment-input');
    if (locationInput) order.location = locationInput.value.trim() || order.location;
    if (commentInput) order.comment = commentInput.value.trim() || order.comment;

    document.getElementById('order-service').innerHTML = `${service.title}<br/>${service.detail}`;
    document.getElementById('order-location').innerHTML = `${escapeHtml(order.location)}<br/>(уточнено)`;
    document.getElementById('order-comment').innerHTML = escapeHtml(order.comment).replace(/\.\s*/, '<br/>');
    document.getElementById('order-price').textContent = formatPrice(service.price);
    document.getElementById('order-eta').textContent = `Время прибытия от ${service.eta} мин`;
    document.getElementById('order-id-preview').textContent = `№${order.id}`;
    const master = getSelectedMaster();
    document.getElementById('master-name').textContent = master.name;
    document.getElementById('active-master-rating').innerHTML = `<i class="fas fa-star"></i> ${master.rating} (${master.reviews})`;
    document.getElementById('active-eta').textContent = `${master.eta} мин`;
    document.getElementById('master-service').textContent = service.masterService;
    const activeAvatar = document.getElementById('active-master-avatar');
    const activeCar = document.getElementById('active-master-car');
    const activePrice = document.getElementById('active-price');
    const activeLocation = document.getElementById('active-location');
    const activeOrderLabel = document.getElementById('active-order-label');
    const activeStatus = document.getElementById('active-status');
    if (activeAvatar) activeAvatar.textContent = master.avatar;
    if (activeCar) activeCar.textContent = master.car || 'Peugeot Boxer, белый';
    if (activePrice) activePrice.textContent = formatPrice(master.price || service.price);
    if (activeLocation) activeLocation.textContent = order.location;
    if (activeOrderLabel) activeOrderLabel.textContent = service.detail;
    if (activeStatus) activeStatus.textContent = order.status === 'active' ? 'В пути' : 'Ожидание';
    document.getElementById('completed-title').textContent = `Заказ №${order.id} успешно завершен`;
    document.getElementById('completed-price').textContent = formatPrice(master.price || service.price);
    const completedMaster = document.getElementById('completed-master');
    const completedMasterRating = document.getElementById('completed-master-rating');
    if (completedMaster) completedMaster.textContent = master.name;
    if (completedMasterRating) completedMasterRating.innerHTML = `<i class="fas fa-star" style="color:#FFCC00;"></i> ${master.rating}`;
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.service === order.serviceKey);
    });
}

function showScreen(screenId) {
updateOrderView();
if (screenId === 'screen-history') renderHistory('all');
if (screenId === 'screen-exec-orders') renderExecutorOrders(executorOrderFilter);
if (screenId === 'screen-exec-active') updateExecutorActiveOrder();
document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
const target = document.getElementById(screenId);
if (target) target.classList.add('active');

const nav = document.getElementById('global-nav');
const executorNav = document.getElementById('executor-nav');
const isExecutorScreen = screenId.startsWith('screen-exec');
const noNavScreens = ['screen-onboarding', 'screen-order-create', 'screen-search', 'screen-active-order', 'screen-chat', 'screen-execution', 'screen-completed'];
nav.classList.toggle('hidden', isExecutorScreen || noNavScreens.includes(screenId));
executorNav.classList.toggle('hidden', !isExecutorScreen);

nav.querySelectorAll('.nav-item').forEach(item => {
item.classList.remove('active');
const profileScreens = ['screen-profile', 'screen-cars', 'screen-payments', 'screen-favorites', 'screen-support', 'screen-settings'];
if (screenId === 'screen-home' && item.innerText.includes('Главная')) item.classList.add('active');
if (screenId === 'screen-history' && item.innerText.includes('Заказы')) item.classList.add('active');
if (screenId === 'screen-chat' && item.innerText.includes('Чат')) item.classList.add('active');
if (profileScreens.includes(screenId) && item.innerText.includes('Профиль')) item.classList.add('active');
});
executorNav.querySelectorAll('.nav-item').forEach(item => {
item.classList.remove('active');
const profileScreens = ['screen-exec-profile', 'screen-exec-docs'];
if (screenId === 'screen-exec-home' && item.innerText.includes('Главная')) item.classList.add('active');
if (['screen-exec-orders', 'screen-exec-active'].includes(screenId) && item.innerText.includes('Заказы')) item.classList.add('active');
if (profileScreens.includes(screenId) && item.innerText.includes('Профиль')) item.classList.add('active');
});
}

function selectService(serviceKey) {
    order.serviceKey = serviceKey;
    order.status = 'draft';
    updateOrderView();
    showScreen('screen-order-create');
}

function focusField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.focus();
        field.select();
    }
}

function startSearch() {
order.status = 'searching';
order.selectedMasterId = null;
executorFilter = serviceToFilter(order.serviceKey);
publishCustomerOrderForExecutor();
updateOrderView();
renderMasterOffers();
showScreen('screen-search');
    clearTimeout(window.searchTimer);
}

function serviceToFilter(serviceKey) {
    if (serviceKey === 'other') return 'sto';
    if (serviceKey === 'tire') return 'tire';
    if (serviceKey === 'tow') return 'tow';
    return 'all';
}

function setExecutorFilter(filter) {
    executorFilter = filter;
    renderMasterOffers();
}

function renderMasterOffers() {
    const list = document.getElementById('master-offers');
    if (!list) return;
    const title = document.getElementById('executor-title');
    if (title) title.textContent = services[order.serviceKey].title;
    document.querySelectorAll('.executor-filter-btn').forEach(button => {
        const text = button.textContent.trim();
        button.classList.toggle('active',
            (executorFilter === 'all' && text.startsWith('Все')) ||
            (executorFilter === 'sto' && text.startsWith('СТО')) ||
            (executorFilter === 'tire' && text.startsWith('Шиномонтаж')) ||
            (executorFilter === 'tow' && text.startsWith('Эвакуаторы')) ||
            (executorFilter === 'other' && text.startsWith('Другие'))
        );
    });
    const masters = getMasters()
        .filter(master => executorFilter === 'all' || master.category === executorFilter)
        .filter(master => {
            if (order.serviceKey === 'other') return ['sto', 'other'].includes(master.category);
            if (order.serviceKey === 'tire') return ['tire', 'sto'].includes(master.category);
            if (order.serviceKey === 'tow') return ['tow', 'other'].includes(master.category);
            if (order.serviceKey === 'battery') return ['other', 'sto'].includes(master.category);
            return true;
        });
    list.innerHTML = masters.map(master => `
        <div class="offer-card">
            <div class="offer-avatar">${master.avatar}</div>
            <div class="offer-main">
                <h4>${master.name}${master.verified ? '<span style="color:#2997ff; margin-left:5px;"><i class="fas fa-check-circle"></i></span>' : ''}<span class="offer-rating"><i class="fas fa-star"></i>${master.rating}</span></h4>
                <div class="offer-meta">
                    <span><i class="far fa-clock"></i> ${master.eta} мин до вас</span>
                    <span>${master.distance} км</span>
                    <span><i class="far fa-comment-dots"></i> ${master.reviews}</span>
                    <span>${master.diagnostics}</span>
                </div>
                <div style="margin-top:7px; color:#8bdc57; font-size:11px;">${master.badge}</div>
            </div>
            <div class="offer-side">
                <strong>от ${formatPrice(master.price)}</strong>
                <button class="btn choose-master-btn" onclick="chooseMaster('${master.id}')">Выбрать</button>
            </div>
        </div>
    `).join('') || '<div class="profile-empty-state">Подходящих предложений пока нет.</div>';
}

function chooseMaster(masterId) {
    order.selectedMasterId = masterId;
    order.status = 'active';
    localStorage.setItem('katimSelectedMaster', masterId);
    saveCustomerOrder('active');
    updateOrderView();
    showScreen('screen-active-order');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const messages = document.getElementById('chat-messages');
    messages.insertAdjacentHTML('beforeend', `
        <div class="message msg-user">
            ${escapeHtml(text)}
            <span class="msg-time">${time} <i class="fas fa-check-double"></i></span>
        </div>
    `);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

function completeOrder() {
    order.status = 'completed';
    saveCustomerOrder('completed');
    showScreen('screen-completed');
}

function finishOnboarding() {
    localStorage.setItem('katimSeen', '1');
    showScreen('screen-home');
}

function cancelOrder() {
    order.status = 'cancelled';
    saveCustomerOrder('cancelled');
showScreen(localStorage.getItem('katimRole') === 'executor' ? 'screen-exec-home' : 'screen-home');
}

function setOrderRating(value) {
    order.customerRating = value;
    document.querySelectorAll('.rating-btn').forEach((button, index) => {
        button.classList.toggle('active', index < value);
    });
}

function submitReviewAndFinish() {
    const reviewInput = document.getElementById('review-input');
    order.review = reviewInput ? reviewInput.value.trim() : '';
    saveCustomerOrder('completed');
    showScreen('screen-home');
}

function renderHistory(filter = 'all') {
    const list = document.getElementById('history-list');
    if (!list) return;
    document.querySelectorAll('#screen-history .tab').forEach(tab => {
        const text = tab.textContent.trim();
        tab.classList.toggle('active',
            (filter === 'all' && text === 'Все') ||
            (filter === 'active' && text === 'Активные') ||
            (filter === 'completed' && text === 'Завершенные') ||
            (filter === 'cancelled' && text === 'Отмененные')
        );
    });
    const statusLabels = { active: 'Активен', completed: 'Завершен', cancelled: 'Отменен' };
    const orders = getStoredOrders().filter(item => filter === 'all' || item.status === filter);
    if (!orders.length) {
        list.innerHTML = '<div class="profile-empty-state">Заказов в этом разделе пока нет.</div>';
        return;
    }
    list.innerHTML = orders.map(item => `
        <div class="history-card">
            <div class="hist-top">
                <span class="hist-date">${escapeHtml(item.date)}</span>
                <span class="hist-status ${item.status === 'cancelled' ? 'cancelled' : ''}">${statusLabels[item.status]}</span>
            </div>
            <div class="hist-title">${escapeHtml(item.serviceTitle)}</div>
            <div style="color: var(--text-gray); font-size: 12px; margin-bottom: 8px;">Мастер: ${escapeHtml(item.masterName)} · <i class="fas fa-star" style="color:#FFCC00;"></i> ${item.masterRating}</div>
            <div class="hist-bottom">
                <span class="hist-price">${formatPrice(item.price)}</span>
                ${item.status === 'completed' ? `<span class="hist-rating"><i class="fas fa-star"></i> ${item.customerRating || 5}.0</span>` : ''}
            </div>
            ${item.review ? `<div style="color: var(--text-gray); font-size: 12px; margin-top: 10px;">${escapeHtml(item.review)}</div>` : ''}
        </div>
    `).join('');
}

document.getElementById('chat-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') sendMessage();
});

document.getElementById('location-input').addEventListener('input', updateOrderView);
document.getElementById('comment-input').addEventListener('input', updateOrderView);

initFixedClicks();

if (!localStorage.getItem('katimSeen')) {
    showScreen('screen-onboarding');
} else if (localStorage.getItem('katimRole') === 'executor') {
    showScreen('screen-exec-home');
} else {
    showScreen('screen-home');
}
