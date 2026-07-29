// Трекер тренировок — вся логика приложения. Данные хранятся только в localStorage.

const STORAGE_KEYS = {
  exercises: 'workout:exercises',
  entries: 'workout:entries',
  seeded: 'workout:seeded',
  restTimer: 'workout:restTimer',
  session: 'workout:session',
  sessions: 'workout:sessions'
};

const DEFAULT_REST_SECONDS = 90;

// Кастомные иконки (вместо эмодзи) — простые линейные SVG, наследуют цвет через currentColor.
const ICONS = {
  strength: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/></svg>',
  endurance: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.2s-7.2-4.4-9.5-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.5 5.2c-2.3 4.6-9.5 9-9.5 9z"/><path d="M4 12h3l1.6-3.2L10.5 14l1.6-3.4H16" stroke-width="1.6"/></svg>',
  speed: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
  up: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l7 10H5z"/></svg>',
  down: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19 5 9h14z"/></svg>',
  timer: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><line x1="12" y1="13" x2="12" y2="9"/><line x1="12" y1="13" x2="15" y2="14.5"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="4.5"/></svg>',
  hourglass: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 21h12"/><path d="M6 3c0 5 5 6 6 9-1 3-6 4-6 9"/><path d="M18 3c0 5-5 6-6 9 1 3 6 4 6 9"/></svg>',
  edit: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  check: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>',
  repeat: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M5 13a7 7 0 0 1 12-4.5L20 11"/><path d="M19 11a7 7 0 0 1-12 4.5L4 13"/></svg>',
  starOutline: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.9l-5.5 2.9 1.2-6.1-4.5-4.2 6.1-.7z"/></svg>',
  starFilled: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.9l-5.5 2.9 1.2-6.1-4.5-4.2 6.1-.7z"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg>',
  trophy: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 4"/><path d="M17 5h3a3 3 0 0 1-3 4"/></svg>',
  calendar: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>'
};

const CATEGORY_META = {
  strength: { label: 'Сила', color: '#c9793f', icon: ICONS.strength, unit: '1ПМ, кг' },
  endurance: { label: 'Выносливость', color: '#7cae70', icon: ICONS.endurance, unit: 'мин/сессия' },
  speed: { label: 'Скорость', color: '#7a97ac', icon: ICONS.speed, unit: 'км/ч' }
};

const FIELD_CONFIG = {
  strength: ['weight', 'reps'],
  endurance: ['duration', 'distance'],
  speed: ['distance', 'duration']
};

const DEFAULT_EXERCISES = [
  { name: 'Жим лёжа', category: 'strength' },
  { name: 'Присед со штангой', category: 'strength' },
  { name: 'Становая тяга', category: 'strength' },
  { name: 'Жим ногами (тренажёр)', category: 'strength' },
  { name: 'Тяга верхнего блока', category: 'strength' },
  { name: 'Жим гантелей стоя', category: 'strength' },
  { name: 'Беговая дорожка (длительно)', category: 'endurance' },
  { name: 'Велотренажёр', category: 'endurance' },
  { name: 'Гребной тренажёр', category: 'endurance' },
  { name: 'Спринт на дорожке', category: 'speed' }
];

let state = {
  exercises: [],
  entries: [],
  tab: 'log',
  logDate: todayISO(),
  analyticsPeriod: 30,
  analyticsCategory: 'all',
  restTimer: null,
  session: null,
  sessions: [],
  logExerciseId: null,
  editingSet: null,
  librarySearch: '',
  lastPR: null
};

let audioCtx = null;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return toISO(new Date());
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateHuman(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' });
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function formatSeconds(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatDuration(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ---------- Persistence ----------

function loadState() {
  try {
    state.exercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.exercises)) || [];
  } catch { state.exercises = []; }
  try {
    state.entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.entries)) || [];
  } catch { state.entries = []; }

  if (!localStorage.getItem(STORAGE_KEYS.seeded) && state.exercises.length === 0) {
    state.exercises = DEFAULT_EXERCISES.map(e => ({ id: uid(), ...e }));
    localStorage.setItem(STORAGE_KEYS.seeded, '1');
    saveExercises();
  }

  try {
    state.restTimer = JSON.parse(localStorage.getItem(STORAGE_KEYS.restTimer));
  } catch { state.restTimer = null; }
  if (state.restTimer && Date.now() - state.restTimer.endAt > 5 * 60 * 1000) {
    state.restTimer = null; // таймер давно истёк (например, приложение было закрыто) — не показываем устаревшее состояние
  }

  try {
    state.session = JSON.parse(localStorage.getItem(STORAGE_KEYS.session));
  } catch { state.session = null; }

  try {
    state.sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions)) || [];
  } catch { state.sessions = []; }
}

function saveExercises() {
  localStorage.setItem(STORAGE_KEYS.exercises, JSON.stringify(state.exercises));
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
}

function saveRestTimer() {
  localStorage.setItem(STORAGE_KEYS.restTimer, JSON.stringify(state.restTimer));
}

function saveSession() {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state.session));
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(state.sessions));
}

function getExercise(id) {
  return state.exercises.find(e => e.id === id);
}

// ---------- Таймер отдыха ----------

function startRestTimer(durationSec = DEFAULT_REST_SECONDS) {
  state.restTimer = { endAt: Date.now() + durationSec * 1000, notified: false };
  saveRestTimer();
}

