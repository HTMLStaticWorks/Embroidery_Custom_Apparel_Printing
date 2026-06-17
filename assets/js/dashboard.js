/* ============================================================
   CORPORATE BULK ORDERS DASHBOARD — JavaScript
   ============================================================ */

'use strict';

/* ── Order Data ────────────────────────────────────────── */
const ORDERS = [
  { id:'ORD-2851', product:'Embroidered Caps',   qty:200,  total:'$4,800',  status:'Pending Approval', date:'Jun 16, 2025' },
  { id:'ORD-2849', product:'Branded Jackets',    qty:150,  total:'$18,750', status:'Pending Approval', date:'Jun 15, 2025' },
  { id:'ORD-2847', product:'Custom Polo Shirts', qty:500,  total:'$12,500', status:'In Production',    date:'Jun 10, 2025' },
  { id:'ORD-2845', product:'Branded Mugs',       qty:400,  total:'$3,200',  status:'Shipped',          date:'Jun 08, 2025' },
  { id:'ORD-2843', product:'Custom Tees',        qty:800,  total:'$9,600',  status:'Shipped',          date:'Jun 05, 2025' },
  { id:'ORD-2841', product:'Printed Hoodies',    qty:100,  total:'$6,500',  status:'In Production',    date:'Jun 04, 2025' },
  { id:'ORD-2838', product:'Custom Polo Shirts', qty:300,  total:'$7,500',  status:'Delivered',        date:'May 28, 2025' },
  { id:'ORD-2835', product:'Embroidered Caps',   qty:500,  total:'$11,000', status:'Delivered',        date:'May 22, 2025' },
  { id:'ORD-2832', product:'Custom Tees',        qty:1000, total:'$12,000', status:'Delivered',        date:'May 18, 2025' },
  { id:'ORD-2829', product:'Branded Jackets',    qty:200,  total:'$25,000', status:'Delivered',        date:'May 10, 2025' },
  { id:'ORD-2826', product:'Printed Hoodies',    qty:250,  total:'$16,250', status:'Delivered',        date:'Apr 30, 2025' },
  { id:'ORD-2823', product:'Custom Accessories', qty:600,  total:'$7,200',  status:'Cancelled',        date:'Apr 25, 2025' },
];

const STATUS_BADGE = {
  'In Production':   'badge-warning',
  'Shipped':         'badge-info',
  'Pending Approval':'badge-purple',
  'Delivered':       'badge-success',
  'Cancelled':       'badge-danger',
};

/* ── State ─────────────────────────────────────────────── */
let currentSection = 'overview';
let sidebarCollapsed = false;
let chartsInitialized = false;
let sortState = { col: null, asc: true };
let filteredOrders = [...ORDERS];

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderOrdersTable(ORDERS);
  initMiniBarChart();
  initCharts();
  initDragDrop();
  initSidebarToggle();
  initThemeToggle();
  initRTLToggle();
  setGreeting();
  animateStats();
});

/* ── Greeting ──────────────────────────────────────────── */
function setGreeting() {
  const h = new Date().getHours();
  const greetEl = document.querySelector('.welcome-text .greeting');
  if (!greetEl) return;
  const g = h < 12 ? 'Good morning 🌤️' : h < 17 ? 'Good afternoon ☀️' : 'Good evening 👋';
  greetEl.textContent = g;
}

/* ── Animate stat numbers ───────────────────────────────── */
function animateStats() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = el.textContent.trim();
    const num = parseFloat(raw.replace(/[^0-9.]/g,''));
    if (isNaN(num) || num === 0) return;
    const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
    const suffix = raw.match(/[^0-9.]+$/)?.[0] || '';
    let start = 0, duration = 900, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(eased * num * 10) / 10;
      el.textContent = prefix + (Number.isInteger(num) ? Math.round(cur) : cur.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigate(section) {
  // Deactivate all
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Activate target
  const sec = document.getElementById('section-' + section);
  const nav = document.getElementById('nav-' + section);
  if (sec) sec.classList.add('active');
  if (nav) nav.classList.add('active');

  currentSection = section;

  // Close sidebar on mobile/tablet after navigation
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
  }

  // Breadcrumb
  const labels = {
    overview:'Dashboard', orders:'Bulk Orders', branding:'Branding Upload',
    production:'Production Tracking', shipping:'Shipping & Delivery',
    approvals:'Approval Center', notifications:'Notifications',
    reports:'Reports & Analytics', settings:'Account Settings'
  };
  const bc = document.getElementById('breadcrumbCurrent');
  if (bc) bc.textContent = labels[section] || section;

  // Init charts lazily
  if (!chartsInitialized && (section === 'overview' || section === 'reports')) {
    initCharts();
    chartsInitialized = true;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Wire nav items
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.section));
});

