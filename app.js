/* ═══════════════════════════════════════════════════
   TRAVEL EXPLORER — Frontend Application
════════════════════════════════════════════════════ */

const API_BASE = 
//"http://localhost:3000";
"https://mytravel-explorer-api-hmb2daezgtevaegu.australiaeast-01.azurewebsites.net";

const TRAVEL_AGENT_API_BASE = "https://travel-explorer-api.azure-api.net/api"

let allTrips = [];
let allExpenses = [];
let currentTripId = null;
let currentView = 'dashboard';

const CATEGORY_META = {
  accommodation: { icon: '🏨', label: 'Accommodation', color: '#3b82f6' },
  flights:       { icon: '✈️', label: 'Flights',       color: '#0ea5e9' },
  food:          { icon: '🍜', label: 'Food & Drink',  color: '#f59e0b' },
  transport:     { icon: '🚗', label: 'Transport',     color: '#22c55e' },
  shopping:      { icon: '🛍', label: 'Shopping',      color: '#a855f7' },
  activities:    { icon: '🎯', label: 'Activities',    color: '#f97316' },
  health:        { icon: '💊', label: 'Health',        color: '#ef4444' },
  communication: { icon: '📱', label: 'Communication', color: '#06b6d4' },
  visa:          { icon: '🛂', label: 'Visa & Fees',   color: '#64748b' },
  insurance:     { icon: '🛡', label: 'Insurance',     color: '#16a34a' },
  other:         { icon: '📦', label: 'Other',         color: '#9ca3af' },
};

const CHART_COLORS = ['#c8522a','#d4a843','#2a7a6e','#4a8fb5','#7a5a9e','#e8705a','#5a9e6e','#f59e0b','#06b6d4','#a855f7'];

// ── Loader utilities ─────────────────────────────────────────────────────────

// Page-level loader (full screen on boot)
const loaderMessages = [
  'Loading your trips…',
  'Fetching expenses…',
  'Crunching the numbers…',
  'Almost there…',
];
let loaderMsgIdx = 0;
let loaderMsgInterval = null;

function showPageLoader() {
  const el = document.getElementById('pageLoader');
  if (el) el.classList.remove('hidden');
  // Cycle through witty messages while loading
  loaderMsgInterval = setInterval(() => {
    loaderMsgIdx = (loaderMsgIdx + 1) % loaderMessages.length;
    const sub = document.getElementById('loaderSub');
    if (sub) {
      sub.style.opacity = '0';
      setTimeout(() => {
        sub.textContent = loaderMessages[loaderMsgIdx];
        sub.style.opacity = '1';
      }, 200);
    }
  }, 1200);
}

function hidePageLoader() {
  clearInterval(loaderMsgInterval);
  const el = document.getElementById('pageLoader');
  if (el) el.classList.add('hidden');
}

// Button spinner — wraps any button while its async action runs
// Usage: const stop = startBtnLoading(btn, 'Saving…'); await doWork(); stop();
function startBtnLoading(btn, label = '') {
  if (!btn) return () => {};
  const original = btn.innerHTML;
  btn.innerHTML = label
    ? `<span class="btn-text">${label}</span>`
    : `<span class="btn-text">${original}</span>`;
  btn.classList.add('btn-loading');
  btn.disabled = true;
  return () => {
    btn.innerHTML = original;
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  };
}

// Inline section spinner — replaces a container's content while loading
function showSectionLoader(containerId, message = 'Loading…') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="section-loader">
      <div class="section-loader-ring"></div>
      <div class="section-loader-text">${message}</div>
    </div>`;
}

// Remove skeleton shimmer from stat values once real data arrives
function clearStatSkeletons() {
  ['stat-trips','stat-budget','stat-spent','stat-remaining'].forEach(id => {
    document.getElementById(id)?.classList.remove('skeleton-val');
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  showPageLoader();
  await loadTrips();
  checkHealth();
  hidePageLoader();
});

async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/health`);
    const d = await r.json();
    const dot = document.querySelector('.db-dot');
    const label = document.querySelector('.db-status');
    if (d.status === 'ok') {
      label.innerHTML = `<span class="db-dot"></span> ${d.dbType}`;
    }
  } catch {}
}

// ── Navigation ────────────────────────────────────────────────────────────────
function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.remove('hidden');
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
  currentView = view;

  if (view === 'expenses') renderExpenses();
  if (view === 'analytics') populateAnalyticsTripSelect();
  if (view === 'trips') renderTripsTable();

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Trip Loading ──────────────────────────────────────────────────────────────
async function loadTrips() {
  try {
    const r = await fetch(`${API_BASE}/trips`);
    const d = await r.json();
    allTrips = d.data || [];
    renderDashboard();
    populateTripSelects();
    if (currentView === 'trips') renderTripsTable();
  } catch (err) {
    showToast('Failed to load trips', 'error');
  }
}