function adjustRestTimer(deltaSec) {
  if (!state.restTimer) return;
  const now = Date.now();
  state.restTimer.endAt = Math.max(now, state.restTimer.endAt + deltaSec * 1000);
  if (state.restTimer.endAt > now) state.restTimer.notified = false;
  saveRestTimer();
  updateRestTimerUI();
}

function skipRestTimer() {
  state.restTimer = null;
  saveRestTimer();
  updateRestTimerUI();
}

function updateRestTimerUI() {
  const widget = document.getElementById('rest-timer-widget');
  if (!widget) return;
  if (!state.restTimer) {
    widget.hidden = true;
    return;
  }

  const remaining = Math.max(0, Math.ceil((state.restTimer.endAt - Date.now()) / 1000));
  const done = remaining <= 0;
  widget.hidden = false;
  widget.classList.toggle('rest-done', done);

  const timeEl = widget.querySelector('#rest-time');
  if (timeEl) timeEl.textContent = formatSeconds(remaining);
  const titleEl = widget.querySelector('.hero-stat-label span');
  if (titleEl) titleEl.textContent = done ? 'Отдых окончен' : 'Отдых';

  if (done && !state.restTimer.notified) {
    state.restTimer.notified = true;
    saveRestTimer();
    playBeep();
    vibrate();
  }
}

// ---------- Таймер тренировки ----------

function startSession() {
  state.session = { startedAt: Date.now() };
  saveSession();
}

function computeSessionSummary(date) {
  const dayEntries = state.entries.filter(e => e.date === date);
  let totalSets = 0;
  let totalVolume = 0;
  dayEntries.forEach(entry => {
    totalSets += entry.sets.length;
    entry.sets.forEach(s => {
      if (s.weight && s.reps) totalVolume += s.weight * s.reps;
    });
  });
  return { totalSets, totalVolume, exercisesCount: dayEntries.length };
}

function endSession() {
  if (!state.session) return;
  const endedAt = Date.now();
  const durationSec = Math.round((endedAt - state.session.startedAt) / 1000);
  const date = toISO(new Date(state.session.startedAt));
  const summary = computeSessionSummary(date);
  state.sessions.push({
    date,
    startedAt: state.session.startedAt,
    endedAt,
    durationSec,
    totalSets: summary.totalSets,
    totalVolume: summary.totalVolume,
    exercisesCount: summary.exercisesCount
  });
  saveSessions();
  state.session = null;
  saveSession();
}

function updateSessionTimerUI() {
  const el = document.getElementById('session-elapsed');
  if (!el || !state.session) return;
  const elapsedSec = Math.floor((Date.now() - state.session.startedAt) / 1000);
  el.textContent = formatDuration(elapsedSec);
}

function tickTimers() {
  updateRestTimerUI();
  updateSessionTimerUI();
}

// ---------- Звук и вибрация по окончании отдыха ----------

function ensureAudioUnlocked() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch { /* звук недоступен — не критично */ }
}

function playBeep() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    [[880, now], [1046.5, now + 0.45]].forEach(([freq, at]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.3, at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.4);
      osc.start(at);
      osc.stop(at + 0.4);
    });
  } catch { /* звук недоступен — не критично */ }
}

function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch { /* вибрация недоступна — не критично */ }
}

// ---------- Metrics ----------

function estimateOneRepMax(weight, reps) {
  if (!weight) return 0;
  if (!reps) return weight;
  return weight * (1 + reps / 30);
}

// Возвращает числовую метрику "результата" для одной тренировочной записи (entry)
// в зависимости от категории упражнения — то, что сравнивается во времени.
function computeEntryMetric(exercise, entry) {
  const sets = entry.sets || [];
  if (sets.length === 0) return null;

  if (exercise.category === 'strength') {
    const best = Math.max(...sets.map(s => estimateOneRepMax(s.weight, s.reps)));
    return best > 0 ? best : null;
  }
  if (exercise.category === 'endurance') {
    const total = sets.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    return total > 0 ? total : null;
  }
  if (exercise.category === 'speed') {
    const speeds = sets
      .filter(s => s.distance > 0 && s.duration > 0)
      .map(s => (s.distance / (s.duration / 60))); // км / (мин/60) = км/ч
    if (speeds.length === 0) return null;
    return Math.max(...speeds);
  }
  return null;
}

function formatMetric(category, value) {
  if (value === null || value === undefined) return '—';
  if (category === 'strength') return `${value.toFixed(1)} кг`;
  if (category === 'endurance') return `${value.toFixed(0)} мин`;
  if (category === 'speed') return `${value.toFixed(1)} км/ч`;
  return value.toFixed(1);
}

// ---------- Rendering: shell ----------

function render() {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`panel-${state.tab}`).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${state.tab}"]`).classList.add('active');

  if (state.tab === 'log') renderLog();
  if (state.tab === 'library') renderLibrary();
  if (state.tab === 'history') renderHistory();
  if (state.tab === 'analytics') renderAnalytics();
}

function switchTab(tab) {
  state.tab = tab;
  state.editingSet = null;
  state.lastPR = null;
  render();
}

// ---------- Личные рекорды ----------

function getBestMetric(exerciseId) {
  const ex = getExercise(exerciseId);
  if (!ex) return null;
  let best = null;
  state.entries.forEach(e => {
    if (e.exerciseId !== exerciseId) return;
    const val = computeEntryMetric(ex, e);
    if (val !== null && (best === null || val > best)) best = val;
  });
  return best;
}

// ---------- Tab: Log (Сегодня) ----------

