/* ============================================================
   MY DASHBOARD — app.js
   Vanilla JS | Local Storage | No frameworks
   ============================================================ */

'use strict';

/* ============================================================
   SECTION 0 — THEME TOGGLE (light / dark, persisted)
   ============================================================ */
(function initTheme() {
  const btn    = document.getElementById('theme-toggle');
  const icon   = document.getElementById('theme-icon');
  const html   = document.documentElement;
  const STORAGE_KEY = 'dashboard_theme';

  // restore saved preference, default to dark
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem(STORAGE_KEY, theme);
  }

  btn.addEventListener('click', function() {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

/* ============================================================
   SECTION 1 — GREETING (time, date, greeting message)
   ============================================================ */
(function initGreeting() {
  const devName = 'Satria Herlambang';
  const timeEl    = document.getElementById('greeting-time');
  const textEl    = document.getElementById('greeting-text');
  const dateEl    = document.getElementById('greeting-date');

  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return '🌤 Good Morning!, '+devName;
    if (hour >= 12 && hour < 17) return '☀️ Good Afternoon!, '+devName;
    if (hour >= 17 && hour < 21) return '🌆 Good Evening!, '+devName;
    return '🌙 Good Night!, '+devName;
  }

  function update() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes().toString().padStart(2, '0');
    const s    = now.getSeconds().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = (h % 12) || 12;

    timeEl.textContent = `${h12}:${m}:${s} ${ampm}`;
    textEl.textContent = getGreeting(h);
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  update();
  setInterval(update, 1000);
})();


/* ============================================================
   SECTION 2 — FOCUS TIMER (configurable Pomodoro)
   ============================================================ */
(function initTimer() {
  const DEFAULT_MINUTES = 25;

  const displayEl  = document.getElementById('timer-display');
  const statusEl   = document.getElementById('timer-status');
  const btnStart   = document.getElementById('timer-start');
  const btnStop    = document.getElementById('timer-stop');
  const btnReset   = document.getElementById('timer-reset');
  const btnSet     = document.getElementById('timer-set');
  const minutesInput = document.getElementById('timer-minutes');

  let totalSeconds = DEFAULT_MINUTES * 60;
  let remaining    = totalSeconds;
  let intervalId   = null;
  let running      = false;

  function render() {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    displayEl.textContent = `${m}:${s}`;
    displayEl.classList.toggle('running',  running && remaining > 0);
    displayEl.classList.toggle('finished', remaining === 0);
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      remaining = 0;
      clearInterval(intervalId);
      intervalId = null;
      running = false;
      statusEl.textContent = '🎉 Session complete! Take a break.';
    }
    render();
  }

  function start() {
    if (running || remaining <= 0) return;
    running    = true;
    intervalId = setInterval(tick, 1000);
    statusEl.textContent = '⏱ Focusing…';
    render();
  }

  function stop() {
    if (!running) return;
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    statusEl.textContent = 'Paused — resume when ready';
    render();
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    running   = false;
    remaining = totalSeconds;
    statusEl.textContent = 'Ready to focus';
    render();
  }

  function setDuration() {
    const mins = parseInt(minutesInput.value, 10);
    if (isNaN(mins) || mins < 1 || mins > 120) {
      // force animation replay by removing then re-adding the class
      minutesInput.classList.remove('input-error');
      void minutesInput.offsetWidth; // reflow
      minutesInput.classList.add('input-error');
      setTimeout(function() { minutesInput.classList.remove('input-error'); }, 400);
      statusEl.textContent = 'Enter a number between 1 and 120.';
      return;
    }
    clearInterval(intervalId);
    intervalId   = null;
    running      = false;
    totalSeconds = mins * 60;
    remaining    = totalSeconds;
    statusEl.textContent = `Timer set to ${mins} min — ready to focus`;
    render();
  }

  btnStart.addEventListener('click', start);
  btnStop.addEventListener('click', stop);
  btnReset.addEventListener('click', reset);
  btnSet.addEventListener('click', setDuration);

  minutesInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') setDuration();
  });

  render();
})();


/* ============================================================
   SECTION 3 — TO-DO LIST (add, edit, complete, delete, persist)
   ============================================================ */