function populateTripSelects() {
  const opts = allTrips.map(t =>
    `<option value="${t._id}">${t.name} — ${t.destination}</option>`
  ).join('');
  const placeholder = '<option value="">— Select a trip —</option>';
  document.getElementById('globalTripSelect').innerHTML = placeholder + opts;
  if (currentTripId) document.getElementById('globalTripSelect').value = currentTripId;

  const expSel = document.getElementById('expenseTripSelect');
  if (expSel) {
    expSel.innerHTML = placeholder + opts;
    if (currentTripId) expSel.value = currentTripId;
  }

  populateAnalyticsTripSelect();
}

function onTripSelect(id) {
  currentTripId = id;
  if (currentView === 'expenses') renderExpenses();
  if (currentView === 'analytics') loadAnalytics(id);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function renderDashboard() {
  // Stat cards
  document.getElementById('stat-trips').textContent = allTrips.length;
  clearStatSkeletons();

  let totalBudget = 0, totalSpent = 0;

  // Load summary for each trip
  const summaries = await Promise.allSettled(
    allTrips.map(t => fetch(`${API_BASE}/expenses/summary/${t._id}`).then(r => r.json()))
  );

  summaries.forEach((res, i) => {
    if (res.status === 'fulfilled' && res.value.success) {
      const s = res.value.data;
      totalBudget += s.budget || 0;
      totalSpent  += s.totalSpent || 0;
      allTrips[i]._spent = s.totalSpent || 0;
      allTrips[i]._summary = s;
    }
  });

  const remaining = totalBudget - totalSpent;
  const curr = allTrips[0]?.currency || 'USD';
  document.getElementById('stat-budget').textContent    = fmt(totalBudget, curr);
  document.getElementById('stat-spent').textContent     = fmt(totalSpent, curr);
  document.getElementById('stat-remaining').textContent = fmt(remaining, curr);

  // Trip grid
  const grid = document.getElementById('tripGrid');
  if (allTrips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌍</div>
        <p>No trips yet. Start your first adventure!</p>
        <button class="btn btn-primary" onclick="openModal('tripModal')">+ Add a Trip</button>
      </div>`;
    return;
  }

  grid.innerHTML = allTrips.map(trip => {
    const spent   = trip._spent || 0;
    const budget  = trip.budget || 0;
    const pct     = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const over    = spent > budget && budget > 0;
    const startD  = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
    const endD    = trip.endDate   ? new Date(trip.endDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '';
    return `
    <div class="trip-card" onclick="selectTripFromCard('${trip._id}')">
      <div class="trip-card-name">${esc(trip.name)}</div>
      <div class="trip-card-dest">📍 ${esc(trip.destination)}</div>
      ${startD ? `<div class="trip-card-dates">${startD} → ${endD || '…'}</div>` : ''}
      <div class="trip-card-budget">
        <span class="trip-card-budget-label">Spent / Budget</span>
        <span class="trip-card-budget-val">${fmt(spent, trip.currency)} <span style="opacity:.4;font-size:13px">/ ${fmt(budget, trip.currency)}</span></span>
      </div>
      <div class="mini-bar-track">
        <div class="mini-bar-fill ${over ? 'over' : ''}" style="width:${pct}%"></div>
      </div>
      <div class="trip-card-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-ghost" onclick="editTrip('${trip._id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-ghost" onclick="confirmDeleteTrip('${trip._id}')">🗑 Delete</button>
        <button class="btn btn-sm btn-teal" onclick="selectTripFromCard('${trip._id}')">View →</button>
      </div>
    </div>`;
  }).join('');
}

function selectTripFromCard(id) {
  currentTripId = id;
  document.getElementById('globalTripSelect').value = id;
  switchView('expenses');
}

// ── Trips Table ───────────────────────────────────────────────────────────────
async function renderTripsTable() {
  const tbody     = document.getElementById('tripsTableBody');
  const mobileList = document.getElementById('tripsMobileList');

  if (allTrips.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No trips found. Create one!</td></tr>`;
    mobileList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧳</div>
        <p>No trips yet. Add your first one!</p>
        <button class="btn btn-primary" onclick="openModal('tripModal')">+ New Trip</button>
      </div>`;
    return;
  }

  // Load summaries if needed
  const rows = await Promise.all(allTrips.map(async trip => {
    let spent = trip._spent;
    if (spent === undefined) {
      try {
        const r = await fetch(`${API_BASE}/expenses/summary/${trip._id}`);
        const d = await r.json();
        spent = d.success ? d.data.totalSpent : 0;
        trip._spent = spent;
      } catch { spent = 0; }
    }
    const budget = trip.budget || 0;
    const over   = spent > budget && budget > 0;
    const nearly = !over && budget > 0 && spent / budget >= 0.8;
    const badgeClass = over ? 'badge-over' : nearly ? 'badge-warn' : 'badge-ok';
    const badgeText  = over ? 'Over budget' : nearly ? 'Nearly there' : 'On track';
    const startD = trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—';
    const endD   = trip.endDate   ? new Date(trip.endDate).toLocaleDateString()   : '—';
    const curr   = trip.currency || 'USD';

    // ── Desktop table row ──────────────────────────────────────────────────
    const tableRow = `
      <tr>
        <td><strong>${esc(trip.name)}</strong></td>
        <td>📍 ${esc(trip.destination)}</td>
        <td><span class="mono" style="font-size:12px">${startD} → ${endD}</span></td>
        <td>${curr}</td>
        <td class="mono">${fmt(budget, curr)}</td>
        <td class="mono" style="color:var(--rust)">${fmt(spent, curr)}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-ghost" onclick="editTrip('${trip._id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteTrip('${trip._id}')">Delete</button>
          </div>
        </td>
      </tr>`;

    // ── Mobile card ────────────────────────────────────────────────────────
    const mobileCard = `
      <div class="trip-mobile-card">
        <div class="tmc-header">
          <div>
            <div class="tmc-name">${esc(trip.name)}</div>
            <div class="tmc-dest">📍 ${esc(trip.destination)}</div>
          </div>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="tmc-row">
          <span class="tmc-lbl">Dates</span>
          <span class="tmc-val">${startD} → ${endD}</span>
        </div>
        <div class="tmc-row">
          <span class="tmc-lbl">Budget</span>
          <span class="tmc-val">${fmt(budget, curr)}</span>
        </div>
        <div class="tmc-row">
          <span class="tmc-lbl">Spent</span>
          <span class="tmc-val" style="color:var(--rust)">${fmt(spent, curr)}</span>
        </div>
        <div class="tmc-row" style="border-bottom:none">
          <span class="tmc-lbl">Remaining</span>
          <span class="tmc-val" style="color:${over ? '#e03a2e' : 'var(--teal)'}">
            ${fmt(Math.abs(budget - spent), curr)} ${over ? 'over' : 'left'}
          </span>
        </div>
        <div class="tmc-actions">
          <button class="btn btn-sm btn-ghost" onclick="editTrip('${trip._id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteTrip('${trip._id}')">🗑 Delete</button>
        </div>
      </div>`;

    return { tableRow, mobileCard };
  }));

  tbody.innerHTML    = rows.map(r => r.tableRow).join('');
  mobileList.innerHTML = rows.map(r => r.mobileCard).join('');
}

// ── Expenses ──────────────────────────────────────────────────────────────────
async function renderExpenses() {
  if (!currentTripId) {
    document.getElementById('budgetBarWrap').style.display = 'none';
    document.getElementById('expensesList').innerHTML = `
      <div class="empty-state"><div class="empty-icon">💳</div><p>Select a trip first.</p></div>`;
    return;
  }

  // Show skeleton rows while fetching
  document.getElementById('expensesList').innerHTML = [1,2,3].map(() => `
    <div class="expense-item skeleton-card">
      <div class="expense-cat-icon skeleton-block"></div>
      <div class="expense-info">
        <div class="skeleton-block sk-line"></div>
        <div class="skeleton-block sk-line sk-short" style="margin-top:6px"></div>
      </div>
      <div class="expense-amount"><div class="skeleton-block sk-short"></div></div>
    </div>`).join('');

  try {
    const [expR, sumR] = await Promise.all([
      fetch(`${API_BASE}/expenses?tripId=${currentTripId}`).then(r => r.json()),
      fetch(`${API_BASE}/expenses/summary/${currentTripId}`).then(r => r.json()),
    ]);
    allExpenses = expR.data || [];
    const sum = sumR.data;

    const expSel = document.getElementById('expenseTripSelect');
    if (expSel) expSel.value = currentTripId;

    document.getElementById('budgetBarWrap').style.display = 'block';

    const pct  = sum.percentUsed || 0;
    const fill = document.getElementById('budgetBarFill');
    fill.style.width = Math.min(pct, 100) + '%';
    fill.className = 'budget-bar-fill' + (pct >= 100 ? ' danger' : '');
    document.getElementById('budgetPct').textContent = pct + '%';
    document.getElementById('budgetRemLabel').innerHTML =
      `Remaining: <strong>${fmt(sum.remaining, sum.currency)}</strong>`;

    filterExpenses();
  } catch (err) {
    showToast('Failed to load expenses', 'error');
  }
}

function filterExpenses() {
  const catF  = document.getElementById('filterCategory').value;
  const payF  = document.getElementById('filterPayment').value;
  const srchF = document.getElementById('filterSearch').value.toLowerCase();

  let list = [...allExpenses];
  if (catF)  list = list.filter(e => e.category === catF);
  if (payF)  list = list.filter(e => e.paymentMethod === payF);
  if (srchF) list = list.filter(e =>
    (e.description || '').toLowerCase().includes(srchF) ||
    (e.notes || '').toLowerCase().includes(srchF)
  );

  const container = document.getElementById('expensesList');
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state"><div class="empty-icon">🔍</div>
      <p>No expenses found. ${allExpenses.length === 0 ? 'Add your first expense!' : 'Try adjusting filters.'}</p>
      </div>`;
    return;
  }

  const trip = allTrips.find(t => t._id === currentTripId);
  const currency = trip?.currency || 'USD';

  container.innerHTML = list.map(e => {
    const meta = CATEGORY_META[e.category] || CATEGORY_META.other;
    const dateStr = e.date ? new Date(e.date).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
    return `
    <div class="expense-item">
      <div class="expense-cat-icon cat-${e.category}">${meta.icon}</div>
      <div class="expense-info">
        <div class="expense-desc">${esc(e.description || meta.label)}</div>
        <div class="expense-meta">
          <span>${meta.label}</span>
          ${dateStr ? `<span>📅 ${dateStr}</span>` : ''}
          <span>${paymentIcon(e.paymentMethod)} ${capitalize(e.paymentMethod)}</span>
          ${e.notes ? `<span>💬 ${esc(e.notes)}</span>` : ''}
        </div>
      </div>
      <div class="expense-amount">${fmt(e.amount, currency)}</div>
      <div class="expense-actions">
        <button class="btn btn-sm btn-ghost" onclick="editExpense('${e._id}')">✏️</button>
        <button class="btn btn-sm btn-ghost" onclick="confirmDeleteExpense('${e._id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function populateAnalyticsTripSelect() {
  const sel = document.getElementById('analyticsTripSelect');
  const opts = allTrips.map(t =>
    `<option value="${t._id}" ${t._id === currentTripId ? 'selected' : ''}>${t.name} — ${t.destination}</option>`
  ).join('');
  sel.innerHTML = '<option value="">— Select a trip —</option>' + opts;
  if (currentTripId) {
    sel.value = currentTripId;
    loadAnalytics(currentTripId);
  }
}

async function loadAnalytics(tripId) {
  if (!tripId) {
    document.getElementById('analyticsContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>Select a trip to view spending analytics.</p>
      </div>`;
    return;
  }
  currentTripId = tripId;
  showSectionLoader('analyticsContent', 'Crunching your numbers…');
  try {
    const r = await fetch(`${API_BASE}/expenses/summary/${tripId}`);
    const d = await r.json();
    if (!d.success) return;
    renderAnalytics(d.data);
  } catch {
    showToast('Failed to load analytics', 'error');
  }
}

function renderAnalytics(data) {
  const { trip, totalSpent, budget, remaining, percentUsed, expenseCount,
          categoryBreakdown, dailyBreakdown, highestExpense, currency } = data;

  const cats = Object.entries(categoryBreakdown).sort((a,b) => b[1].total - a[1].total);
  const colorMap = {};
  cats.forEach(([cat], i) => colorMap[cat] = CHART_COLORS[i % CHART_COLORS.length]);

  // Donut chart SVG
  const donut = buildDonut(cats, colorMap, currency);

  // Bar chart
  const bars = cats.map(([cat, info], i) => {
    const pct = info.percentage;
    const color = colorMap[cat];
    const meta = CATEGORY_META[cat] || CATEGORY_META.other;
    return `
      <div class="bar-row">
        <div class="bar-label">${meta.icon} ${meta.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}">
            ${pct > 8 ? pct + '%' : ''}
          </div>
        </div>
        <div class="bar-val">${fmt(info.total, currency)}</div>
      </div>`;
  }).join('');

  // Daily breakdown
  const days = Object.entries(dailyBreakdown).sort((a,b) => a[0].localeCompare(b[0]));
  const maxDay = Math.max(...days.map(d => d[1]), 1);
  const dailyBars = days.map(([day, amt]) => {
    const pct = (amt / maxDay) * 100;
    const datePart = day.split('T')[0];
    const [year, month, date] = datePart.split('-').map(Number);
    const d = new Date(year, month - 1, date);
    const dateLabel = (year && month && date && !isNaN(d))
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : datePart;
    return `
      <div class="bar-row">
        <div class="bar-label" style="width:80px;font-size:11px">${dateLabel}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:var(--teal)">
            ${pct > 10 ? fmt(amt, currency) : ''}
          </div>
        </div>
        <div class="bar-val">${fmt(amt, currency)}</div>
      </div>`;
  }).join('');

  document.getElementById('analyticsContent').innerHTML = `
    <div class="analytics-grid">

      <!-- Summary -->
      <div class="analytics-card full-width">
        <div class="analytics-card-title">Trip Summary — ${esc(trip.name)}</div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-val">${fmt(totalSpent, currency)}</div>
            <div class="summary-lbl">Total Spent</div>
          </div>
          <div class="summary-item">
            <div class="summary-val">${fmt(budget, currency)}</div>
            <div class="summary-lbl">Budget</div>
          </div>
          <div class="summary-item">
            <div class="summary-val" style="color:${remaining < 0 ? '#e03a2e' : 'var(--teal)'}">
              ${fmt(Math.abs(remaining), currency)} ${remaining < 0 ? 'over' : 'left'}
            </div>
            <div class="summary-lbl">Remaining</div>
          </div>
        </div>
        <div style="margin-top:16px">
          <div class="budget-bar-label">
            <span>Budget Used: <strong>${percentUsed}%</strong></span>
            <span>${expenseCount} expense${expenseCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="budget-bar-track">
            <div class="budget-bar-fill ${percentUsed >= 100 ? 'danger' : ''}"
                 style="width:${Math.min(percentUsed, 100)}%"></div>
          </div>
        </div>
      </div>

      <!-- Donut Chart -->
      <div class="analytics-card">
        <div class="analytics-card-title">Spending by Category</div>
        ${cats.length > 0 ? `
        <div class="donut-wrap">
          ${donut}
          <div class="donut-legend">
            ${cats.map(([cat, info]) => `
              <div class="legend-item">
                <div class="legend-dot" style="background:${colorMap[cat]}"></div>
                <div class="legend-name">${CATEGORY_META[cat]?.label || cat}</div>
                <div class="legend-pct">${info.percentage}%</div>
                <div class="legend-amount">${fmt(info.total, currency)}</div>
              </div>`).join('')}
          </div>
        </div>` : '<p style="opacity:.5">No expenses yet.</p>'}
      </div>

      <!-- Bar Chart -->
      <div class="analytics-card">
        <div class="analytics-card-title">Category Breakdown</div>
        ${cats.length > 0
          ? `<div class="bar-chart">${bars}</div>`
          : '<p style="opacity:.5">No expenses yet.</p>'}
      </div>

      <!-- Daily Spend -->
      <div class="analytics-card full-width">
        <div class="analytics-card-title">Daily Spending</div>
        ${days.length > 0
          ? `<div class="bar-chart">${dailyBars}</div>`
          : '<p style="opacity:.5">No daily data yet.</p>'}
      </div>

      ${highestExpense ? `
      <!-- Highest Expense -->
      <div class="analytics-card">
        <div class="analytics-card-title">Highest Single Expense</div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:8px">
          <div style="font-size:40px">${CATEGORY_META[highestExpense.category]?.icon || '💸'}</div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">
              ${fmt(highestExpense.amount, currency)}
            </div>
            <div style="opacity:.6;font-size:13px;margin-top:4px">
              ${esc(highestExpense.description || highestExpense.category)}
            </div>
          </div>
        </div>
      </div>` : ''}

    </div>`;
}

function buildDonut(cats, colorMap, currency) {
  if (cats.length === 0) return '';
  const size = 180;
  const cx = size / 2, cy = size / 2;
  const R = 70, r = 42;
  let total = cats.reduce((s, [,v]) => s + v.total, 0);
  let startAngle = -Math.PI / 2;
  let paths = '';

  cats.forEach(([cat, info]) => {
    const sweep = (info.total / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const xi1 = cx + r * Math.cos(startAngle);
    const yi1 = cy + r * Math.sin(startAngle);
    const xi2 = cx + r * Math.cos(endAngle);
    const yi2 = cy + r * Math.sin(endAngle);
    const large = sweep > Math.PI ? 1 : 0;
    paths += `<path d="M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}
      L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z"
      fill="${colorMap[cat]}" opacity="0.9" />`;
    startAngle = endAngle;
  });

  return `
    <svg class="donut-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${paths}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle"
        font-family="'Playfair Display',serif" font-size="15" font-weight="700" fill="#1a1410">
        ${fmt(total, currency)}
      </text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle"
        font-family="'DM Sans',sans-serif" font-size="10" fill="#4a3f35" opacity=".6">
        TOTAL SPENT
      </text>
    </svg>`;
}

// ── Trip CRUD ─────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function openAddExpenseModal() {
  if (!currentTripId) { showToast('Please select a trip first', 'error'); return; }
  document.getElementById('expenseId').value = '';
  document.getElementById('expenseModalTitle').textContent = 'Add Expense';
  document.getElementById('expenseCategory').value = 'food';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDescription').value = '';
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expensePayment').value = 'cash';
  document.getElementById('expenseNotes').value = '';
  openModal('expenseModal');
}

async function saveTrip() {
  const id   = document.getElementById('tripId').value;
  const name = document.getElementById('tripName').value.trim();
  const dest = document.getElementById('tripDestination').value.trim();
  if (!name || !dest) { showToast('Name and destination are required', 'error'); return; }

  const payload = {
    name,
    destination: dest,
    startDate:  document.getElementById('tripStartDate').value,
    endDate:    document.getElementById('tripEndDate').value,
    currency:   document.getElementById('tripCurrency').value,
    budget:     parseFloat(document.getElementById('tripBudget').value) || 0,
    notes:      document.getElementById('tripNotes').value,
  };

  const saveBtn = document.querySelector('#tripModal .btn-primary');
  const stopBtn = startBtnLoading(saveBtn, id ? 'Updating…' : 'Saving…');
  try {
    const url    = id ? `${API_BASE}/trips/${id}` : `${API_BASE}/trips`;
    const method = id ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    if (!d.success) throw new Error(d.message);
    closeModal('tripModal');
    showToast(id ? 'Trip updated!' : 'Trip created!', 'success');
    await loadTrips();
    if (!id) {
      currentTripId = d.data._id;
      document.getElementById('globalTripSelect').value = currentTripId;
    }
  } catch (err) {
    showToast(err.message || 'Failed to save trip', 'error');
  } finally {
    stopBtn();
  }
}

function editTrip(id) {
  const trip = allTrips.find(t => t._id === id);
  if (!trip) return;
  document.getElementById('tripId').value          = trip._id;
  document.getElementById('tripModalTitle').textContent = 'Edit Trip';
  document.getElementById('tripName').value        = trip.name;
  document.getElementById('tripDestination').value = trip.destination;
  document.getElementById('tripStartDate').value   = (trip.startDate || '').split('T')[0];
  document.getElementById('tripEndDate').value     = (trip.endDate || '').split('T')[0];
  document.getElementById('tripCurrency').value    = trip.currency || 'USD';
  document.getElementById('tripBudget').value      = trip.budget || '';
  document.getElementById('tripNotes').value       = trip.notes || '';
  openModal('tripModal');
}

function confirmDeleteTrip(id) {
  const trip = allTrips.find(t => t._id === id);
  document.getElementById('confirmMessage').textContent =
    `Delete "${trip?.name}"? This will also delete ALL expenses for this trip.`;
  document.getElementById('confirmBtn').onclick = () => deleteTrip(id);
  openModal('confirmModal');
}

async function deleteTrip(id) {
  const confirmBtn = document.getElementById('confirmBtn');
  const stopBtn = startBtnLoading(confirmBtn, 'Deleting…');
  try {
    const r = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (!d.success) throw new Error(d.message);
    closeModal('confirmModal');
    showToast('Trip deleted', 'success');
    if (currentTripId === id) currentTripId = null;
    await loadTrips();
  } catch (err) {
    showToast(err.message || 'Failed to delete', 'error');
  } finally {
    stopBtn();
  }
}

// ── Expense CRUD ──────────────────────────────────────────────────────────────
async function saveExpense() {
  const id     = document.getElementById('expenseId').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }

  const payload = {
    tripId:        currentTripId,
    category:      document.getElementById('expenseCategory').value,
    amount,
    description:   document.getElementById('expenseDescription').value,
    date:          document.getElementById('expenseDate').value,
    paymentMethod: document.getElementById('expensePayment').value,
    notes:         document.getElementById('expenseNotes').value,
  };

  const saveBtn = document.querySelector('#expenseModal .btn-primary');
  const stopBtn = startBtnLoading(saveBtn, id ? 'Updating…' : 'Adding…');
  try {
    const url    = id ? `${API_BASE}/expenses/${id}` : `${API_BASE}/expenses`;
    const method = id ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    if (!d.success) throw new Error(d.message);
    closeModal('expenseModal');
    showToast(id ? 'Expense updated!' : 'Expense added!', 'success');
    await renderExpenses();
    // Refresh dashboard stats silently
    loadTrips();
  } catch (err) {
    showToast(err.message || 'Failed to save expense', 'error');
  } finally {
    stopBtn();
  }
}

function editExpense(id) {
  const e = allExpenses.find(x => x._id === id);
  if (!e) return;
  document.getElementById('expenseId').value          = e._id;
  document.getElementById('expenseModalTitle').textContent = 'Edit Expense';
  document.getElementById('expenseCategory').value    = e.category;
  document.getElementById('expenseAmount').value      = e.amount;
  document.getElementById('expenseDescription').value = e.description || '';
  document.getElementById('expenseDate').value        = (e.date || '').split('T')[0];
  document.getElementById('expensePayment').value     = e.paymentMethod || 'cash';
  document.getElementById('expenseNotes').value       = e.notes || '';
  openModal('expenseModal');
}

function confirmDeleteExpense(id) {
  const e = allExpenses.find(x => x._id === id);
  document.getElementById('confirmMessage').textContent =
    `Delete this expense: ${e?.description || e?.category} — ${fmt(e?.amount || 0)}?`;
  document.getElementById('confirmBtn').onclick = () => deleteExpense(id);
  openModal('confirmModal');
}

async function deleteExpense(id) {
  const confirmBtn = document.getElementById('confirmBtn');
  const stopBtn = startBtnLoading(confirmBtn, 'Deleting…');
  try {
    const r = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (!d.success) throw new Error(d.message);
    closeModal('confirmModal');
    showToast('Expense deleted', 'success');
    await renderExpenses();
    loadTrips();
  } catch (err) {
    showToast(err.message || 'Failed to delete', 'error');
  } finally {
    stopBtn();
  }
}

// ── Trip modal reset on open ──────────────────────────────────────────────────
document.querySelector('[onclick="openModal(\'tripModal\')"]')?.addEventListener('click', () => {
  document.getElementById('tripId').value = '';
  document.getElementById('tripModalTitle').textContent = 'New Trip';
  document.getElementById('tripName').value = '';
  document.getElementById('tripDestination').value = '';
  document.getElementById('tripStartDate').value = '';
  document.getElementById('tripEndDate').value = '';
  document.getElementById('tripCurrency').value = 'USD';
  document.getElementById('tripBudget').value = '';
  document.getElementById('tripNotes').value = '';
});

// Override all "New Trip" button clicks to reset form
document.querySelectorAll('[onclick="openModal(\'tripModal\')"]').forEach(btn => {
  btn.addEventListener('click', resetTripForm);
});
function resetTripForm() {
  document.getElementById('tripId').value = '';
  document.getElementById('tripModalTitle').textContent = 'New Trip';
  ['tripName','tripDestination','tripBudget','tripNotes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('tripStartDate').value = '';
  document.getElementById('tripEndDate').value = '';
  document.getElementById('tripCurrency').value = 'USD';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency || 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0);
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function paymentIcon(method) {
  const icons = { cash: '💵', card: '💳', digital: '📱', other: '🔄' };
  return icons[method] || '💰';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

// ── Plan My Trip ──────────────────────────────────────────────────────────────

async function runPlanner() {
  const origin      = document.getElementById('plannerOrigin').value.trim();
  const destination = document.getElementById('plannerDestination').value.trim();
  const travellers  = parseInt(document.getElementById('plannerTravellers').value) || 2;
  const duration    = parseInt(document.getElementById('plannerDuration').value) || 7;
  const budgetLevel = document.getElementById('plannerBudgetLevel').value;

  if (!destination) { showToast('Please enter a destination', 'error'); return; }

  const btn = document.getElementById('plannerGoBtn');
  const stopBtn = startBtnLoading(btn, 'Planning your trip…');

  document.getElementById('plannerResults').innerHTML = `
    <div class="planner-loading">
      <div class="planner-ai-nodes">
        <div class="planner-ai-nodes-ring"></div>
        <div class="planner-ai-nodes-inner"></div>
        <div class="planner-ai-nodes-core"></div>
      </div>
      <div class="planner-loading-label">AI is planning your trip…</div>
      <div class="planner-loading-sub">Researching flights · pricing hotels · finding hidden gems</div>
    </div>`;

  try {
    const plan = await fetchTripPlan({ origin, destination, travellers, duration, budgetLevel });
    renderPlannerResults(plan, { origin, destination, travellers, duration, budgetLevel });
  } catch (err) {
    document.getElementById('plannerResults').innerHTML = `
      <div class="planner-error">
        <div style="font-size:32px;margin-bottom:12px">⚠️</div>
        <div style="font-size:16px;font-weight:600">Couldn't generate a plan</div>
        <div style="font-size:13px;margin-top:6px;opacity:.7">${err.message}</div>
      </div>`;
  } finally {
    stopBtn();
  }
}

async function fetchTripPlan({ origin, destination, travellers, duration, budgetLevel }) {
  const response = await fetch(`${TRAVEL_AGENT_API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': 'd69db697f85f42588812ae0606f2d0f3' },
    body: JSON.stringify({ origin, destination, travellers, duration, budgetLevel }),
  });

  const data = await response.json();
  if (data && data.success === false) throw new Error(data.message || 'Failed to generate plan');

  // Tolerate either a wrapped ({ success, data: {...} }) or a flat plan response.
  const plan = data && data.data ? data.data : data;
  if (!plan || !Array.isArray(plan.categories)) {
    throw new Error('Plan response was missing its category breakdown');
  }
  return plan;
}

function renderPlannerResults(plan, params) {
  const categories = Array.isArray(plan.categories) ? plan.categories : [];
  const tipsList   = Array.isArray(plan.tips) ? plan.tips : [];
  const totalAll  = categories.reduce((s, c) => s + (c.totalCost || 0), 0);
  const totalPP   = Math.round(totalAll / params.travellers);
  const budgetLabel = { budget: '🎒 Budget', mid: '⭐ Mid-range', luxury: '💎 Luxury' }[params.budgetLevel];

  // Store plan safely on window so the Create Trip button can reference it
  // without embedding raw JSON inside an HTML attribute (which breaks on
  // apostrophes, backticks, and other special characters in the AI response).
  window._lastPlan      = plan;
  window._lastPlanTotal = totalAll;

  const cards = plan.categories.map(cat => `
    <div class="planner-card">
      <div class="planner-card-accent" style="background:${cat.color}"></div>
      <div class="planner-card-header">
        <div class="planner-card-icon">${cat.icon}</div>
        <div>
          <div class="planner-card-title">${cat.title}</div>
          <div class="planner-card-subtitle">${cat.subtitle}</div>
        </div>
      </div>
      <div class="planner-card-amount">$${cat.totalCost.toLocaleString()}</div>
      <div class="planner-card-per">$${cat.perPerson.toLocaleString()} per person</div>
      <div class="planner-line-items">
        ${cat.lineItems.map(li => `
          <div class="planner-line">
            <span class="planner-line-label">${li.label}</span>
            <span class="planner-line-val">${li.value}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');

  const tips = plan.tips.map((tip, i) => `
    <div class="planner-tip">
      <div class="planner-tip-dot">${i + 1}</div>
      <div>${tip}</div>
    </div>`).join('');

  document.getElementById('plannerResults').innerHTML = `
    <div class="planner-hero">
      <div class="planner-hero-eyebrow">✦ Your Trip Plan · ${budgetLabel}</div>
      <div class="planner-hero-title">${esc(plan.destination)}</div>
      <div class="planner-hero-meta">${params.travellers} traveller${params.travellers > 1 ? 's' : ''} · ${params.duration} nights${params.origin ? ' · from ' + esc(params.origin) : ''}</div>
      <div class="planner-hero-meta" style="font-style:italic;margin-bottom:20px;opacity:.45">${esc(plan.summary)}</div>
      <div class="planner-hero-totals">
        <div class="planner-total-item">
          <div class="planner-total-val">$${totalAll.toLocaleString()}</div>
          <div class="planner-total-label">Total estimated budget</div>
        </div>
        <div class="planner-total-item">
          <div class="planner-total-val">$${totalPP.toLocaleString()}</div>
          <div class="planner-total-label">Per person</div>
        </div>
        <div class="planner-total-item">
          <div class="planner-total-val">$${Math.round(totalPP / params.duration).toLocaleString()}</div>
          <div class="planner-total-label">Per person / night</div>
        </div>
      </div>
    </div>

    <div class="planner-grid">${cards}</div>

    <div class="planner-tips-card">
      <div class="planner-tips-title">💡 Insider Tips</div>
      <div class="planner-tips-list">${tips}</div>
      ${plan.visaInfo ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(42,122,110,0.15);font-size:13px;color:var(--ink-soft)"><strong>🛂 Visa:</strong> ${esc(plan.visaInfo)}</div>` : ''}
      ${plan.bestTimeToVisit ? `<div style="margin-top:8px;font-size:13px;color:var(--ink-soft)"><strong>📅 Best time to visit:</strong> ${esc(plan.bestTimeToVisit)}</div>` : ''}
    </div>

    <div class="planner-cta">
      <div>
        <div class="planner-cta-text">Ready to make it official?</div>
        <div class="planner-cta-sub">Create a trip and start tracking your actual expenses.</div>
      </div>
      <div class="planner-cta-actions">
        <button class="btn btn-ghost" onclick="runPlanner()">↺ Replan</button>
        <button class="btn btn-primary" onclick="createTripFromPlan(window._lastPlan, window._lastPlanTotal)">+ Create Trip</button>
      </div>
    </div>`;
}

function createTripFromPlan(plan, totalBudget) {
  document.getElementById('tripId').value = '';
  document.getElementById('tripModalTitle').textContent = 'New Trip';
  document.getElementById('tripName').value = plan.destination;
  document.getElementById('tripDestination').value = plan.destination;
  document.getElementById('tripStartDate').value = '';
  document.getElementById('tripEndDate').value = '';
  document.getElementById('tripCurrency').value = 'USD';
  document.getElementById('tripBudget').value = totalBudget;
  document.getElementById('tripNotes').value = `AI-planned trip. ${plan.summary}`;
  openModal('tripModal');
}