function renderLog() {
  const panel = document.getElementById('panel-log');

  if (!state.logExerciseId || !getExercise(state.logExerciseId)) {
    state.logExerciseId = state.exercises.length ? state.exercises[0].id : null;
  }

  const sortedExercises = [...state.exercises].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  const exOptions = sortedExercises
    .map(e => `<option value="${e.id}" ${e.id === state.logExerciseId ? 'selected' : ''}>${e.favorite ? '★ ' : ''}${escapeHtml(e.name)} (${CATEGORY_META[e.category].label})</option>`)
    .join('');

  const favorites = state.exercises.filter(e => e.favorite);

  const dayEntries = state.entries.filter(e => e.date === state.logDate);
  const selectedEx = getExercise(state.logExerciseId);
  const todayEntryForSelected = selectedEx
    ? state.entries.find(e => e.exerciseId === selectedEx.id && e.date === state.logDate)
    : null;

  panel.innerHTML = `
    ${renderTimerCard()}
    ${renderRestWidget()}
    ${renderPRBanner()}

    <div class="card">
      <label class="field-label">Дата тренировки</label>
      <input type="date" id="log-date" value="${state.logDate}" max="${todayISO()}">
    </div>

    <div class="card">
      <label class="field-label">Упражнение / тренажёр</label>
      ${favorites.length ? `<div class="fav-chips">${favorites.map(e => `<button class="chip fav-chip ${e.id === state.logExerciseId ? 'chip-active' : ''}" data-fav-pick="${e.id}">${ICONS.starFilled}<span>${escapeHtml(e.name)}</span></button>`).join('')}</div>` : ''}
      <div class="search-box">
        ${ICONS.search}
        <input type="text" id="log-exercise-search" placeholder="Поиск упражнения...">
      </div>
      <div id="log-exercise-results" class="search-results"></div>
      <select id="log-exercise">${exOptions || '<option disabled>Сначала добавьте упражнение</option>'}</select>
      <div id="log-last-hint">${renderLastHintHtml(selectedEx)}</div>
      <div id="log-fields" class="set-fields"></div>
      <button class="btn-primary" id="log-add-set">+ Добавить подход</button>
      ${todayEntryForSelected && todayEntryForSelected.sets.length ? `<button class="btn-secondary" id="repeat-set-btn">${ICONS.repeat}<span>Повторить последний подход</span></button>` : ''}
    </div>

    <div class="section-title">Сегодня записано</div>
    <div id="log-entries">${dayEntries.length ? dayEntries.map(renderEntryCard).join('') : '<p class="empty-hint">Пока пусто. Добавьте первый подход выше.</p>'}</div>
  `;

  document.getElementById('log-date').addEventListener('change', (e) => {
    state.logDate = e.target.value;
    renderLog();
  });

  const exSelect = document.getElementById('log-exercise');
  const renderFields = () => {
    const ex = getExercise(exSelect.value);
    document.getElementById('log-fields').innerHTML = ex ? setFieldsHtml(ex.category) : '';
  };
  if (exSelect) {
    exSelect.addEventListener('change', () => {
      state.logExerciseId = exSelect.value;
      renderLog();
    });
    renderFields();
  }

  const addBtn = document.getElementById('log-add-set');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const ex = getExercise(exSelect.value);
      if (!ex) return;
      const set = readSetFields(ex.category);
      if (!set) return;
      ensureAudioUnlocked();
      addSetToLog(ex.id, state.logDate, set);
    });
  }

  const prBannerClose = document.getElementById('pr-banner-close');
  if (prBannerClose) {
    prBannerClose.addEventListener('click', () => {
      state.lastPR = null;
      renderLog();
    });
  }

  panel.querySelectorAll('[data-fav-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.logExerciseId = btn.dataset.favPick;
      renderLog();
    });
  });

  const searchInput = document.getElementById('log-exercise-search');
  const resultsEl = document.getElementById('log-exercise-results');
  if (searchInput && resultsEl) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        resultsEl.innerHTML = '';
        return;
      }
      const matches = state.exercises.filter(e => e.name.toLowerCase().includes(q)).slice(0, 8);
      resultsEl.innerHTML = matches.length
        ? matches.map(e => `<button class="search-result-item" data-search-pick="${e.id}">${escapeHtml(e.name)} <span class="muted">(${CATEGORY_META[e.category].label})</span></button>`).join('')
        : '<div class="empty-hint" style="padding:8px 0;">Ничего не найдено</div>';
      resultsEl.querySelectorAll('[data-search-pick]').forEach(resultBtn => {
        resultBtn.addEventListener('click', () => {
          state.logExerciseId = resultBtn.dataset.searchPick;
          renderLog();
        });
      });
    });
  }

  const repeatBtn = document.getElementById('repeat-set-btn');
  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      const ex = getExercise(state.logExerciseId);
      const entry = ex ? state.entries.find(e => e.exerciseId === ex.id && e.date === state.logDate) : null;
      if (!entry || !entry.sets.length) return;
      const lastSet = entry.sets[entry.sets.length - 1];
      ensureAudioUnlocked();
      addSetToLog(ex.id, state.logDate, { ...lastSet });
    });
  }

  attachEntryCardListeners(panel, renderLog);

  const startBtn = document.getElementById('start-session-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      ensureAudioUnlocked();
      startSession();
      render();
    });
  }

  const endBtn = document.getElementById('end-session-btn');
  if (endBtn) {
    endBtn.addEventListener('click', () => {
      endSession();
      render();
    });
  }

  const restMinusBtn = document.getElementById('rest-minus-btn');
  if (restMinusBtn) restMinusBtn.addEventListener('click', () => adjustRestTimer(-15));

  const restPlusBtn = document.getElementById('rest-plus-btn');
  if (restPlusBtn) restPlusBtn.addEventListener('click', () => adjustRestTimer(15));

  const restSkipBtn = document.getElementById('rest-skip-btn');
  if (restSkipBtn) restSkipBtn.addEventListener('click', skipRestTimer);
}