(function initTodo() {
  const STORAGE_KEY = 'dashboard_todos';

  const listEl    = document.getElementById('todo-list');
  const inputEl   = document.getElementById('todo-input');
  const addBtn    = document.getElementById('todo-add');
  const modal     = document.getElementById('edit-modal');
  const editInput = document.getElementById('edit-input');
  const editSave  = document.getElementById('edit-save');
  const editCancel= document.getElementById('edit-cancel');

  let todos = load();
  let editingId = null;
  let dupMsgTimer = null;
  const SORT_MODES = ['default', 'az', 'za', 'done-last'];
  const SORT_LABELS = {
    'default':   { icon: '⇅',  label: 'Sort' },
    'az':        { icon: 'A→Z', label: 'A→Z' },
    'za':        { icon: 'Z→A', label: 'Z→A' },
    'done-last': { icon: '✓↓',  label: 'Done Last' },
  };
  let sortMode = 'default';

  /* -- persistence -- */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* -- render -- */
  function getSorted() {
    const copy = todos.slice();
    if (sortMode === 'az')        return copy.sort(function(a, b) { return a.text.localeCompare(b.text); });
    if (sortMode === 'za')        return copy.sort(function(a, b) { return b.text.localeCompare(a.text); });
    if (sortMode === 'done-last') return copy.sort(function(a, b) { return Number(b.done) - Number(a.done); });
    return copy; // default: insertion order
  }

  function updateSortBtn() {
    const sortBtn   = document.getElementById('todo-sort');
    const iconEl    = document.getElementById('todo-sort-icon');
    const labelEl   = document.getElementById('todo-sort-label');
    const info      = SORT_LABELS[sortMode];
    iconEl.textContent  = info.icon;
    labelEl.textContent = info.label;
    if (sortMode === 'default') {
      sortBtn.classList.remove('btn-sort-active');
    } else {
      sortBtn.classList.add('btn-sort-active');
    }
  }

  function render() {
    listEl.innerHTML = '';

    if (todos.length === 0) {
      listEl.innerHTML = '<p class="todo-empty">No tasks yet — add one above!</p>';
      updateSortBtn();
      return;
    }

    const sorted = getSorted();

    sorted.forEach(function(todo) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;

      // check button
      const checkBtn = document.createElement('button');
      checkBtn.className = 'todo-check' + (todo.done ? ' checked' : '');
      checkBtn.setAttribute('aria-label', todo.done ? 'Mark incomplete' : 'Mark complete');
      checkBtn.addEventListener('click', function() { toggleDone(todo.id); });

      // text
      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      // actions
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-ghost btn-icon';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.addEventListener('click', function() { openEdit(todo.id); });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-ghost btn-icon';
      delBtn.textContent = '🗑';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.addEventListener('click', function() { deleteTodo(todo.id); });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      li.appendChild(checkBtn);
      li.appendChild(span);
      li.appendChild(actions);
      listEl.appendChild(li);
    });
    updateSortBtn();
  }

  /* -- actions -- */
  function addTodo() {
    const text = inputEl.value.trim();
    if (!text) return;

    // duplicate check (case-insensitive)
    const isDuplicate = todos.some(function(t) {
      return t.text.toLowerCase() === text.toLowerCase();
    });

    if (isDuplicate) {
      // force animation replay
      inputEl.classList.remove('input-error');
      void inputEl.offsetWidth; // reflow
      inputEl.classList.add('input-error');
      setTimeout(function() { inputEl.classList.remove('input-error'); }, 400);

      // show/update warning message, cancel any pending clear
      let msg = document.getElementById('todo-dup-msg');
      if (!msg) {
        msg = document.createElement('p');
        msg.id = 'todo-dup-msg';
        msg.className = 'todo-duplicate-msg';
        inputEl.parentNode.insertAdjacentElement('afterend', msg);
      }
      msg.textContent = '⚠️ "' + text + '" is already in your list.';
      if (dupMsgTimer) clearTimeout(dupMsgTimer);
      dupMsgTimer = setTimeout(function() { if (msg) msg.textContent = ''; dupMsgTimer = null; }, 2500);
      return;
    }

    // clear any existing duplicate message
    const existingMsg = document.getElementById('todo-dup-msg');
    if (existingMsg) existingMsg.textContent = '';

    todos.push({ id: Date.now(), text: text, done: false });
    inputEl.value = '';
    save();
    render();
  }

  function toggleDone(id) {
    todos = todos.map(function(t) {
      return t.id === id ? Object.assign({}, t, { done: !t.done }) : t;
    });
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(function(t) { return t.id !== id; });
    save();
    render();
  }

  function openEdit(id) {
    const todo = todos.find(function(t) { return t.id === id; });
    if (!todo) return;
    editingId = id;
    editInput.value = todo.text;
    modal.classList.remove('hidden');
    editInput.focus();
  }

  function closeEdit() {
    editingId = null;
    modal.classList.add('hidden');
  }

  function saveEdit() {
    const text = editInput.value.trim();
    if (!text || editingId === null) return;

    // duplicate check — ignore the task being edited itself
    const isDuplicate = todos.some(function(t) {
      return t.id !== editingId && t.text.toLowerCase() === text.toLowerCase();
    });

    if (isDuplicate) {
      editInput.classList.remove('input-error');
      void editInput.offsetWidth; // reflow
      editInput.classList.add('input-error');
      setTimeout(function() { editInput.classList.remove('input-error'); }, 400);
      return;
    }

    todos = todos.map(function(t) {
      return t.id === editingId ? Object.assign({}, t, { text: text }) : t;
    });
    save();
    render();
    closeEdit();
  }

  /* -- events -- */
  addBtn.addEventListener('click', addTodo);

  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTodo();
  });

  document.getElementById('todo-sort').addEventListener('click', function() {
    const idx = SORT_MODES.indexOf(sortMode);
    sortMode  = SORT_MODES[(idx + 1) % SORT_MODES.length];
    render();
  });

  editSave.addEventListener('click', saveEdit);
  editCancel.addEventListener('click', closeEdit);

  editInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeEdit();
  });

  // close modal on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeEdit();
  });

  render();
})();


