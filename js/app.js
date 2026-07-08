/* ============================================================
   EXPENSE & BUDGET VISUALIZER — app.js
   Vanilla JS | LocalStorage | No frameworks
   ============================================================ */

'use strict';

/* ── Theme Toggle ──────────────────────────────────────────── */
(function initTheme() {
  var btn  = document.getElementById('theme-toggle');
  var icon = document.getElementById('theme-icon');
  var html = document.documentElement;
  var KEY  = 'expense_theme';

  var saved = localStorage.getItem(KEY);
  applyTheme(saved === 'light' ? 'light' : 'dark');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    try { localStorage.setItem(KEY, theme); } catch (e) { /* quota */ }
  }

  btn.addEventListener('click', function () {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}());


/* ── Core App ──────────────────────────────────────────────── */
(function initApp() {

  /* ── Storage keys ────────────────────────────────────────── */
  var TX_KEY    = 'expense_transactions';
  var LIMIT_KEY = 'expense_limit';

  /* ── Category colour palette ─────────────────────────────── */
  var PALETTE = [
    '#6c63ff', /* Food      — violet  */
    '#ff5f6d', /* Transport — coral   */
    '#43d98f', /* Fun       — mint    */
    '#f5a623', /* custom 4  — amber   */
    '#00c6ff', /* custom 5  — sky     */
    '#ff9ff3', /* custom 6  — pink    */
    '#54a0ff', /* custom 7  — blue    */
    '#feca57', /* custom 8  — yellow  */
    '#48dbfb', /* custom 9  — cyan    */
    '#1dd1a1', /* custom 10 — teal    */
    '#ff9f43', /* custom 11 — orange  */
    '#ff6b81'  /* custom 12 — rose    */
  ];

  var BUILTIN = ['Food', 'Transport', 'Fun'];

  /* ── State ───────────────────────────────────────────────── */
  var transactions  = loadJSON(TX_KEY, []);
  var spendingLimit = loadFloat(LIMIT_KEY, 0);
  var sortMode      = 'newest';

  /* ── Category → colour map (built-ins pre-assigned) ──────── */
  var categoryColors = {};
  var colorIndex     = 0;

  BUILTIN.forEach(function (c) { assignColor(c); });

  function assignColor(cat) {
    if (!categoryColors[cat]) {
      categoryColors[cat] = PALETTE[colorIndex % PALETTE.length];
      colorIndex++;
    }
    return categoryColors[cat];
  }

  /* ── Persistence helpers ─────────────────────────────────── */
  function loadJSON(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
  }

  function loadFloat(key, fallback) {
    var v = parseFloat(localStorage.getItem(key));
    return isFinite(v) && v >= 0 ? v : fallback;
  }

  function saveTx() {
    try { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); } catch (e) { /* quota */ }
  }

  function saveLimit(val) {
    try { localStorage.setItem(LIMIT_KEY, val); } catch (e) { /* quota */ }
  }

  /* ── DOM refs ────────────────────────────────────────────── */
  var balanceEl        = document.getElementById('total-balance');
  var limitInputEl     = document.getElementById('limit-input');
  var limitSetBtn      = document.getElementById('limit-set');
  var limitClearBtn    = document.getElementById('limit-clear');
  var limitStatusEl    = document.getElementById('limit-status');

  var itemNameEl       = document.getElementById('item-name');
  var itemAmountEl     = document.getElementById('item-amount');
  var itemCategoryEl   = document.getElementById('item-category');
  var customGroupEl    = document.getElementById('custom-category-group');
  var customCategoryEl = document.getElementById('custom-category');
  var addBtn           = document.getElementById('add-btn');

  var errName          = document.getElementById('err-name');
  var errAmount        = document.getElementById('err-amount');
  var errCategory      = document.getElementById('err-category');
  var errCustom        = document.getElementById('err-custom');

  var listEl           = document.getElementById('transaction-list');
  var txCountEl        = document.getElementById('tx-count');
  var sortSelectEl     = document.getElementById('sort-select');

  var chartWrapEl      = document.getElementById('chart-wrap');
  var chartEmptyEl     = document.getElementById('chart-empty');
  var chartLegendEl    = document.getElementById('chart-legend');
  var chartCanvas      = document.getElementById('spending-chart');

  /* ── Chart.js ────────────────────────────────────────────── */
  var pieChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderWidth: 2,
        borderColor: 'transparent',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var val   = ctx.parsed;
              var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
              var pct   = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              return ' Rp ' + fmt(val) + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });

  /* ── Formatting ──────────────────────────────────────────── */
  function fmt(n) {
    return Number(n).toLocaleString('id-ID');
  }

  /* ── Input helpers ───────────────────────────────────────── */
  function shake(el) {
    el.classList.remove('input-error');
    void el.offsetWidth; /* force reflow to replay animation */
    el.classList.add('input-error');
    setTimeout(function () { el.classList.remove('input-error'); }, 400);
  }

  /* For compound wrapper divs (.amount-wrap, .limit-input-wrap) that hold
     the visible border — shake the wrapper, not the borderless inner input */
  function shakeWrap(el) {
    el.classList.remove('wrap-error');
    void el.offsetWidth;
    el.classList.add('wrap-error');
    setTimeout(function () { el.classList.remove('wrap-error'); }, 400);
  }

  function clearErrors() {
    [errName, errAmount, errCategory, errCustom].forEach(function (el) {
      el.textContent = '';
    });
  }

  /* ── Balance ─────────────────────────────────────────────── */
  function totalSpending() {
    return transactions.reduce(function (sum, t) { return sum + t.amount; }, 0);
  }

  function updateBalance() {
    var total = totalSpending();
    balanceEl.textContent = 'Rp ' + fmt(total);

    if (spendingLimit > 0) {
      var pct = (total / spendingLimit) * 100;
      if (pct >= 100) {
        balanceEl.classList.add('over-limit');
        limitStatusEl.textContent  = '⚠️ Over limit!';
        limitStatusEl.className    = 'limit-status danger';
      } else if (pct >= 80) {
        balanceEl.classList.remove('over-limit');
        limitStatusEl.textContent  = '⚠️ ' + pct.toFixed(0) + '% of limit used';
        limitStatusEl.className    = 'limit-status warn';
      } else {
        balanceEl.classList.remove('over-limit');
        limitStatusEl.textContent  = '✓ ' + pct.toFixed(0) + '% of limit used';
        limitStatusEl.className    = 'limit-status ok';
      }
    } else {
      balanceEl.classList.remove('over-limit');
      limitStatusEl.textContent = '';
      limitStatusEl.className   = 'limit-status';
    }
  }

  /* ── Spending limit actions ──────────────────────────────── */
  function setLimit() {
    var raw = limitInputEl.value.trim();
    var val = parseFloat(raw);
    if (!raw || !isFinite(val) || val < 0) {
      shakeWrap(document.querySelector('.limit-input-wrap'));
      return;
    }
    spendingLimit = val;
    saveLimit(val);
    renderAll();
  }

  function clearLimit() {
    spendingLimit = 0;
    limitInputEl.value = '';
    saveLimit(0);
    renderAll();
  }

  /* ── Chart ───────────────────────────────────────────────── */
  function updateChart() {
    /* aggregate by category */
    var totals = {};
    transactions.forEach(function (t) {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    var labels = Object.keys(totals);
    var data   = labels.map(function (l) { return totals[l]; });
    var colors = labels.map(function (l) { return assignColor(l); });

    if (labels.length === 0) {
      chartWrapEl.classList.add('hidden');
      chartEmptyEl.classList.remove('hidden');
    } else {
      chartWrapEl.classList.remove('hidden');
      chartEmptyEl.classList.add('hidden');
    }

    pieChart.data.labels                      = labels;
    pieChart.data.datasets[0].data            = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();

    /* custom legend */
    chartLegendEl.innerHTML = '';
    labels.forEach(function (label, i) {
      var item = document.createElement('div');
      item.className = 'legend-item';

      var dot = document.createElement('span');
      dot.className        = 'legend-dot';
      dot.style.background = colors[i];
      dot.setAttribute('aria-hidden', 'true');

      var txt = document.createElement('span');
      txt.textContent = label + ' — Rp ' + fmt(data[i]);

      item.appendChild(dot);
      item.appendChild(txt);
      chartLegendEl.appendChild(item);
    });
  }

  /* ── Sort ────────────────────────────────────────────────── */
  function getSorted() {
    var copy = transactions.slice();
    switch (sortMode) {
      case 'oldest':      return copy.sort(function (a, b) { return a.id - b.id; });
      case 'amount-desc': return copy.sort(function (a, b) { return b.amount - a.amount; });
      case 'amount-asc':  return copy.sort(function (a, b) { return a.amount - b.amount; });
      case 'category-az': return copy.sort(function (a, b) { return a.category.localeCompare(b.category); });
      case 'category-za': return copy.sort(function (a, b) { return b.category.localeCompare(a.category); });
      default:            return copy.sort(function (a, b) { return b.id - a.id; }); /* newest */
    }
  }

  /* ── Transaction list ────────────────────────────────────── */
  function renderList() {
    listEl.innerHTML = '';

    /* transaction count badge */
    if (transactions.length === 0) {
      txCountEl.textContent = '';
    } else {
      txCountEl.textContent = transactions.length + (transactions.length === 1 ? ' item' : ' items');
    }

    if (transactions.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'list-empty';
      
      var emptyIcon = document.createElement('span');
      emptyIcon.textContent = '🧾';
      
      var emptyText = document.createElement('p');
      emptyText.textContent = 'No transactions yet — add one above!';
      
      empty.appendChild(emptyIcon);
      empty.appendChild(emptyText);
      listEl.appendChild(empty);
      return;
    }

    getSorted().forEach(function (tx) {
      var isOver = spendingLimit > 0 && tx.amount > spendingLimit;
      var color  = assignColor(tx.category);

      var row = document.createElement('div');
      row.className = 'tx-item' + (isOver ? ' over-limit' : '');
      row.setAttribute('role', 'listitem');

      /* colour dot */
      var dot = document.createElement('span');
      dot.className        = 'tx-category-dot';
      dot.style.background = color;
      dot.setAttribute('aria-hidden', 'true');

      /* item name */
      var nameEl = document.createElement('span');
      nameEl.className   = 'tx-name';
      nameEl.textContent = tx.name;

      /* right-side meta */
      var meta = document.createElement('div');
      meta.className = 'tx-meta';

      var amtEl = document.createElement('span');
      amtEl.className   = 'tx-amount';
      amtEl.textContent = 'Rp ' + fmt(tx.amount);

      var tagEl = document.createElement('span');
      tagEl.className   = 'tx-category-tag';
      tagEl.textContent = tx.category;

      meta.appendChild(amtEl);
      meta.appendChild(tagEl);

      if (isOver) {
        var badge = document.createElement('span');
        badge.className   = 'tx-over-badge';
        badge.textContent = '⚠️ Over limit';
        meta.appendChild(badge);
      }

      /* delete button */
      var delBtn = document.createElement('button');
      delBtn.className = 'tx-delete';
      delBtn.setAttribute('aria-label', 'Delete transaction: ' + tx.name);
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', function () { deleteTransaction(tx.id); });

      row.appendChild(dot);
      row.appendChild(nameEl);
      row.appendChild(meta);
      row.appendChild(delBtn);
      listEl.appendChild(row);
    });
  }

  /* ── Full re-render ──────────────────────────────────────── */
  function renderAll() {
    updateBalance();
    updateChart();
    renderList();
  }

  /* ── Add transaction ─────────────────────────────────────── */
  function addTransaction() {
    clearErrors();

    var name    = itemNameEl.value.trim();
    var amtRaw  = itemAmountEl.value.trim();
    var amount  = parseFloat(amtRaw);
    var catSel  = itemCategoryEl.value;
    var custom  = customCategoryEl.value.trim();
    var valid   = true;

    if (!name) {
      errName.textContent = 'Item name is required.';
      shake(itemNameEl);
      valid = false;
    }

    if (!amtRaw || !isFinite(amount) || amount <= 0) {
      errAmount.textContent = 'Enter a valid amount greater than 0.';
      shakeWrap(document.querySelector('.amount-wrap'));
      valid = false;
    }

    if (!catSel) {
      errCategory.textContent = 'Please select a category.';
      shake(itemCategoryEl);
      valid = false;
    }

    /* resolve final category — default to catSel, override if Custom */
    var category = catSel;
    if (catSel === 'Custom') {
      if (!custom) {
        errCustom.textContent = 'Enter your custom category name.';
        shake(customCategoryEl);
        valid = false;
        category = ''; /* not yet resolved */
      } else {
        category = custom;
      }
    }

    if (!valid) return;

    /* persist new custom category option for session reuse */
    if (catSel === 'Custom') {
      addCategoryOption(category);
    }

    transactions.push({ id: Date.now(), name: name, amount: amount, category: category });
    saveTx();

    /* reset form */
    itemNameEl.value       = '';
    itemAmountEl.value     = '';
    itemCategoryEl.value   = '';
    customCategoryEl.value = '';
    customGroupEl.classList.add('hidden');
    itemNameEl.focus();

    renderAll();
  }

  /* ── Delete transaction ──────────────────────────────────── */
  function deleteTransaction(id) {
    transactions = transactions.filter(function (t) { return t.id !== id; });
    saveTx();
    renderAll();
  }

  /* ── Custom category helpers ─────────────────────────────── */
  function addCategoryOption(name) {
    var opts = itemCategoryEl.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === name) return; /* already present */
    }
    var opt = document.createElement('option');
    opt.value       = name;
    opt.textContent = '🏷️ ' + name;
    /* insert before the "Custom…" sentinel */
    var sentinel = itemCategoryEl.querySelector('option[value="Custom"]');
    itemCategoryEl.insertBefore(opt, sentinel);
  }

  function restoreCustomCategories() {
    var seen = {};
    BUILTIN.forEach(function (c) { seen[c] = true; });
    seen['Custom'] = true;
    transactions.forEach(function (t) {
      if (!seen[t.category]) {
        addCategoryOption(t.category);
        seen[t.category] = true;
      }
    });
  }

  /* ── Events ──────────────────────────────────────────────── */
  addBtn.addEventListener('click', addTransaction);

  itemNameEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTransaction();
  });
  itemAmountEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTransaction();
  });

  itemCategoryEl.addEventListener('change', function () {
    if (itemCategoryEl.value === 'Custom') {
      customGroupEl.classList.remove('hidden');
      customCategoryEl.focus();
    } else {
      customGroupEl.classList.add('hidden');
      customCategoryEl.value = '';
      errCustom.textContent  = '';
    }
  });

  sortSelectEl.addEventListener('change', function () {
    sortMode = sortSelectEl.value;
    renderList();
  });

  limitSetBtn.addEventListener('click', setLimit);
  limitInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') setLimit();
  });

  limitClearBtn.addEventListener('click', clearLimit);

  /* ── Initialise ──────────────────────────────────────────── */
  if (spendingLimit > 0) {
    limitInputEl.value = spendingLimit;
  }

  restoreCustomCategories();
  renderAll();

}());