function renderTimerCard() {
  if (state.session) {
    const elapsed = Math.floor((Date.now() - state.session.startedAt) / 1000);
    return `
      <div class="hero-stat">
        <div class="hero-stat-label">${ICONS.timer}<span>Тренировка идёт</span></div>
        <div class="hero-stat-value" id="session-elapsed">${formatDuration(elapsed)}</div>
        <button class="btn-ghost" id="end-session-btn">Завершить тренировку</button>
      </div>
    `;
  }

  const last = state.sessions.length ? state.sessions[state.sessions.length - 1] : null;
  return `
    <div class="hero-stat hero-stat-idle">
      <button class="btn-primary" id="start-session-btn">Начать тренировку</button>
      ${last ? `<div class="timer-last">Последняя: ${formatSessionSummary(last)}</div>` : ''}
    </div>
  `;
}

function formatSessionSummary(session) {
  const parts = [formatDuration(session.durationSec), `${session.totalSets || 0} подх.`];
  if (session.totalVolume > 0) parts.push(`${Math.round(session.totalVolume)} кг`);
  parts.push(formatDateHuman(session.date));
  return parts.join(' · ');
}

function renderRestWidget() {
  const active = !!state.restTimer;
  const remaining = active ? Math.max(0, Math.ceil((state.restTimer.endAt - Date.now()) / 1000)) : 0;
  const done = active && remaining <= 0;
  return `
    <div class="rest-banner bleed ${done ? 'rest-done' : ''}" id="rest-timer-widget" ${active ? '' : 'hidden'}>
      <div class="hero-stat-label">${ICONS.hourglass}<span>${done ? 'Отдых окончен' : 'Отдых'}</span></div>
      <div class="rest-banner-value" id="rest-time">${formatSeconds(remaining)}</div>
      <div class="rest-banner-actions">
        <button class="chip" id="rest-minus-btn">-15с</button>
        <button class="chip" id="rest-plus-btn">+15с</button>
        <button class="btn-ghost" id="rest-skip-btn">Пропустить</button>
      </div>
    </div>
  `;
}

function renderPRBanner() {
  if (!state.lastPR) return '';
  const ex = getExercise(state.lastPR.exerciseId);
  if (!ex) return '';
  return `
    <div class="pr-flash bleed">
      <span class="pr-flash-icon">${ICONS.trophy}</span>
      <div class="pr-flash-body">
        <strong>Новый рекорд!</strong>
        <div class="pr-flash-sub">${escapeHtml(ex.name)} — ${formatMetric(ex.category, state.lastPR.value)}</div>
      </div>
      <button class="icon-btn" id="pr-banner-close" aria-label="Скрыть">${ICONS.close}</button>
    </div>
  `;
}

function setFieldsHtml(category) {
  const fields = FIELD_CONFIG[category];
  const labels = {
    weight: 'Вес, кг', reps: 'Повторы', duration: 'Время, мин', distance: 'Дистанция, км'
  };
  return fields.map(f => `
    <div class="set-field">
      <label>${labels[f]}</label>
      <input type="number" inputmode="decimal" step="0.1" min="0" data-field="${f}" placeholder="${labels[f]}">
    </div>
  `).join('');
}

function readSetFields(category) {
  const fields = FIELD_CONFIG[category];
  const set = {};
  let hasValue = false;
  fields.forEach(f => {
    const input = document.querySelector(`#log-fields [data-field="${f}"]`);
    const val = input ? parseFloat(input.value) : NaN;
    set[f] = isNaN(val) ? 0 : val;
    if (!isNaN(val) && val > 0) hasValue = true;
    if (input) input.value = '';
  });
  if (!hasValue) return null;
  return set;
}

function addSetToLog(exerciseId, date, set) {
  const ex = getExercise(exerciseId);
  const prevBest = getBestMetric(exerciseId);

  let entry = state.entries.find(e => e.exerciseId === exerciseId && e.date === date);
  if (!entry) {
    entry = { id: uid(), exerciseId, date, sets: [] };
    state.entries.push(entry);
  }
  entry.sets.push(set);
  saveEntries();

  const newMetric = ex ? computeEntryMetric(ex, entry) : null;
  state.lastPR = (newMetric !== null && (prevBest === null || newMetric > prevBest))
    ? { exerciseId, value: newMetric }
    : null;

  if (date === todayISO()) {
    if (!state.session) startSession();
    startRestTimer();
  }

  render();
}

function removeSet(entryId, setIndex) {
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;
  entry.sets.splice(setIndex, 1);
  if (entry.sets.length === 0) {
    state.entries = state.entries.filter(e => e.id !== entryId);
  }
  saveEntries();
  render();
}