/* ============================================================
   SIDEBAR TOGGLE
   ============================================================ */
function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebarClose');
  if (!sidebar) return;

  if (btn) {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('open');
      } else {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }
}

/* ============================================================
   DARK MODE
   ============================================================ */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const saved = localStorage.getItem('dashTheme') || 'light';
  applyTheme(saved);
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('dashTheme', next);
    updateChartsTheme(next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ============================================================
   CHARTS
   ============================================================ */
let chartInstances = {};

function initCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const labelColor = isDark ? '#94a3b8' : '#64748b';

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.plugins.legend.display = false;

  // ── Spending Line Chart (Overview) ────────────────────
  const spCtx = document.getElementById('spendingChart');
  if (spCtx && !chartInstances.spending) {
    chartInstances.spending = new Chart(spCtx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'Spending ($)',
          data: [18400, 22100, 19800, 31200, 27500, 38400, 0, 0, 0, 0, 0, 0],
          borderColor: '#3b82f6',
          backgroundColor: createGradient(spCtx, '#3b82f6'),
          borderWidth: 2.5,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        }, {
          label: 'Orders',
          data: [14, 18, 16, 24, 22, 34, 0, 0, 0, 0, 0, 0],
          borderColor: '#dc2626',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
          yAxisID: 'y2',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top',
            labels: { color: labelColor, boxWidth: 12, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#f1f5f9' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1, padding: 10,
            callbacks: {
              label: ctx => ctx.datasetIndex === 0
                ? ` $${ctx.raw.toLocaleString()}`
                : ` ${ctx.raw} orders`
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 },
            callback: v => '$' + (v/1000) + 'K' }
          },
          y2: { position: 'right', grid: { display: false },
            ticks: { color: '#dc2626', font: { size: 11 } }
          }
        }
      }
    });
  }

  // ── Donut Chart (Overview) ────────────────────────────
  const dnCtx = document.getElementById('donutChart');
  if (dnCtx && !chartInstances.donut) {
    chartInstances.donut = new Chart(dnCtx, {
      type: 'doughnut',
      data: {
        labels: ['In Production','Shipped','Pending','Delivered'],
        datasets: [{
          data: [7, 4, 3, 18],
          backgroundColor: ['#3b82f6','#10b981','#f59e0b','#dc2626'],
          borderColor: isDark ? '#111827' : '#fff',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#f1f5f9' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1, padding: 10,
          }
        }
      }
    });
  }

  // ── Order Volume Bar Chart (Reports) ──────────────────
  const ovCtx = document.getElementById('orderVolumeChart');
  if (ovCtx && !chartInstances.orderVolume) {
    chartInstances.orderVolume = new Chart(ovCtx, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [{
          label: 'Orders',
          data: [14, 18, 16, 24, 22, 34],
          backgroundColor: ['#3b82f6','#60a5fa','#93c5fd','#3b82f6','#60a5fa','#2563eb'],
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { padding: 10,
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#f1f5f9' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: labelColor } },
          y: { grid: { color: gridColor }, ticks: { color: labelColor,
            callback: v => v + ' orders' }
          }
        }
      }
    });
  }

  // ── Spending Analytics (Reports) ──────────────────────
  const saCtx = document.getElementById('spendingAnalyticsChart');
  if (saCtx && !chartInstances.spendingAnalytics) {
    chartInstances.spendingAnalytics = new Chart(saCtx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [
          { label: 'Polo Shirts', data: [12000,15000,14000,22000,18000,17500],
            borderColor:'#3b82f6', backgroundColor: 'transparent', borderWidth:2, tension:0.4, pointRadius:3 },
          { label: 'Jackets', data: [8000,9000,7500,12000,11000,10500],
            borderColor:'#dc2626', backgroundColor: 'transparent', borderWidth:2, tension:0.4, pointRadius:3 },
          { label: 'Caps & Hats', data: [5000,6000,5500,8000,7200,6800],
            borderColor:'#10b981', backgroundColor: 'transparent', borderWidth:2, tension:0.4, pointRadius:3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top',
            labels: { color: labelColor, boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#f1f5f9' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1, padding: 10,
            callbacks: { label: ctx => ` $${ctx.raw.toLocaleString()}` }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 },
            callback: v => '$' + (v/1000) + 'K' }
          }
        }
      }
    });
  }
}