/* ============================================================
   SECTION 4 — QUICK LINKS (add, open, delete, persist)
   ============================================================ */
(function initLinks() {
  const STORAGE_KEY = 'dashboard_links';

  const gridEl    = document.getElementById('links-grid');
  const nameInput = document.getElementById('link-name-input');
  const urlInput  = document.getElementById('link-url-input');
  const addBtn    = document.getElementById('link-add');

  let links = load();

  /* -- persistence -- */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  /* -- render -- */
  function render() {
    gridEl.innerHTML = '';

    if (links.length === 0) {
      gridEl.innerHTML = '<p class="links-empty">No links yet — add your favorites above!</p>';
      return;
    }

    links.forEach(function(link) {
      // chip wrapper (anchor)
      const anchor = document.createElement('a');
      anchor.className = 'link-chip';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';

      // favicon
      const favicon = document.createElement('img');
      const domain = (function() {
        try { return new URL(link.url).hostname; } catch { return ''; }
      })();
      favicon.src = domain ? `https://www.google.com/s2/favicons?sz=16&domain=${domain}` : '';
      favicon.alt = '';
      favicon.width = 16;
      favicon.height = 16;
      favicon.style.flexShrink = '0';
      favicon.onerror = function() { favicon.style.display = 'none'; };

      // label
      const label = document.createElement('span');
      label.className = 'link-chip-label';
      label.textContent = link.name;

      // delete button (stop propagation so anchor doesn't open)
      const delBtn = document.createElement('button');
      delBtn.className = 'link-chip-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Remove ' + link.name);
      delBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        deleteLink(link.id);
      });

      anchor.appendChild(favicon);
      anchor.appendChild(label);
      anchor.appendChild(delBtn);
      gridEl.appendChild(anchor);
    });
  }

  function shakeInput(el) {
    el.classList.remove('input-error');
    void el.offsetWidth; // reflow to replay animation
    el.classList.add('input-error');
    setTimeout(function() { el.classList.remove('input-error'); }, 400);
  }

  /* -- actions -- */
  function addLink() {
    const name = nameInput.value.trim();
    let url    = urlInput.value.trim();

    if (!name) { shakeInput(nameInput); return; }
    if (!url)  { shakeInput(urlInput);  return; }

    // auto-prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // basic URL validation
    try { new URL(url); } catch {
      shakeInput(urlInput);
      return;
    }

    links.push({ id: Date.now(), name: name, url: url });
    nameInput.value = '';
    urlInput.value  = '';
    save();
    render();
  }

  function deleteLink(id) {
    links = links.filter(function(l) { return l.id !== id; });
    save();
    render();
  }

  /* -- events -- */
  addBtn.addEventListener('click', addLink);

  urlInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addLink();
  });

  nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') urlInput.focus();
  });

  render();
})();