function renderEntryCard(entry) {
  const ex = getExercise(entry.exerciseId);
  if (!ex) return '';
  const meta = CATEGORY_META[ex.category];
  const fields = FIELD_CONFIG[ex.category];
  const labels = { weight: 'кг', reps: 'повт', duration: 'мин', distance: 'км' };
  const fieldLabels = { weight: 'Вес, кг', reps: 'Повторы', duration: 'Время, мин', distance: 'Дистанция, км' };

  const setsHtml = entry.sets.map((s, i) => {
    const isEditing = state.editingSet && state.editingSet.entryId === entry.id && state.editingSet.setIndex === i;

    if (isEditing) {
      const editFieldsHtml = fields.map(f => `
        <div class="set-field">
          <label>${fieldLabels[f]}</label>
          <input type="number" inputmode="decimal" step="0.1" min="0" data-field="${f}" value="${s[f]}">
        </div>
      `).join('');
      return `<div class="set-row set-row-editing" data-edit-row>
        <div class="set-fields">${editFieldsHtml}</div>
        <div class="set-edit-actions">
          <button class="icon-btn" data-save-edit data-entry-id="${entry.id}" data-set-index="${i}" aria-label="Сохранить">${ICONS.check}</button>
          <button class="icon-btn" data-cancel-edit aria-label="Отмена">${ICONS.close}</button>
        </div>
      </div>`;
    }

    const parts = fields.map(f => `${s[f]} ${labels[f]}`).join(' × ');
    return `<div class="set-row">
      <span>#${i + 1}: ${parts}</span>
      <span class="set-row-actions">
        <button class="icon-btn" data-edit-set data-entry-id="${entry.id}" data-set-index="${i}" aria-label="Изменить подход">${ICONS.edit}</button>
        <button class="icon-btn" data-remove-set data-entry-id="${entry.id}" data-set-index="${i}" aria-label="Удалить подход">${ICONS.close}</button>
      </span>
    </div>`;
  }).join('');

  return `
    <div class="entry-row" style="border-left-color:${meta.color}">
      <div class="entry-row-head">
        <strong>${escapeHtml(ex.name)}</strong>
        <span class="entry-row-cat" style="color:${meta.color}">${meta.icon}<span>${meta.label}</span></span>
      </div>
      ${setsHtml}
    </div>
  `;
}

function renderLastHintHtml(exercise) {
  if (!exercise) return '';
  const past = state.entries
    .filter(e => e.exerciseId === exercise.id && e.date !== state.logDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!past || !past.sets.length) return '';

  const fields = FIELD_CONFIG[exercise.category];
  const labels = { weight: 'кг', reps: 'повт', duration: 'мин', distance: 'км' };
  const setsText = past.sets.map(s => fields.map(f => `${s[f]} ${labels[f]}`).join('×')).join(', ');
  return `<div class="last-hint">Прошлый раз (${formatDateHuman(past.date)}): ${setsText}</div>`;
}

function attachEntryCardListeners(panel, rerender) {
  panel.querySelectorAll('[data-remove-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeSet(btn.dataset.entryId, Number(btn.dataset.setIndex));
    });
  });

  panel.querySelectorAll('[data-edit-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingSet = { entryId: btn.dataset.entryId, setIndex: Number(btn.dataset.setIndex) };
      rerender();
    });
  });

  panel.querySelectorAll('[data-cancel-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingSet = null;
      rerender();
    });
  });

  panel.querySelectorAll('[data-save-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = state.entries.find(e => e.id === btn.dataset.entryId);
      const setIndex = Number(btn.dataset.setIndex);
      const ex = entry ? getExercise(entry.exerciseId) : null;
      if (!entry || !ex) return;

      const row = btn.closest('[data-edit-row]');
      const newSet = {};
      FIELD_CONFIG[ex.category].forEach(f => {
        const input = row.querySelector(`[data-field="${f}"]`);
        const val = input ? parseFloat(input.value) : NaN;
        newSet[f] = isNaN(val) ? 0 : val;
      });

      entry.sets[setIndex] = newSet;
      saveEntries();
      state.editingSet = null;
      rerender();
    });
  });
}

// ---------- Tab: Library (Упражнения) ----------

function renderLibrary() {
  const panel = document.getElementById('panel-library');

  panel.innerHTML = `
    <div class="card">
      <label class="field-label">Новое упражнение / тренажёр</label>
      <input type="text" id="new-ex-name" placeholder="Например: Жим лёжа">
      <label class="field-label">Тип (для аналитики)</label>
      <select id="new-ex-category">
        ${Object.entries(CATEGORY_META).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
      </select>
      <button class="btn-primary" id="add-exercise">+ Добавить</button>
    </div>
    <div class="search-box">
      ${ICONS.search}
      <input type="text" id="library-search" placeholder="Поиск по списку..." value="${escapeHtml(state.librarySearch)}">
    </div>
    <div id="library-list"></div>
  `;

  document.getElementById('add-exercise').addEventListener('click', () => {
    const nameInput = document.getElementById('new-ex-name');
    const category = document.getElementById('new-ex-category').value;
    const name = nameInput.value.trim();
    if (!name) return;
    state.exercises.push({ id: uid(), name, category, favorite: false });
    saveExercises();
    renderLibraryList();
    nameInput.value = '';
  });

  document.getElementById('library-search').addEventListener('input', (e) => {
    state.librarySearch = e.target.value;
    renderLibraryList();
  });

  renderLibraryList();
}