function createGradient(ctx, color) {
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, color + '40');
  gradient.addColorStop(1, color + '00');
  return gradient;
}

function updateChartsTheme(theme) {
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const labelColor = isDark ? '#94a3b8' : '#64748b';
  Object.values(chartInstances).forEach(chart => {
    if (!chart) return;
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = gridColor;
        if (scale.ticks) scale.ticks.color = labelColor;
      });
    }
    if (chart.options.plugins?.legend?.labels) {
      chart.options.plugins.legend.labels.color = labelColor;
    }
    chart.update();
  });
}

/* ── Mini Bar Chart ────────────────────────────────────── */
function initMiniBarChart() {
  const container = document.getElementById('miniBarChart');
  if (!container) return;
  const data = [14, 18, 16, 24, 22, 34];
  const max = Math.max(...data);
  container.innerHTML = data.map((v, i) => `
    <div class="mini-bar" style="height:${(v/max)*100}%;">
      <div class="mini-bar-tooltip">${v} orders</div>
    </div>
  `).join('');
}

/* ============================================================
   ORDERS TABLE
   ============================================================ */
function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">
      <div style="font-size:32px;margin-bottom:10px;">📭</div>No orders found matching your criteria.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span class="order-id">${o.id}</span></td>
      <td class="td-primary">${o.product}</td>
      <td>${o.qty.toLocaleString()} units</td>
      <td class="fw-600" style="color:var(--text-primary);">${o.total}</td>
      <td><span class="badge ${STATUS_BADGE[o.status] || 'badge-gray'}">
        <span class="badge-dot"></span>${o.status}
      </span></td>
      <td>${o.date}</td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-sm" onclick="viewOrder('${o.id}')" data-tooltip="View">👁️</button>
          <button class="btn btn-ghost btn-sm" onclick="duplicateOrderById('${o.id}')" data-tooltip="Duplicate">📋</button>
          <button class="btn btn-ghost btn-sm" onclick="downloadInvoiceById('${o.id}')" data-tooltip="Invoice">🧾</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Update count
  const info = document.getElementById('paginationInfo');
  if (info) info.textContent = `Showing 1–${Math.min(orders.length, 10)} of ${orders.length} orders`;
}

function filterOrders() {
  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const status = document.getElementById('statusFilter')?.value || '';
  const product = document.getElementById('productFilter')?.value || '';

  filteredOrders = ORDERS.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search) || o.product.toLowerCase().includes(search);
    const matchStatus = !status || o.status === status;
    const matchProduct = !product || o.product === product;
    return matchSearch && matchStatus && matchProduct;
  });

  renderOrdersTable(filteredOrders);
}

function resetFilters() {
  const s = document.getElementById('orderSearch');
  const sf = document.getElementById('statusFilter');
  const pf = document.getElementById('productFilter');
  if (s) s.value = '';
  if (sf) sf.value = '';
  if (pf) pf.value = '';
  filteredOrders = [...ORDERS];
  renderOrdersTable(ORDERS);
}

function sortTable(col) {
  if (sortState.col === col) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.col = col;
    sortState.asc = true;
  }

  // Update header icons
  document.querySelectorAll('.data-table th').forEach(th => th.classList.remove('sorted'));

  filteredOrders.sort((a, b) => {
    let valA, valB;
    switch(col) {
      case 'id':      valA = a.id; valB = b.id; break;
      case 'product': valA = a.product; valB = b.product; break;
      case 'qty':     valA = a.qty; valB = b.qty; break;
      case 'total':   valA = parseFloat(a.total.replace(/[^0-9.]/g,'')); valB = parseFloat(b.total.replace(/[^0-9.]/g,'')); break;
      case 'status':  valA = a.status; valB = b.status; break;
      case 'date':    valA = new Date(a.date); valB = new Date(b.date); break;
      default: return 0;
    }
    if (valA < valB) return sortState.asc ? -1 : 1;
    if (valA > valB) return sortState.asc ? 1 : -1;
    return 0;
  });

  renderOrdersTable(filteredOrders);
}

function viewOrder(id) {
  showToast(`Viewing order ${id}`, 'info');
  navigate('production');
}

function duplicateOrderById(id) {
  showToast(`Duplicating order ${id}… `, 'success');
}

function downloadInvoiceById(id) {
  showToast(`Downloading invoice for ${id}… ⬇️`, 'info');
}

function downloadInvoice() {
  showToast('Downloading selected invoices… ⬇️', 'info');
}

function duplicateOrder() {
  openModal('newOrderModal');
  showToast('Order form pre-filled from last order 📋', 'info');
}

/* ============================================================
   MODALS
   ============================================================ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeModalOverlay(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

// Close modals with Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

function submitOrder() {
  closeModal('newOrderModal');
  showToast('🎉 Bulk order placed successfully! We\'ll confirm within 24 hours.', 'success');

  // Add fake order to top of table
  const fakeId = 'ORD-' + (2852 + Math.floor(Math.random() * 10));
  ORDERS.unshift({ id: fakeId, product: 'New Bulk Order', qty: 100, total: '$2,500', status: 'Pending Approval', date: 'Jun 16, 2025' });
  filteredOrders = [...ORDERS];
  renderOrdersTable(ORDERS);
}

/* ============================================================
   TABS
   ============================================================ */
function switchTab(btn, paneId) {
  const container = btn.closest('.tabs, [id$="Tabs"]') || btn.parentElement;
  const section = btn.closest('.dashboard-section') || btn.closest('section') || document;

  // Deactivate sibling tab buttons
  const siblings = btn.parentElement.querySelectorAll('.tab-btn');
  siblings.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Deactivate panes (look in whole section)
  section.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
}

/* ============================================================
   APPROVAL CENTER
   ============================================================ */
function approveDesign(btn, name) {
  const card = btn.closest('.approval-card');
  if (!card) return;
  const badge = card.querySelector('.badge');
  if (badge) { badge.className = 'badge badge-success'; badge.textContent = 'Approved'; }
  const actions = card.querySelector('.approval-card-actions');
  if (actions) {
    actions.innerHTML = `<span class="badge badge-success">✓ Approved on Jun 16, 2025</span>`;
  }
  showToast(`✅ "${name}" design approved! Production can proceed.`, 'success');

  // Move card to approved tab
  setTimeout(() => {
    const approvedGrid = document.getElementById('approvedGrid');
    if (card && approvedGrid) {
      const clone = card.cloneNode(true);
      approvedGrid.prepend(clone);
    }
    if (card) card.style.opacity = '0.5';
  }, 800);
}

function rejectDesign(btn, name) {
  const card = btn.closest('.approval-card');
  if (!card) return;
  const badge = card.querySelector('.badge');
  if (badge) { badge.className = 'badge badge-danger'; badge.textContent = 'Rejected'; }
  const actions = card.querySelector('.approval-card-actions');
  if (actions) {
    actions.innerHTML = `<span class="badge badge-danger">✕ Rejected — Awaiting revision</span>
      <button class="btn btn-ghost btn-sm" onclick="openModal('commentModal')">💬 Feedback Sent</button>`;
  }
  showToast(`❌ "${name}" design rejected. Feedback sent to production team.`, 'danger');
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(item => item.classList.remove('unread'));
  const badge = document.querySelector('#section-notifications .badge-primary');
  if (badge) badge.textContent = '0 unread';
  showToast('All notifications marked as read ✓', 'success');

  // Clear nav badge
  const navBadge = document.querySelector('#nav-notifications .nav-badge');
  if (navBadge) navBadge.textContent = '0';
}

/* ============================================================
   FILE UPLOAD / DRAG & DROP
   ============================================================ */
function initDragDrop() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  ['dragenter', 'dragover'].forEach(ev => {
    zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dragging'); });
  });

  ['dragleave', 'drop'].forEach(ev => {
    zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dragging'); });
  });

  zone.addEventListener('drop', e => {
    const files = e.dataTransfer?.files;
    if (files?.length) handleFileUpload({ files });
  });
}

function handleFileUpload(input) {
  const files = input.files;
  if (!files?.length) return;
  const list = document.getElementById('uploadedFileList');
  if (!list) return;

  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toUpperCase();
    const size = file.size > 1048576
      ? (file.size / 1048576).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';
    const icon = ['PNG','JPG','JPEG','SVG'].includes(ext) ? '🖼️' : ext === 'PDF' ? '📄' : '🎨';

    const item = document.createElement('div');
    item.className = 'file-item bounce-in';
    item.innerHTML = `
      <div class="file-icon">${icon}</div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-meta">${ext} · ${size} · Uploading…</div>
      </div>
      <span class="badge badge-gray">Processing</span>
      <div class="file-actions">
        <button class="btn btn-ghost btn-sm">⬇️</button>
      </div>
    `;
    list.prepend(item);

    // Simulate upload progress
    setTimeout(() => {
      const badge = item.querySelector('.badge');
      const meta = item.querySelector('.file-meta');
      if (badge) { badge.className = 'badge badge-warning'; badge.textContent = 'Under Review'; }
      if (meta) meta.textContent = `${ext} · ${size} · Uploaded just now`;
      showToast(`✅ "${file.name}" uploaded successfully!`, 'success');
    }, 1500);
  });
}