function renderLibraryList() {
  const container = document.getElementById('library-list');
  if (!container) return;

  const q = state.librarySearch.trim().toLowerCase();
  const grouped = {};
  state.exercises
    .filter(e => !q || e.name.toLowerCase().includes(q))
    .forEach(e => {
      grouped[e.category] = grouped[e.category] || [];
      grouped[e.category].push(e);
    });

  const listHtml = Object.keys(CATEGORY_META).map(cat => {
    const items = grouped[cat] || [];
    if (items.length === 0) return '';
    return `
      <div class="section-title">${CATEGORY_META[cat].icon}<span>${CATEGORY_META[cat].label}</span></div>
      ${items.map(e => `
        <div class="library-row">
          <span>${escapeHtml(e.name)}</span>
          <span class="set-row-actions">
            <button class="icon-btn ${e.favorite ? 'is-favorite' : ''}" data-toggle-fav="${e.id}" aria-label="Избранное">${e.favorite ? ICONS.starFilled : ICONS.starOutline}</button>
            <button class="icon-btn" data-delete-ex="${e.id}" aria-label="Удалить">${ICONS.trash}</button>
          </span>
        </div>
      `).join('')}
    `;
  }).join('');

  container.innerHTML = listHtml || '<p class="empty-hint">Ничего не найдено.</p>';

  container.querySelectorAll('[data-toggle-fav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ex = getExercise(btn.dataset.toggleFav);
      if (!ex) return;
      ex.favorite = !ex.favorite;
      saveExercises();
      renderLibraryList();
    });
  });

  container.querySelectorAll('[data-delete-ex]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteEx;
      if (!confirm('Удалить упражнение? История тренировок по нему тоже будет удалена.')) return;
      state.exercises = state.exercises.filter(e => e.id !== id);
      state.entries = state.entries.filter(e => e.exerciseId !== id);
      saveExercises();
      saveEntries();
      renderLibraryList();
    });
  });
}

// ---------- Tab: History (История) ----------

function renderHistory() {
  const panel = document.getElementById('panel-history');
  const byDate = {};
  state.entries.forEach(e => {
    byDate[e.date] = byDate[e.date] || [];
    byDate[e.date].push(e);
  });
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    panel.innerHTML = '<p class="empty-hint">История пуста — начните с вкладки «Сегодня».</p>';
    return;
  }

  panel.innerHTML = dates.map(date => {
    const daySessions = state.sessions.filter(s => s.date === date);
    return `
      <div class="section-title">${formatDateHuman(date)}</div>
      ${daySessions.length ? renderDaySummaryHtml(daySessions) : ''}
      ${byDate[date].map(renderEntryCard).join('')}
    `;
  }).join('');

  attachEntryCardListeners(panel, renderHistory);
}

function renderDaySummaryHtml(sessions) {
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const totalSets = sessions.reduce((sum, s) => sum + (s.totalSets || 0), 0);
  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  const parts = [formatDuration(totalDuration), `${totalSets} подх.`];
  if (totalVolume > 0) parts.push(`${Math.round(totalVolume)} кг`);
  return `<div class="day-summary">${ICONS.timer}<span>${parts.join(' · ')}</span></div>`;
}

// ---------- Tab: Analytics (Аналитика) ----------

function renderAnalytics() {
  const panel = document.getElementById('panel-analytics');

  panel.innerHTML = `
    ${renderStreakCalendar()}
    ${renderRecordsSection()}
    <div class="card">
      <label class="field-label">Период</label>
      <div class="period-buttons">
        ${[7, 30, 60, 90].map(p => `<button class="chip ${state.analyticsPeriod === p ? 'chip-active' : ''}" data-period="${p}">${p} дн.</button>`).join('')}
      </div>
    </div>
    <div id="summary-cards" class="summary-grid"></div>
    <div class="section-title">Прогресс по упражнениям</div>
    <div id="exercise-charts"></div>
  `;

  panel.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.analyticsPeriod = Number(btn.dataset.period);
      renderAnalytics();
    });
  });

  const startDate = daysAgoISO(state.analyticsPeriod);
  const endDate = todayISO();

  renderSummaryCards(startDate, endDate);
  renderExerciseCharts(startDate, endDate);
}

function getTrainedDatesSet() {
  const set = new Set();
  state.entries.forEach(e => set.add(e.date));
  state.sessions.forEach(s => set.add(s.date));
  return set;
}

function renderStreakCalendar() {
  const trainedDates = getTrainedDatesSet();
  const weeks = 10;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Пн ... 6=Вс
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + (6 - dayOfWeek));
  const startDate = new Date(weekEnd);
  startDate.setDate(weekEnd.getDate() - weeks * 7 + 1);

  const days = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }

  let columnsHtml = '';
  for (let w = 0; w < weeks; w++) {
    let colCells = '';
    for (let d = 0; d < 7; d++) {
      const date = days[w * 7 + d];
      const iso = toISO(date);
      const isFuture = date > today;
      const trained = trainedDates.has(iso);
      const cls = isFuture ? 'streak-cell future' : (trained ? 'streak-cell trained' : 'streak-cell');
      colCells += `<div class="${cls}" title="${iso}"></div>`;
    }
    columnsHtml += `<div class="streak-col">${colCells}</div>`;
  }

  let streak = 0;
  const cursor = new Date(today);
  if (!trainedDates.has(toISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (trainedDates.has(toISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalTrained = days.filter(d => d <= today && trainedDates.has(toISO(d))).length;

  return `
    <div class="streak-block">
      <div class="streak-head">
        <span class="streak-title">${ICONS.calendar}<span>Регулярность</span></span>
        <span class="streak-stat">${streak > 0 ? `Серия: ${streak} дн.` : 'Начните серию сегодня'}</span>
      </div>
      <div class="streak-grid-wrap">
        <div class="streak-grid">${columnsHtml}</div>
      </div>
      <div class="streak-footer">${totalTrained} тренировок за ${weeks} недель</div>
    </div>
  `;
}

function renderRecordsSection() {
  const rows = state.exercises
    .map(ex => ({ ex, best: getBestMetric(ex.id) }))
    .filter(r => r.best !== null)
    .sort((a, b) => a.ex.name.localeCompare(b.ex.name));

  if (rows.length === 0) return '';

  return `
    <div class="section-title">${ICONS.trophy}<span>Личные рекорды</span></div>
    ${rows.map(r => {
      const meta = CATEGORY_META[r.ex.category];
      return `
        <div class="record-row">
          <span class="record-icon" style="color:${meta.color}">${meta.icon}</span>
          <span class="record-name">${escapeHtml(r.ex.name)}</span>
          <span class="record-value">${formatMetric(r.ex.category, r.best)}</span>
        </div>
      `;
    }).join('')}
  `;
}

function trendForExercise(exercise, startDate, endDate) {
  const entries = state.entries
    .filter(e => e.exerciseId === exercise.id && e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const points = entries
    .map(e => ({ date: e.date, value: computeEntryMetric(exercise, e) }))
    .filter(p => p.value !== null);

  if (points.length === 0) return null;

  const chunk = Math.max(1, Math.floor(points.length / 3));
  const startVals = points.slice(0, chunk).map(p => p.value);
  const endVals = points.slice(-chunk).map(p => p.value);
  const startAvg = average(startVals);
  const endAvg = average(endVals);
  const pctChange = startAvg > 0 ? ((endAvg - startAvg) / startAvg) * 100 : (endAvg > 0 ? 100 : 0);

  return { points, startAvg, endAvg, pctChange, hasEnough: points.length >= 2 };
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function renderSummaryCards(startDate, endDate) {
  const container = document.getElementById('summary-cards');
  const cards = Object.entries(CATEGORY_META).map(([cat, meta]) => {
    const tileStyle = `background: linear-gradient(160deg, ${meta.color}26 0%, ${meta.color}08 65%, transparent 100%); border-color: ${meta.color}40;`;
    const exercises = state.exercises.filter(e => e.category === cat);
    const trends = exercises
      .map(ex => trendForExercise(ex, startDate, endDate))
      .filter(t => t && t.hasEnough);

    if (trends.length === 0) {
      return `
        <div class="card summary-card" style="${tileStyle}">
          <div class="summary-icon" style="color:${meta.color}">${meta.icon}</div>
          <div class="summary-label">${meta.label}</div>
          <div class="summary-value muted">нет данных</div>
        </div>
      `;
    }

    const avgPct = average(trends.map(t => t.pctChange));
    const sign = avgPct >= 0 ? '+' : '';
    const colorClass = avgPct >= 0 ? 'up' : 'down';
    return `
      <div class="card summary-card" style="${tileStyle}">
        <div class="summary-icon" style="color:${meta.color}">${meta.icon}</div>
        <div class="summary-label">${meta.label}</div>
        <div class="summary-value ${colorClass}">${sign}${avgPct.toFixed(1)}%</div>
      </div>
    `;
  }).join('');
  container.innerHTML = cards;
}

function renderExerciseCharts(startDate, endDate) {
  const container = document.getElementById('exercise-charts');
  const cards = state.exercises.map(ex => {
    const trend = trendForExercise(ex, startDate, endDate);
    const meta = CATEGORY_META[ex.category];
    if (!trend) {
      return `
        <div class="card exercise-chart-card" style="border-top-color:${meta.color}">
          <div class="entry-head">
            <span class="badge" style="background:${meta.color}22;color:${meta.color}">${meta.icon}<span>${meta.label}</span></span>
            <strong>${escapeHtml(ex.name)}</strong>
          </div>
          <p class="empty-hint">Нет записей за этот период</p>
        </div>
      `;
    }

    const svg = renderLineChartSVG(trend.points, meta.color);
    const pctBadge = trend.hasEnough
      ? `<span class="pct-badge ${trend.pctChange >= 0 ? 'up' : 'down'}">${trend.pctChange >= 0 ? ICONS.up : ICONS.down}<span>${Math.abs(trend.pctChange).toFixed(1)}%</span></span>`
      : `<span class="pct-badge muted">мало данных</span>`;

    return `
      <div class="card exercise-chart-card" style="border-top-color:${meta.color}">
        <div class="entry-head">
          <span class="badge" style="background:${meta.color}22;color:${meta.color}">${meta.icon}<span>${meta.label}</span></span>
          <strong>${escapeHtml(ex.name)}</strong>
          ${pctBadge}
        </div>
        ${svg}
        <div class="chart-footer">
          <span>${formatDateHuman(trend.points[0].date)}: ${formatMetric(ex.category, trend.startAvg)}</span>
          <span>${formatDateHuman(trend.points[trend.points.length - 1].date)}: ${formatMetric(ex.category, trend.endAvg)}</span>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = cards || '<p class="empty-hint">Добавьте упражнения на вкладке «Упражнения».</p>';
}

function renderLineChartSVG(points, color) {
  const width = 300;
  const height = 100;
  const padding = 10;

  if (points.length === 1) {
    return `<svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      <circle cx="${width / 2}" cy="${height / 2}" r="4" fill="${color}"></circle>
    </svg>`;
  }

  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L${coords[coords.length - 1][0].toFixed(1)},${height - padding} L${coords[0][0].toFixed(1)},${height - padding} Z`;

  const dots = coords.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${color}"></circle>`).join('');

  return `<svg viewBox="0 0 ${width} ${height}" class="chart-svg">
    <path d="${areaPath}" fill="${color}22" stroke="none"></path>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2"></path>
    ${dots}
  </svg>`;
}

// ---------- Utils ----------

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Init ----------

// ---------- Калькулятор блинов ----------

const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS = {
  25: '#e5484d',
  20: '#3b82f6',
  15: '#eab308',
  10: '#22c55e',
  5: '#e4e4e7',
  2.5: '#27272a',
  1.25: '#9ca3af'
};

function calculatePlates(perSideWeight) {
  let remaining = Math.max(0, perSideWeight);
  const plates = [];
  PLATE_SIZES.forEach(size => {
    let count = 0;
    while (remaining + 1e-9 >= size) {
      remaining -= size;
      count++;
    }
    if (count > 0) plates.push({ size, count });
  });
  return { plates, remainder: Math.round(remaining * 100) / 100 };
}

function renderPlateResult() {
  const targetInput = document.getElementById('plate-target');
  const barInput = document.getElementById('plate-bar');
  const resultEl = document.getElementById('plate-result');
  if (!targetInput || !barInput || !resultEl) return;

  const target = parseFloat(targetInput.value);
  const bar = parseFloat(barInput.value) || 0;

  if (isNaN(target) || target <= bar) {
    resultEl.innerHTML = '<p class="empty-hint">Введите вес больше веса грифа</p>';
    return;
  }

  const perSide = (target - bar) / 2;
  const { plates, remainder } = calculatePlates(perSide);

  if (plates.length === 0) {
    resultEl.innerHTML = '<p class="empty-hint">Блины не нужны — это вес одного грифа</p>';
    return;
  }

  const chipsHtml = plates.map(p => `
    <div class="plate-chip" style="border-color:${PLATE_COLORS[p.size] || '#9ca3af'}">
      <span class="plate-dot" style="background:${PLATE_COLORS[p.size] || '#9ca3af'}"></span>
      <span>${p.size} кг × ${p.count}</span>
    </div>
  `).join('');

  resultEl.innerHTML = `
    <div class="calc-hint">На каждую сторону (${perSide.toFixed(2)} кг):</div>
    <div class="plate-chips">${chipsHtml}</div>
    ${remainder > 0.01 ? `<div class="calc-hint">Остаток ${remainder.toFixed(2)} кг — нет подходящих блинов</div>` : ''}
  `;
}

// ---------- Калькулятор 1ПМ ----------

function renderOrmResult() {
  const weightInput = document.getElementById('orm-weight');
  const repsInput = document.getElementById('orm-reps');
  const resultEl = document.getElementById('orm-result');
  if (!weightInput || !repsInput || !resultEl) return;

  const w = parseFloat(weightInput.value);
  const r = parseFloat(repsInput.value);

  if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) {
    resultEl.innerHTML = '<p class="empty-hint">Введите вес и повторы</p>';
    return;
  }

  const orm = estimateOneRepMax(w, r);
  resultEl.innerHTML = `
    <div class="calc-big-value">${orm.toFixed(1)} кг</div>
    <div class="calc-hint">Расчётный одноповторный максимум (формула Эпли)</div>
  `;
}

// ---------- Данные и инструменты (модальное окно) ----------

function openToolsModal() {
  const modal = document.getElementById('tools-modal');
  if (modal) modal.hidden = false;
}

function closeToolsModal() {
  const modal = document.getElementById('tools-modal');
  if (modal) modal.hidden = true;
}

function exportData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises: state.exercises,
    entries: state.entries,
    sessions: state.sessions
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch {
      alert('Файл повреждён или это не JSON.');
      return;
    }
    if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.entries)) {
      alert('Неверный формат файла.');
      return;
    }
    if (!confirm('Импорт заменит все текущие данные (упражнения, история, тренировки). Продолжить?')) return;

    state.exercises = data.exercises;
    state.entries = data.entries;
    state.sessions = Array.isArray(data.sessions) ? data.sessions : [];
    saveExercises();
    saveEntries();
    saveSessions();
    closeToolsModal();
    render();
    alert('Данные успешно импортированы.');
  };
  reader.readAsText(file);
}

function init() {
  loadState();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  render();
  setInterval(tickTimers, 1000);

  const toolsBtn = document.getElementById('tools-btn');
  if (toolsBtn) toolsBtn.addEventListener('click', openToolsModal);

  const toolsCloseBtn = document.getElementById('tools-close-btn');
  if (toolsCloseBtn) toolsCloseBtn.addEventListener('click', closeToolsModal);

  const toolsModal = document.getElementById('tools-modal');
  if (toolsModal) {
    toolsModal.addEventListener('click', (e) => {
      if (e.target === toolsModal) closeToolsModal();
    });
  }

  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);

  const importBtn = document.getElementById('import-data-btn');
  const importInput = document.getElementById('import-file-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importDataFromFile(file);
      e.target.value = '';
    });
  }

  const plateTarget = document.getElementById('plate-target');
  const plateBar = document.getElementById('plate-bar');
  if (plateTarget && plateBar) {
    plateTarget.addEventListener('input', renderPlateResult);
    plateBar.addEventListener('input', renderPlateResult);
  }

  const ormWeight = document.getElementById('orm-weight');
  const ormReps = document.getElementById('orm-reps');
  if (ormWeight && ormReps) {
    ormWeight.addEventListener('input', renderOrmResult);
    ormReps.addEventListener('input', renderOrmResult);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