/* ============================================================
   REPORTS
   ============================================================ */
function downloadReport(name) {
  showToast(`⬇️ Preparing "${name}"… Download will start shortly.`, 'info');
}

/* ============================================================
   SETTINGS
   ============================================================ */
function saveSettings() {
  showToast('✅ Settings saved successfully!', 'success');
}

/* ============================================================
   PRODUCTION VIEW
   ============================================================ */
function updateProductionView() {
  const sel = document.getElementById('productionOrderFilter');
  if (!sel) return;
  showToast(`Loading production data for ${sel.value}…`, 'info');
}

/* ============================================================
   GLOBAL SEARCH
   ============================================================ */
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
  globalSearch.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (!q) return;
    // Search orders
    const matches = ORDERS.filter(o =>
      o.id.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.status.toLowerCase().includes(q)
    );
    if (matches.length) {
      navigate('orders');
      setTimeout(() => {
        filteredOrders = matches;
        renderOrdersTable(matches);
        const s = document.getElementById('orderSearch');
        if (s) s.value = this.value;
      }, 100);
    }
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = {
    success: 'rgba(16,185,129,0.95)',
    danger:  'rgba(239,68,68,0.95)',
    warning: 'rgba(245,158,11,0.95)',
    info:    'rgba(59,130,246,0.95)',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    display:flex; align-items:center; gap:10px;
    background:${colors[type] || colors.info};
    color:#fff;
    padding:12px 18px;
    border-radius:10px;
    font-size:13.5px; font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);
    pointer-events:all;
    max-width:380px;
    animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  `;
  toast.innerHTML = `<span style="font-size:16px;">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Toast CSS animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastIn {
    from { opacity:0; transform:translateY(20px) scale(0.9); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes toastOut {
    from { opacity:1; transform:translateY(0) scale(1); }
    to   { opacity:0; transform:translateY(10px) scale(0.95); }
  }
`;
document.head.appendChild(toastStyle);

/* ============================================================
   INTERSECTION OBSERVER — Animate Progress Bars on Scroll
   ============================================================ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const target = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 100);
      observer.unobserve(bar);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.progress-bar').forEach(bar => observer.observe(bar));

/* ============================================================
   STAT CARDS — Hover Ripple Effect
   ============================================================ */
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.2s, box-shadow 0.2s';
  });
});

/* ============================================================
   SHIPMENT CARD — Click to show full tracking
   ============================================================ */
document.querySelectorAll('.shipment-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const id = card.querySelector('.fw-700')?.textContent?.split('·')[0]?.trim();
    if (id) showToast(`Opening full tracking for ${id}…`, 'info');
  });
});

/* ============================================================
   AUTO-REFRESH SIMULATION (every 60s)
   ============================================================ */
setInterval(() => {
  // Silently update "last updated" indicators if needed
}, 60000);

console.log('%c Embroidery & Apparel Dashboard ','background:linear-gradient(135deg,#2563eb,#dc2626);color:#fff;font-size:14px;font-weight:700;padding:8px 14px;border-radius:6px;');
console.log('%c Corporate Bulk Orders Management System v1.0 ','color:#2563eb;font-weight:550;');

/* ============================================================
   RTL MODE TOGGLE
   ============================================================ */
function initRTLToggle() {
  const toggleBtn = document.getElementById('rtlToggle');
  if (!toggleBtn) return;

  const currentDir = localStorage.getItem('dir') || 'ltr';
  applyDirection(currentDir);

  toggleBtn.addEventListener('click', () => {
    const isRTL = document.body.getAttribute('dir') === 'rtl';
    const nextDir = isRTL ? 'ltr' : 'rtl';
    applyDirection(nextDir);
    localStorage.setItem('dir', nextDir);
  });
}

function applyDirection(dir) {
  const toggleBtn = document.getElementById('rtlToggle');
  if (dir === 'rtl') {
    document.body.setAttribute('dir', 'rtl');
    if (toggleBtn) toggleBtn.classList.add('rtl-active');
  } else {
    document.body.removeAttribute('dir');
    if (toggleBtn) toggleBtn.classList.remove('rtl-active');
  }
}
