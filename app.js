// Трекер тренировок — вся логика приложения. Данные хранятся только в localStorage.

const STORAGE_KEYS = {
  exercises: 'workout:exercises',
  entries: 'workout:entries',
  seeded: 'workout:seeded',
  restTimer: 'workout:restTimer',
  session: 'workout:session',
  sessions: 'workout:sessions',
  plans: 'workout:plans',
  activePlan: 'workout:activePlan',
  barWeight: 'workout:barWeight',
  bodyweight: 'workout:bodyweight',
  gender: 'workout:gender',
  height: 'workout:height',
  bodyTypeOverride: 'workout:bodyTypeOverride'
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
  calendar: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>',
  plan: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
  play: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  drop: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/></svg>',
  lightbulb: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.6.55 1 1.4 1 2.2V16h6v-.3c0-.8.4-1.65 1-2.2A6 6 0 0 0 12 3z"/></svg>',
  image: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'
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

const DEFAULT_EXERCISES_MALE = [
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

const DEFAULT_EXERCISES_FEMALE = [
  { name: 'Присед со штангой', category: 'strength' },
  { name: 'Румынская тяга', category: 'strength' },
  { name: 'Ягодичный мост', category: 'strength' },
  { name: 'Выпады с гантелями', category: 'strength' },
  { name: 'Отведение ноги в тренажёре', category: 'strength' },
  { name: 'Гиперэкстензия', category: 'strength' },
  { name: 'Беговая дорожка (длительно)', category: 'endurance' },
  { name: 'Велотренажёр', category: 'endurance' },
  { name: 'Гребной тренажёр', category: 'endurance' },
  { name: 'Спринт на дорожке', category: 'speed' }
];

function defaultExercisesFor(gender) {
  return gender === 'female' ? DEFAULT_EXERCISES_FEMALE : DEFAULT_EXERCISES_MALE;
}

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
  lastPR: null,
  plans: [],
  barWeight: 20,
  bodyweightLogs: [],
  activePlanId: null,
  expandedPlanExerciseId: null,
  planBuilder: { editingPlanId: null, name: '', exerciseIds: [] },
  showPlanPicker: false,
  showPlanExtra: false,
  needsOnboarding: false,
  heightCm: null,
  bodyTypeOverride: null,
  progressPhotos: [],
  progressPhotosLoaded: false,
  viewingPhotoDate: null,
  tipsCategory: 'technique'
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

  state.needsOnboarding = !localStorage.getItem(STORAGE_KEYS.seeded) && state.exercises.length === 0;

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

  try {
    state.plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.plans)) || [];
  } catch { state.plans = []; }

  const storedBarWeight = parseFloat(localStorage.getItem(STORAGE_KEYS.barWeight));
  state.barWeight = isNaN(storedBarWeight) ? 20 : storedBarWeight;

  try {
    state.bodyweightLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.bodyweight)) || [];
  } catch { state.bodyweightLogs = []; }

  const storedHeight = parseFloat(localStorage.getItem(STORAGE_KEYS.height));
  state.heightCm = isNaN(storedHeight) ? null : storedHeight;
  state.bodyTypeOverride = localStorage.getItem(STORAGE_KEYS.bodyTypeOverride) || null;

  state.activePlanId = localStorage.getItem(STORAGE_KEYS.activePlan) || null;
  if (state.activePlanId && !state.plans.find(p => p.id === state.activePlanId)) {
    state.activePlanId = null; // план мог быть удалён — не оставляем висячую ссылку
  }
}

function saveExercises() {
  localStorage.setItem(STORAGE_KEYS.exercises, JSON.stringify(state.exercises));
}

function seedDefaultExercises(gender) {
  state.exercises = defaultExercisesFor(gender).map(e => ({ id: uid(), ...e }));
  localStorage.setItem(STORAGE_KEYS.seeded, '1');
  localStorage.setItem(STORAGE_KEYS.gender, gender);
  saveExercises();
}

function addMissingDefaultExercises(gender) {
  const existingNames = new Set(state.exercises.map(e => e.name));
  let added = 0;
  defaultExercisesFor(gender).forEach(e => {
    if (!existingNames.has(e.name)) {
      state.exercises.push({ id: uid(), ...e });
      added++;
    }
  });
  if (added > 0) saveExercises();
  return added;
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

function savePlans() {
  localStorage.setItem(STORAGE_KEYS.plans, JSON.stringify(state.plans));
}

function saveBarWeight() {
  localStorage.setItem(STORAGE_KEYS.barWeight, String(state.barWeight));
}

function saveBodyweightLogs() {
  localStorage.setItem(STORAGE_KEYS.bodyweight, JSON.stringify(state.bodyweightLogs));
}

function upsertBodyweightLog(date, weight) {
  const existing = state.bodyweightLogs.find(l => l.date === date);
  if (existing) {
    existing.weight = weight;
  } else {
    state.bodyweightLogs.push({ date, weight });
  }
  saveBodyweightLogs();
}

function getLatestBodyweight() {
  if (!state.bodyweightLogs.length) return null;
  return [...state.bodyweightLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
}

function saveHeight() {
  if (state.heightCm) {
    localStorage.setItem(STORAGE_KEYS.height, String(state.heightCm));
  } else {
    localStorage.removeItem(STORAGE_KEYS.height);
  }
}

function saveBodyTypeOverride() {
  if (state.bodyTypeOverride) {
    localStorage.setItem(STORAGE_KEYS.bodyTypeOverride, state.bodyTypeOverride);
  } else {
    localStorage.removeItem(STORAGE_KEYS.bodyTypeOverride);
  }
}

function computeBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function bmiToBodyTypeId(bmi) {
  if (bmi === null) return null;
  if (bmi < 18.5) return 'thin';
  if (bmi < 25) return 'athletic';
  if (bmi < 30) return 'muscular';
  return 'bulky';
}

function saveActivePlanId() {
  if (state.activePlanId) {
    localStorage.setItem(STORAGE_KEYS.activePlan, state.activePlanId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.activePlan);
  }
}

function getPlan(id) {
  return state.plans.find(p => p.id === id);
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
  const activePlan = state.activePlanId ? getPlan(state.activePlanId) : null;
  state.sessions.push({
    date,
    startedAt: state.session.startedAt,
    endedAt,
    durationSec,
    totalSets: summary.totalSets,
    totalVolume: summary.totalVolume,
    exercisesCount: summary.exercisesCount,
    planName: activePlan ? activePlan.name : null
  });
  saveSessions();
  state.session = null;
  saveSession();
  skipRestTimer();

  if (state.activePlanId) exitPlan();
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
  updateGlobalStatusBar();
}

// ---------- Глобальная мини-полоса таймера (видна на любой вкладке и поверх модалки) ----------

function updateGlobalStatusBar() {
  const bar = document.getElementById('global-status');
  if (!bar) return;

  const sessionItem = document.getElementById('global-session-item');
  const sessionTimeEl = document.getElementById('global-session-time');
  if (state.session) {
    sessionItem.hidden = false;
    sessionTimeEl.textContent = formatDuration(Math.floor((Date.now() - state.session.startedAt) / 1000));
  } else {
    sessionItem.hidden = true;
  }

  const restItem = document.getElementById('global-rest-item');
  const restTimeEl = document.getElementById('global-rest-time');
  if (state.restTimer) {
    const remaining = Math.max(0, Math.ceil((state.restTimer.endAt - Date.now()) / 1000));
    restItem.hidden = false;
    restItem.classList.toggle('rest-done', remaining <= 0);
    restTimeEl.textContent = formatSeconds(remaining);
  } else {
    restItem.hidden = true;
  }

  bar.hidden = !state.session && !state.restTimer;
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
  if (state.tab === 'tips') renderTips();

  updateGlobalStatusBar();
}

function switchTab(tab) {
  state.tab = tab;
  state.editingSet = null;
  state.lastPR = null;
  render();
  window.scrollTo(0, 0);
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

// ---------- Планы тренировок ----------

function createOrUpdatePlan(planData) {
  if (planData.editingPlanId) {
    const plan = getPlan(planData.editingPlanId);
    if (!plan) return;
    plan.name = planData.name;
    plan.exerciseIds = planData.exerciseIds;
  } else {
    state.plans.push({ id: uid(), name: planData.name, exerciseIds: planData.exerciseIds });
  }
  savePlans();
}

function deletePlanWithUndo(id) {
  const plan = getPlan(id);
  if (!plan) return;
  const index = state.plans.indexOf(plan);

  state.plans = state.plans.filter(p => p.id !== id);
  if (state.activePlanId === id) {
    state.activePlanId = null;
    saveActivePlanId();
  }
  savePlans();
  renderLibraryList();

  showUndoToast(`План «${plan.name}» удалён`, () => {
    state.plans.splice(index, 0, plan);
    savePlans();
    if (state.tab === 'library') renderLibraryList();
    if (state.tab === 'log') renderLog();
  });
}

function startPlan(planId) {
  const plan = getPlan(planId);
  if (!plan) return;
  state.activePlanId = planId;
  state.expandedPlanExerciseId = plan.exerciseIds[0] || null;
  state.showPlanPicker = false;
  saveActivePlanId();
  if (!state.session) startSession();
}

function exitPlan() {
  state.activePlanId = null;
  state.expandedPlanExerciseId = null;
  state.showPlanExtra = false;
  saveActivePlanId();
}

function isPlanExerciseDone(exerciseId, date) {
  const entry = state.entries.find(e => e.exerciseId === exerciseId && e.date === date);
  return !!(entry && entry.sets.length > 0);
}

// ---------- Tab: Log (Сегодня) ----------

function renderLog() {
  const panel = document.getElementById('panel-log');

  let activePlan = state.activePlanId ? getPlan(state.activePlanId) : null;
  if (state.activePlanId && !activePlan) {
    state.activePlanId = null; // план удалили, пока шла тренировка
    activePlan = null;
  }

  panel.innerHTML = `
    ${renderTimerCard()}
    ${renderRestWidget()}
    ${renderPRBanner()}

    <div class="card">
      <label class="field-label">Дата тренировки</label>
      <input type="date" id="log-date" value="${state.logDate}" max="${todayISO()}">
    </div>

    ${activePlan ? renderPlanGuidedSection(activePlan) : renderFreeformSection()}
  `;

  document.getElementById('log-date').addEventListener('change', (e) => {
    state.logDate = e.target.value;
    renderLog();
  });

  attachTimerCardListeners();

  if (activePlan) {
    attachPlanGuidedListeners(panel);
  } else {
    attachFreeformListeners(panel);
  }
}

// ---------- Лог: свободный режим (поиск/избранное/один выбранный элемент) ----------

function renderExercisePickerCard() {
  if (!state.logExerciseId || !getExercise(state.logExerciseId)) {
    state.logExerciseId = state.exercises.length ? state.exercises[0].id : null;
  }

  const sortedExercises = [...state.exercises].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  const exOptions = sortedExercises
    .map(e => `<option value="${e.id}" ${e.id === state.logExerciseId ? 'selected' : ''}>${e.favorite ? '★ ' : ''}${escapeHtml(e.name)} (${CATEGORY_META[e.category].label})</option>`)
    .join('');

  const favorites = state.exercises.filter(e => e.favorite);
  const selectedEx = getExercise(state.logExerciseId);
  const todayEntryForSelected = selectedEx
    ? state.entries.find(e => e.exerciseId === selectedEx.id && e.date === state.logDate)
    : null;

  return `
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
  `;
}

function attachExercisePickerListeners(panel) {
  const exSelect = document.getElementById('log-exercise');
  const renderFields = () => {
    const ex = getExercise(exSelect.value);
    document.getElementById('log-fields').innerHTML = ex ? setFieldsHtml(ex.category) : '';
    attachPlateHintListener('log-fields');
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
}

function renderFreeformSection() {
  const dayEntries = state.entries.filter(e => e.date === state.logDate);
  return `
    ${renderExercisePickerCard()}
    <div class="section-title">Сегодня записано</div>
    <div id="log-entries">${dayEntries.length ? dayEntries.map(renderEntryCard).join('') : '<p class="empty-hint">Пока пусто. Добавьте первый подход выше.</p>'}</div>
  `;
}

function attachFreeformListeners(panel) {
  attachExercisePickerListeners(panel);
  attachEntryCardListeners(panel, renderLog);
}

// ---------- Лог: режим по плану тренировки ----------

function renderPlanGuidedSection(plan) {
  const planExIdSet = new Set(plan.exerciseIds);
  const doneCount = plan.exerciseIds.filter(id => isPlanExerciseDone(id, state.logDate)).length;

  const itemsHtml = plan.exerciseIds.map((exId, i) => {
    const ex = getExercise(exId);
    if (!ex) return '';
    const meta = CATEGORY_META[ex.category];
    const done = isPlanExerciseDone(exId, state.logDate);
    const expanded = state.expandedPlanExerciseId === exId;
    const entry = state.entries.find(e => e.exerciseId === exId && e.date === state.logDate);

    return `
      <div class="plan-exercise ${done ? 'plan-exercise-done' : ''} ${expanded ? 'plan-exercise-open' : ''}">
        <button class="plan-exercise-head" data-plan-ex-toggle="${exId}">
          <span class="plan-exercise-num">${done ? ICONS.check : i + 1}</span>
          <span class="plan-exercise-name">${escapeHtml(ex.name)}</span>
          <span class="entry-row-cat" style="color:${meta.color}">${meta.icon}</span>
        </button>
        ${expanded ? `
          <div class="plan-exercise-body">
            ${renderLastHintHtml(ex)}
            <div id="plan-fields" class="set-fields">${setFieldsHtml(ex.category)}</div>
            <button class="btn-primary" id="plan-add-set-btn" data-plan-ex="${exId}">+ Добавить подход</button>
            ${entry && entry.sets.length ? renderSetsListHtml(entry, ex) : ''}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const extraEntries = state.entries.filter(e => e.date === state.logDate && !planExIdSet.has(e.exerciseId));

  return `
    <div class="card plan-progress-card">
      <div class="plan-progress-head">
        <span class="plan-progress-title">${ICONS.plan}<strong>${escapeHtml(plan.name)}</strong></span>
        <span class="plan-progress-count">${doneCount}/${plan.exerciseIds.length}</span>
      </div>
      <button class="btn-ghost" id="exit-plan-btn">Выйти из плана</button>
    </div>

    <div id="plan-exercise-list">${itemsHtml}</div>

    <div class="section-title">Вне плана</div>
    ${state.showPlanExtra ? renderExercisePickerCard() : `<button class="btn-secondary" id="show-plan-extra-btn">${ICONS.search}<span>Добавить упражнение вне плана</span></button>`}
    ${extraEntries.length ? `<div id="plan-extra-entries">${extraEntries.map(renderEntryCard).join('')}</div>` : ''}
  `;
}

function attachPlanGuidedListeners(panel) {
  const exitBtn = document.getElementById('exit-plan-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      exitPlan();
      render();
    });
  }

  panel.querySelectorAll('[data-plan-ex-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const exId = btn.dataset.planExToggle;
      state.expandedPlanExerciseId = state.expandedPlanExerciseId === exId ? null : exId;
      renderLog();
    });
  });

  attachPlateHintListener('plan-fields');

  const planAddSetBtn = document.getElementById('plan-add-set-btn');
  if (planAddSetBtn) {
    planAddSetBtn.addEventListener('click', () => {
      const ex = getExercise(planAddSetBtn.dataset.planEx);
      if (!ex) return;
      const set = readSetFields(ex.category, 'plan-fields');
      if (!set) return;
      ensureAudioUnlocked();
      addSetToLog(ex.id, state.logDate, set);
    });
  }

  const showExtraBtn = document.getElementById('show-plan-extra-btn');
  if (showExtraBtn) {
    showExtraBtn.addEventListener('click', () => {
      state.showPlanExtra = true;
      renderLog();
    });
  }

  if (state.showPlanExtra) {
    attachExercisePickerListeners(panel);
  }

  attachEntryCardListeners(panel, renderLog);
}

// ---------- Карточка таймера тренировки (+ запуск по плану) ----------

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
  const planPickerHtml = state.showPlanPicker && state.plans.length
    ? `<div class="plan-picker">${state.plans.map(p => `
        <button class="plan-picker-item" data-start-plan="${p.id}">
          ${ICONS.play}
          <span class="plan-picker-name">${escapeHtml(p.name)}</span>
          <span class="muted">${p.exerciseIds.length} упр.</span>
        </button>
      `).join('')}</div>`
    : '';

  return `
    <div class="hero-stat hero-stat-idle">
      <button class="btn-primary" id="start-session-btn">Начать тренировку</button>
      ${state.plans.length ? `<button class="btn-ghost" id="toggle-plan-picker-btn">${state.showPlanPicker ? 'Скрыть планы' : 'Начать по плану'}</button>` : ''}
      ${planPickerHtml}
      ${last ? `<div class="timer-last">Последняя: ${formatSessionSummary(last)}</div>` : ''}
    </div>
  `;
}

function attachTimerCardListeners() {
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

  const togglePlanPickerBtn = document.getElementById('toggle-plan-picker-btn');
  if (togglePlanPickerBtn) {
    togglePlanPickerBtn.addEventListener('click', () => {
      state.showPlanPicker = !state.showPlanPicker;
      renderLog();
    });
  }

  document.querySelectorAll('[data-start-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      ensureAudioUnlocked();
      startPlan(btn.dataset.startPlan);
      render();
    });
  });

  const prBannerClose = document.getElementById('pr-banner-close');
  if (prBannerClose) {
    prBannerClose.addEventListener('click', () => {
      state.lastPR = null;
      renderLog();
    });
  }

  const restMinusBtn = document.getElementById('rest-minus-btn');
  if (restMinusBtn) restMinusBtn.addEventListener('click', () => adjustRestTimer(-15));

  const restPlusBtn = document.getElementById('rest-plus-btn');
  if (restPlusBtn) restPlusBtn.addEventListener('click', () => adjustRestTimer(15));

  const restSkipBtn = document.getElementById('rest-skip-btn');
  if (restSkipBtn) restSkipBtn.addEventListener('click', skipRestTimer);
}

function formatSessionSummary(session) {
  const parts = [];
  if (session.planName) parts.push(session.planName);
  parts.push(formatDuration(session.durationSec), `${session.totalSets || 0} подх.`);
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
  const fieldsHtml = fields.map(f => `
    <div class="set-field">
      <label>${labels[f]}</label>
      <input type="number" inputmode="decimal" step="0.1" min="0" data-field="${f}" placeholder="${labels[f]}">
    </div>
  `).join('');
  const hintHtml = fields.includes('weight') ? '<div class="plate-inline-hint" data-plate-inline-hint hidden></div>' : '';
  return fieldsHtml + hintHtml;
}

function updateInlinePlateHint(container) {
  const weightInput = container.querySelector('[data-field="weight"]');
  const hintEl = container.querySelector('[data-plate-inline-hint]');
  if (!weightInput || !hintEl) return;

  const weight = parseFloat(weightInput.value);
  const bar = state.barWeight || 20;
  if (isNaN(weight) || weight <= bar) {
    hintEl.hidden = true;
    hintEl.innerHTML = '';
    return;
  }

  const perSide = (weight - bar) / 2;
  const { plates, remainder } = calculatePlates(perSide);
  if (!plates.length) {
    hintEl.hidden = true;
    hintEl.innerHTML = '';
    return;
  }

  const chipsHtml = plates.map(p => `
    <span class="plate-chip-mini" style="border-color:${PLATE_COLORS[p.size] || '#9ca3af'}">
      <span class="plate-dot" style="background:${PLATE_COLORS[p.size] || '#9ca3af'}"></span>${p.size}×${p.count}
    </span>
  `).join('');

  const shortBy = remainder * 2;
  const achievable = weight - shortBy;
  const warningHtml = shortBy > 0.01
    ? `<span class="plate-remainder">⚠ Нет блина на ${shortBy.toFixed(2)} кг — соберётся ${achievable.toFixed(2)} кг вместо ${weight}</span>`
    : '';

  hintEl.hidden = false;
  hintEl.innerHTML = `${chipsHtml}${warningHtml}`;
}

function attachPlateHintListener(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const weightInput = container.querySelector('[data-field="weight"]');
  if (!weightInput) return;
  updateInlinePlateHint(container);
  weightInput.addEventListener('input', () => updateInlinePlateHint(container));
}

function readSetFields(category, containerId = 'log-fields') {
  const fields = FIELD_CONFIG[category];
  const set = {};
  let hasValue = false;
  fields.forEach(f => {
    const input = document.querySelector(`#${containerId} [data-field="${f}"]`);
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

function renderSetsListHtml(entry, ex) {
  const fields = FIELD_CONFIG[ex.category];
  const labels = { weight: 'кг', reps: 'повт', duration: 'мин', distance: 'км' };
  const fieldLabels = { weight: 'Вес, кг', reps: 'Повторы', duration: 'Время, мин', distance: 'Дистанция, км' };

  return entry.sets.map((s, i) => {
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
}

function renderEntryCard(entry) {
  const ex = getExercise(entry.exerciseId);
  if (!ex) return '';
  const meta = CATEGORY_META[ex.category];

  return `
    <div class="entry-row" style="border-left-color:${meta.color}">
      <div class="entry-row-head">
        <strong>${escapeHtml(ex.name)}</strong>
        <span class="entry-row-cat" style="color:${meta.color}">${meta.icon}<span>${meta.label}</span></span>
      </div>
      ${renderSetsListHtml(entry, ex)}
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

    <div class="section-title">${ICONS.plan}<span>Мои тренировки</span></div>
    <div class="card">
      <label class="field-label">Название плана</label>
      <input type="text" id="plan-name-input" placeholder="Например: День 1 — Жим" value="${escapeHtml(state.planBuilder.name)}">

      <label class="field-label">Добавить упражнение в план</label>
      <select id="plan-add-exercise-select">
        ${state.exercises.map(e => `<option value="${e.id}">${escapeHtml(e.name)} (${CATEGORY_META[e.category].label})</option>`).join('')}
      </select>
      <button class="btn-secondary" id="plan-add-exercise-btn">${ICONS.plan}<span>Добавить в план</span></button>

      <div id="plan-builder-list"></div>

      <button class="btn-primary" id="plan-save-btn">${state.planBuilder.editingPlanId ? 'Сохранить изменения' : 'Создать план'}</button>
      ${state.planBuilder.editingPlanId ? `<button class="btn-ghost" id="plan-cancel-btn">Отменить редактирование</button>` : ''}
    </div>
    <div id="plans-list"></div>
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

  document.getElementById('plan-name-input').addEventListener('input', (e) => {
    state.planBuilder.name = e.target.value;
  });

  document.getElementById('plan-add-exercise-btn').addEventListener('click', () => {
    const select = document.getElementById('plan-add-exercise-select');
    const exId = select.value;
    if (!exId || state.planBuilder.exerciseIds.includes(exId)) return;
    state.planBuilder.exerciseIds.push(exId);
    renderPlanBuilderList();
  });

  document.getElementById('plan-save-btn').addEventListener('click', () => {
    const name = state.planBuilder.name.trim();
    if (!name || state.planBuilder.exerciseIds.length === 0) return;
    createOrUpdatePlan({
      editingPlanId: state.planBuilder.editingPlanId,
      name,
      exerciseIds: [...state.planBuilder.exerciseIds]
    });
    state.planBuilder = { editingPlanId: null, name: '', exerciseIds: [] };
    renderLibrary();
  });

  const cancelBtn = document.getElementById('plan-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      state.planBuilder = { editingPlanId: null, name: '', exerciseIds: [] };
      renderLibrary();
    });
  }

  renderLibraryList();
  renderPlanBuilderList();
  renderPlansList();
}

function renderPlanBuilderList() {
  const container = document.getElementById('plan-builder-list');
  if (!container) return;

  const ids = state.planBuilder.exerciseIds;
  if (ids.length === 0) {
    container.innerHTML = '<p class="empty-hint">Добавьте хотя бы одно упражнение в план.</p>';
    return;
  }

  container.innerHTML = ids.map((exId, i) => {
    const ex = getExercise(exId);
    if (!ex) return '';
    const meta = CATEGORY_META[ex.category];
    return `
      <div class="plan-builder-row">
        <span class="plan-builder-num">${i + 1}</span>
        <span class="badge" style="background:${meta.color}22;color:${meta.color}">${meta.icon}</span>
        <span class="plan-builder-name">${escapeHtml(ex.name)}</span>
        <span class="plan-builder-actions">
          <button class="icon-btn" data-plan-move-up="${i}" aria-label="Выше" ${i === 0 ? 'disabled' : ''}>${ICONS.up}</button>
          <button class="icon-btn" data-plan-move-down="${i}" aria-label="Ниже" ${i === ids.length - 1 ? 'disabled' : ''}>${ICONS.down}</button>
          <button class="icon-btn" data-plan-remove="${i}" aria-label="Убрать из плана">${ICONS.close}</button>
        </span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-plan-move-up]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.planMoveUp);
      const ids2 = state.planBuilder.exerciseIds;
      [ids2[i - 1], ids2[i]] = [ids2[i], ids2[i - 1]];
      renderPlanBuilderList();
    });
  });

  container.querySelectorAll('[data-plan-move-down]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.planMoveDown);
      const ids2 = state.planBuilder.exerciseIds;
      [ids2[i + 1], ids2[i]] = [ids2[i], ids2[i + 1]];
      renderPlanBuilderList();
    });
  });

  container.querySelectorAll('[data-plan-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.planRemove);
      state.planBuilder.exerciseIds.splice(i, 1);
      renderPlanBuilderList();
    });
  });
}

function renderPlansList() {
  const container = document.getElementById('plans-list');
  if (!container) return;

  if (state.plans.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = state.plans.map(plan => `
    <div class="library-row">
      <span>${escapeHtml(plan.name)} <span class="muted">(${plan.exerciseIds.length} упр.)</span></span>
      <span class="set-row-actions">
        <button class="icon-btn" data-edit-plan="${plan.id}" aria-label="Изменить">${ICONS.edit}</button>
        <button class="icon-btn" data-delete-plan="${plan.id}" aria-label="Удалить">${ICONS.trash}</button>
      </span>
    </div>
  `).join('');

  container.querySelectorAll('[data-edit-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = getPlan(btn.dataset.editPlan);
      if (!plan) return;
      state.planBuilder = { editingPlanId: plan.id, name: plan.name, exerciseIds: [...plan.exerciseIds] };
      renderLibrary();
    });
  });

  container.querySelectorAll('[data-delete-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      deletePlanWithUndo(btn.dataset.deletePlan);
    });
  });
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
      deleteExerciseWithUndo(btn.dataset.deleteEx);
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
  const planNames = [...new Set(sessions.map(s => s.planName).filter(Boolean))];

  const parts = [formatDuration(totalDuration), `${totalSets} подх.`];
  if (totalVolume > 0) parts.push(`${Math.round(totalVolume)} кг`);

  return `
    <div class="day-summary">
      ${ICONS.timer}<span>${parts.join(' · ')}</span>
      ${planNames.length ? `<span class="day-summary-plan">${ICONS.plan}<span>${escapeHtml(planNames.join(', '))}</span></span>` : ''}
    </div>
  `;
}

// ---------- Tab: Analytics (Аналитика) ----------

function renderAnalytics() {
  const panel = document.getElementById('panel-analytics');
  const startDate = daysAgoISO(state.analyticsPeriod);
  const endDate = todayISO();

  panel.innerHTML = `
    ${renderStreakCalendar()}
    ${renderBodyweightSection(startDate, endDate)}
    ${renderBodyTypeSection()}
    ${renderProgressPhotosSection()}
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

  attachBodyweightListeners();
  attachBodyTypeListeners();
  attachProgressPhotoListeners();
  renderSummaryCards(startDate, endDate);
  renderExerciseCharts(startDate, endDate);
}

// ---------- Вес тела ----------

function bodyweightTrend(startDate, endDate) {
  const points = state.bodyweightLogs
    .filter(l => l.date >= startDate && l.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(l => ({ date: l.date, value: l.weight }));

  if (points.length === 0) return null;

  const chunk = Math.max(1, Math.floor(points.length / 3));
  const startAvg = average(points.slice(0, chunk).map(p => p.value));
  const endAvg = average(points.slice(-chunk).map(p => p.value));

  return { points, startAvg, endAvg, hasEnough: points.length >= 2 };
}

function renderBodyweightSection(startDate, endDate) {
  const todayLog = state.bodyweightLogs.find(l => l.date === todayISO());
  const latest = getLatestBodyweight();
  const trend = bodyweightTrend(startDate, endDate);

  const deltaBadge = trend && trend.hasEnough
    ? (() => {
        const delta = trend.endAvg - trend.startAvg;
        const sign = delta >= 0 ? '+' : '';
        return `<span class="pct-badge neutral">${delta >= 0 ? ICONS.up : ICONS.down}<span>${sign}${delta.toFixed(1)} кг</span></span>`;
      })()
    : '';

  const chartHtml = trend
    ? renderLineChartSVG(trend.points, '#c9793f')
    : '<p class="empty-hint">Отмечайте вес регулярно, чтобы увидеть график.</p>';

  const chartFooter = trend
    ? `<div class="chart-footer">
        <span>${formatDateHuman(trend.points[0].date)}: ${trend.points[0].value} кг</span>
        <span>${formatDateHuman(trend.points[trend.points.length - 1].date)}: ${trend.points[trend.points.length - 1].value} кг</span>
      </div>`
    : '';

  return `
    <div class="card bodyweight-card">
      <div class="entry-head">
        <strong>Вес тела</strong>
        ${deltaBadge}
      </div>
      <div class="bodyweight-input-row">
        <input type="number" id="bodyweight-input" inputmode="decimal" step="0.1" min="0" placeholder="Вес, кг" value="${todayLog ? todayLog.weight : ''}">
        <input type="number" id="body-height-input" inputmode="numeric" step="1" min="0" placeholder="Рост, см" value="${state.heightCm || ''}">
        <button class="btn-secondary bodyweight-save-btn" id="bodyweight-save-btn">${ICONS.check}<span>Сохранить</span></button>
      </div>
      ${latest ? `<div class="last-hint">Последний раз: ${formatDateHuman(latest.date)} — ${latest.weight} кг</div>` : ''}
      ${chartHtml}
      ${chartFooter}
    </div>
  `;
}

function attachBodyweightListeners() {
  const saveBtn = document.getElementById('bodyweight-save-btn');
  const input = document.getElementById('bodyweight-input');
  const heightInput = document.getElementById('body-height-input');
  if (!saveBtn || !input) return;
  saveBtn.addEventListener('click', () => {
    const weight = parseFloat(input.value);
    if (heightInput) {
      const height = parseFloat(heightInput.value);
      state.heightCm = isNaN(height) || height <= 0 ? null : height;
      saveHeight();
    }
    if (isNaN(weight) || weight <= 0) {
      renderAnalytics();
      return;
    }
    upsertBodyweightLog(todayISO(), weight);
    renderAnalytics();
  });
}

// ---------- Типаж телосложения (по ИМТ, с ручным переключением) ----------

const BODY_TYPES = [
  { id: 'thin', label: 'Худой', bmiHint: 'ИМТ < 18.5', img: 'body-type-thin.png' },
  { id: 'athletic', label: 'Спортивный', bmiHint: 'ИМТ 18.5–25', img: 'body-type-athletic.png' },
  { id: 'muscular', label: 'Атлет', bmiHint: 'ИМТ 25–30', img: 'body-type-muscular.png' },
  { id: 'bulky', label: 'Качок', bmiHint: 'ИМТ 30+', img: 'body-type-bulky.png' }
];

function renderBodyTypeSection() {
  const latestBW = getLatestBodyweight();
  const bmi = latestBW && state.heightCm ? computeBMI(latestBW.weight, state.heightCm) : null;
  const autoTypeId = bmiToBodyTypeId(bmi);
  const activeTypeId = state.bodyTypeOverride || autoTypeId;

  const tilesHtml = BODY_TYPES.map(t => `
    <button class="body-type-tile ${t.id === activeTypeId ? 'body-type-tile-active' : ''}" data-body-type="${t.id}">
      <span class="body-type-icon" style="--body-img: url('${t.img}')"></span>
      <span class="body-type-label">${t.label}</span>
      <span class="body-type-bmi">${t.bmiHint}</span>
    </button>
  `).join('');

  let noteHtml;
  if (!latestBW || !state.heightCm) {
    noteHtml = '<p class="empty-hint">Укажи рост и вес в карточке «Вес тела» для предположения — или просто выбери типаж вручную.</p>';
  } else if (state.bodyTypeOverride) {
    noteHtml = `<p class="modal-hint">Выбрано вручную. <button class="btn-ghost" id="body-type-reset-btn">Сбросить на авторасчёт по ИМТ</button></p>`;
  } else {
    noteHtml = `<p class="modal-hint">Предположение по ИМТ (${bmi.toFixed(1)}) — это приблизительно и не учитывает состав тела (мышцы/жир). Нажми на другой вариант, если не похоже.</p>`;
  }

  return `
    <div class="card body-type-card">
      <div class="entry-head"><strong>Типаж телосложения</strong></div>
      <div class="body-type-grid">${tilesHtml}</div>
      ${noteHtml}
    </div>
  `;
}

function attachBodyTypeListeners() {
  document.querySelectorAll('[data-body-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.bodyTypeOverride = btn.dataset.bodyType;
      saveBodyTypeOverride();
      renderAnalytics();
    });
  });
  const resetBtn = document.getElementById('body-type-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.bodyTypeOverride = null;
      saveBodyTypeOverride();
      renderAnalytics();
    });
  }
}

// ---------- Фото прогресса (хранятся в IndexedDB, не в localStorage/бэкапе) ----------

const PHOTO_DB_NAME = 'workout-photos';
const PHOTO_STORE_NAME = 'photos';

function openPhotoDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        db.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'date' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function savePhoto(date, dataUrl) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE_NAME, 'readwrite');
    tx.objectStore(PHOTO_STORE_NAME).put({ date, dataUrl });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deletePhotoRecord(date) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE_NAME, 'readwrite');
    tx.objectStore(PHOTO_STORE_NAME).delete(date);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllPhotos() {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE_NAME, 'readonly');
    const req = tx.objectStore(PHOTO_STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => a.date.localeCompare(b.date)));
    req.onerror = () => reject(req.error);
  });
}

async function loadProgressPhotos() {
  try {
    state.progressPhotos = await getAllPhotos();
  } catch {
    state.progressPhotos = [];
  }
  state.progressPhotosLoaded = true;
  if (state.tab === 'analytics') renderAnalytics();
}

function resizeImageFile(file, maxDim = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('image load failed'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function renderPhotoViewer(date) {
  const photo = state.progressPhotos.find(p => p.date === date);
  if (!photo) return '';
  return `
    <div class="photo-viewer-overlay" id="photo-viewer-overlay">
      <div class="photo-viewer-inner">
        <button class="icon-btn photo-viewer-close" id="photo-viewer-close-btn" aria-label="Закрыть">${ICONS.close}</button>
        <img src="${photo.dataUrl}" alt="${formatDateHuman(photo.date)}">
        <div class="photo-viewer-footer">
          <span>${formatDateHuman(photo.date)}</span>
          <button class="btn-ghost" id="photo-viewer-delete-btn">Удалить</button>
        </div>
      </div>
    </div>
  `;
}

function renderProgressPhotosSection() {
  const photos = state.progressPhotos;
  const todayHasPhoto = photos.some(p => p.date === todayISO());

  const galleryHtml = photos.length
    ? `<div class="photo-gallery">${photos.map(p => `
        <button class="photo-thumb" data-photo-date="${p.date}">
          <img src="${p.dataUrl}" alt="${formatDateHuman(p.date)}">
          <span class="photo-thumb-date">${formatDateHuman(p.date)}</span>
        </button>
      `).join('')}</div>`
    : '<p class="empty-hint">Пока нет фото. Загрузи первое, чтобы отслеживать визуальный прогресс.</p>';

  return `
    <div class="card photo-progress-card">
      <div class="entry-head"><strong>Фото прогресса</strong></div>
      <p class="modal-hint">Хранятся только в этом браузере, отдельно от резервной копии. По одному фото на день.</p>
      <input type="file" id="photo-upload-input" accept="image/*" hidden>
      <button class="btn-secondary" id="photo-upload-btn">${ICONS.image}<span>${todayHasPhoto ? 'Заменить фото за сегодня' : 'Загрузить фото'}</span></button>
      ${photos.length ? '<button class="btn-ghost" id="photo-export-btn">Скачать все фото</button>' : ''}
      ${galleryHtml}
    </div>
    ${state.viewingPhotoDate ? renderPhotoViewer(state.viewingPhotoDate) : ''}
  `;
}

function attachProgressPhotoListeners() {
  const uploadBtn = document.getElementById('photo-upload-btn');
  const fileInput = document.getElementById('photo-upload-input');
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const dataUrl = await resizeImageFile(file);
        await savePhoto(todayISO(), dataUrl);
        state.progressPhotos = await getAllPhotos();
        renderAnalytics();
      } catch {
        alert('Не удалось загрузить фото. Попробуйте другое изображение.');
      }
    });
  }

  document.querySelectorAll('[data-photo-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.viewingPhotoDate = btn.dataset.photoDate;
      renderAnalytics();
    });
  });

  const closeBtn = document.getElementById('photo-viewer-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      state.viewingPhotoDate = null;
      renderAnalytics();
    });
  }

  const overlay = document.getElementById('photo-viewer-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        state.viewingPhotoDate = null;
        renderAnalytics();
      }
    });
  }

  const deleteBtn = document.getElementById('photo-viewer-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Удалить это фото?')) return;
      const date = state.viewingPhotoDate;
      await deletePhotoRecord(date);
      state.progressPhotos = state.progressPhotos.filter(p => p.date !== date);
      state.viewingPhotoDate = null;
      renderAnalytics();
    });
  }

  const exportBtn = document.getElementById('photo-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      state.progressPhotos.forEach((p, i) => {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = p.dataUrl;
          a.download = `progress-photo-${p.date}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, i * 150);
      });
    });
  }
}

function getTrainedDatesSet() {
  const set = new Set();
  state.entries.forEach(e => set.add(e.date));
  state.sessions.forEach(s => set.add(s.date));
  return set;
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = (d.getDay() + 6) % 7; // 0=Пн ... 6=Вс
  d.setDate(d.getDate() - dayOfWeek);
  return d;
}

function countTrainedDaysInWeek(trainedDates, weekStart, today) {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    if (d > today) break;
    if (trainedDates.has(toISO(d))) count++;
  }
  return count;
}

// Очки серии = сумма тренировок с последней полностью пропущенной недели.
// Как только целая неделя проходит без единого визита, счёт обнуляется и начинается заново.
function computeStreakPoints(trainedDates, today) {
  const thisWeekStart = getWeekStart(today);
  let points = countTrainedDaysInWeek(trainedDates, thisWeekStart, today);

  const cursor = new Date(thisWeekStart);
  cursor.setDate(cursor.getDate() - 7);
  while (true) {
    const weekCount = countTrainedDaysInWeek(trainedDates, cursor, today);
    if (weekCount === 0) break;
    points += weekCount;
    cursor.setDate(cursor.getDate() - 7);
  }
  return points;
}

const WEEKDAY_LETTERS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function renderStreakCalendar() {
  const trainedDates = getTrainedDatesSet();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const points = computeStreakPoints(trainedDates, today);

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const daysHtml = days.map(d => {
    const iso = toISO(d);
    const trained = trainedDates.has(iso);
    const isToday = iso === toISO(today);
    const dow = (d.getDay() + 6) % 7;
    return `
      <div class="streak-day ${isToday ? 'streak-day-today' : ''}">
        <div class="streak-dot ${trained ? 'streak-dot-trained' : ''}"></div>
        <span class="streak-day-label">${WEEKDAY_LETTERS[dow]}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="streak-block">
      <div class="streak-points">
        ${ICONS.trophy}
        <span class="streak-points-value">${points}</span>
        <span class="streak-points-label">очков серии</span>
      </div>
      <div class="streak-week-row">${daysHtml}</div>
    </div>
  `;
}

function renderRecordsSection() {
  const rows = state.exercises
    .map(ex => ({ ex, best: getBestMetric(ex.id) }))
    .filter(r => r.best !== null)
    .sort((a, b) => a.ex.name.localeCompare(b.ex.name));

  if (rows.length === 0) return '';

  const latestBW = getLatestBodyweight();

  return `
    <div class="section-title">${ICONS.trophy}<span>Личные рекорды</span></div>
    ${rows.map(r => {
      const meta = CATEGORY_META[r.ex.category];
      const ratio = (latestBW && latestBW.weight > 0 && r.ex.category === 'strength')
        ? `<span class="record-ratio">${(r.best / latestBW.weight).toFixed(2)}× веса</span>`
        : '';
      return `
        <div class="record-row">
          <span class="record-icon" style="color:${meta.color}">${meta.icon}</span>
          <span class="record-name">${escapeHtml(r.ex.name)}</span>
          ${ratio}
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

// ---------- Тост с отменой действия ----------

let undoToastTimeout = null;

function showUndoToast(message, onUndo) {
  const toast = document.getElementById('undo-toast');
  const textEl = document.getElementById('undo-toast-text');
  const btn = document.getElementById('undo-toast-btn');
  if (!toast || !textEl || !btn) return;

  clearTimeout(undoToastTimeout);
  textEl.textContent = message;
  toast.hidden = false;

  const freshBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(freshBtn, btn);
  freshBtn.addEventListener('click', () => {
    clearTimeout(undoToastTimeout);
    toast.hidden = true;
    onUndo();
  });

  undoToastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 6000);
}

// ---------- Удаление упражнения с возможностью отмены ----------

function deleteExerciseWithUndo(id) {
  const exercise = state.exercises.find(e => e.id === id);
  if (!exercise) return;
  const removedEntries = state.entries.filter(e => e.exerciseId === id);

  state.exercises = state.exercises.filter(e => e.id !== id);
  state.entries = state.entries.filter(e => e.exerciseId !== id);
  saveExercises();
  saveEntries();
  renderLibraryList();

  showUndoToast(`Упражнение «${exercise.name}» удалено`, () => {
    state.exercises.push(exercise);
    state.entries.push(...removedEntries);
    saveExercises();
    saveEntries();
    render();
  });
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

  const shortBy = remainder * 2;
  const achievable = target - shortBy;

  resultEl.innerHTML = `
    <div class="calc-hint">На каждую сторону (${perSide.toFixed(2)} кг):</div>
    <div class="plate-chips">${chipsHtml}</div>
    ${shortBy > 0.01 ? `<div class="plate-remainder">⚠ Нет блина на ${shortBy.toFixed(2)} кг — соберётся ${achievable.toFixed(2)} кг вместо ${target}</div>` : ''}
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

// ---------- Советы ----------

const TIP_CATEGORIES = [
  { id: 'technique', label: 'Техника' },
  { id: 'nutrition', label: 'Питание' },
  { id: 'recovery', label: 'Восстановление' },
  { id: 'general', label: 'Общее' }
];

const GYM_TIPS = [
  {
    category: 'technique',
    title: 'Жим штанги лёжа',
    color: CATEGORY_META.strength.color,
    diagram: 'benchWrist',
    items: [
      'Кисти держите прямо над локтями, не заваливайте их назад — так меньше нагрузка на лучезапястный сустав.',
      'Сведите и прижмите лопатки к скамье, сохраняйте естественный прогиб в пояснице (мостик) — это стабилизирует корпус и сокращает путь штанги.',
      'Локти идут под углом примерно 45° к корпусу, а не разведены в стороны на 90° — так безопаснее для плечевых суставов.'
    ]
  },
  {
    category: 'technique',
    title: 'Присед со штангой',
    color: CATEGORY_META.strength.color,
    diagram: 'squatKnees',
    items: [
      'Колени двигаются в направлении носков и не заваливаются внутрь.',
      'Смотрите перед собой, а не в потолок — так легче удерживать нейтральное положение шеи и спины.',
      'Опускайтесь минимум до параллели бедра с полом, если позволяет подвижность суставов.'
    ]
  },
  {
    category: 'technique',
    title: 'Становая тяга',
    color: CATEGORY_META.strength.color,
    items: [
      'Гриф весь подход держите близко к голеням — так меньше плечо рычага и нагрузка на поясницу.',
      'Спина прямая от старта до финиша, не круглите поясницу под весом.',
      'Тяните за счёт разгибания ног и бёдер, а не рывком одной спиной.'
    ]
  },
  {
    category: 'technique',
    title: 'Подтягивания и тяга блока',
    color: CATEGORY_META.strength.color,
    diagram: 'backPull',
    items: [
      'Начинайте движение с сведения лопаток, а не с рук — так в работу включается спина, а не только бицепс.',
      'Не раскачивайтесь корпусом и не подтягивайтесь рывком — амплитуда должна быть подконтрольной в обе стороны.',
      'Внизу полностью выпрямляйте руки — неполная амплитуда меньше нагружает широчайшие мышцы.'
    ]
  },
  {
    category: 'technique',
    title: 'Жим гантелей стоя',
    color: CATEGORY_META.strength.color,
    items: [
      'Не прогибайтесь сильно в пояснице, чтобы закинуть вес наверх — если приходится прогибаться, вес слишком большой.',
      'В верхней точке не сталкивайте гантели друг с другом резко — это лишняя нагрузка на плечевой сустав без пользы для мышц.',
      'Опускайте гантели до уровня ушей, не ниже — глубокий заход в плохой позиции травмоопасен для плеч.'
    ]
  },
  {
    category: 'technique',
    title: 'Румынская тяга',
    color: CATEGORY_META.strength.color,
    items: [
      'Гриф скользит вдоль ног, колени лишь слегка подсогнуты — это упражнение на бёдра и ягодицы, не на квадрицепс.',
      'Опускайтесь, пока чувствуете растяжение задней поверхности бедра, спина всё время прямая.',
      'Возврат наверх — это разгибание в тазобедренном суставе (подать таз вперёд), а не рывок спиной.'
    ]
  },
  {
    category: 'technique',
    title: 'Ягодичный мост',
    color: CATEGORY_META.strength.color,
    items: [
      'В верхней точке сожмите ягодицы на секунду — это осознанное сокращение важнее самого веса на грифе.',
      'Подбородок слегка к груди, не запрокидывайте голову назад — так шея остаётся в нейтральном положении.',
      'Стопы стоят на ширине таза, гриф лежит на бёдрах, а не на животе — используйте подкладку под штангу.'
    ]
  },
  {
    category: 'recovery',
    title: 'Растяжка и восстановление',
    color: '#7cae70',
    items: [
      'Лёгкая растяжка после тренировки, пока мышцы ещё тёплые, помогает быстрее вернуть подвижность суставов.',
      'Между тренировками одной группы мышц — минимум 48 часов на восстановление, особенно для новичков.',
      'Боль в мышцах на следующий день — это нормально, острая боль в суставах во время движения — повод снизить вес или остановиться.'
    ]
  },
  {
    category: 'recovery',
    title: 'Сон',
    color: '#7cae70',
    items: [
      '7–9 часов сна для взрослого — именно во сне мышцы восстанавливаются и растут, а не в зале.',
      'Недосып повышает риск травм и мешает прогрессии весов — если не выспались, снизьте нагрузку в этот день.',
      'Стабильное время отбоя важнее общего количества часов сна одну ночь в неделю.'
    ]
  },
  {
    category: 'nutrition',
    title: 'Питание вокруг тренировки',
    color: '#7a97ac',
    items: [
      'За 1.5–2 часа до тренировки — приём пищи с белком и углеводами, чтобы были силы на рабочие подходы.',
      'В течение 1–2 часов после тренировки — белок (мясо, рыба, творог, протеин) помогает восстановлению мышц.',
      'Общий дневной баланс калорий и белка важнее точного времени приёма пищи — не зацикливайтесь на минутах.'
    ]
  },
  {
    category: 'nutrition',
    title: 'Белок и калории',
    color: '#7a97ac',
    items: [
      'Ориентир по белку для тренирующегося — примерно 1.6–2.2 г на кг веса тела в сутки, распределённо на несколько приёмов пищи.',
      'Для роста мышц нужен небольшой избыток калорий, для похудения — небольшой дефицит; и то, и то — при достаточном белке.',
      'Резкий дефицит калорий вместе с тяжёлыми тренировками истощает силы и мешает восстановлению — снижайте калории постепенно.'
    ]
  },
  {
    category: 'general',
    title: 'Общие принципы',
    color: '#7a97ac',
    items: [
      'Разминка 5–10 минут и разминочные подходы с лёгким весом перед рабочими.',
      'Выдох на усилии — не задерживайте дыхание на весь подход.',
      'Прибавляйте вес или повторы постепенно (2.5–5% или +1 повтор), а не рывками.',
      'Отдых между рабочими подходами: 2–3 минуты для силовой работы, 60–90 секунд для лёгких и многоповторных.',
      'Сон и достаточно белка в рационе — тоже часть тренировки: без восстановления результата не будет.'
    ]
  },
  {
    category: 'general',
    title: 'С чего начать новичку',
    color: '#c9793f',
    items: [
      'Первые недели — учите технику на лёгких весах, а не гонитесь за рабочим весом. Форма движения важнее цифры на штанге.',
      'Начните с 2–3 тренировок в неделю на всё тело — этого достаточно для старта, не нужно тренироваться каждый день.',
      'Заведите план в разделе «Упражнения» — так вы не будете каждый раз придумывать тренировку заново.'
    ]
  }
];

// Схемы: правильно/неправильно, простые линейные силуэты.

function renderBenchWristDiagram() {
  return `
    <div class="tip-diagram">
      <div class="tip-diagram-panel correct">
        <svg viewBox="0 0 100 140">
          <rect x="20" y="20" width="60" height="14" rx="7" fill="#c9793f"/>
          <line x1="50" y1="34" x2="50" y2="120" stroke="#7a97ac" stroke-width="1.5" stroke-dasharray="4 4"/>
          <circle cx="50" cy="40" r="5" fill="none" stroke="#f5efe7" stroke-width="3"/>
          <line x1="50" y1="45" x2="50" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <circle cx="50" cy="90" r="6" fill="none" stroke="#f5efe7" stroke-width="3"/>
          <line x1="50" y1="95" x2="30" y2="125" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.check}</span>
        <span class="tip-diagram-label">Кисть прямая, над локтем</span>
      </div>
      <div class="tip-diagram-panel incorrect">
        <svg viewBox="0 0 100 140">
          <rect x="8" y="14" width="60" height="14" rx="7" fill="#c9793f"/>
          <line x1="50" y1="34" x2="50" y2="120" stroke="#7a97ac" stroke-width="1.5" stroke-dasharray="4 4"/>
          <circle cx="38" cy="34" r="5" fill="none" stroke="#f5efe7" stroke-width="3"/>
          <line x1="38" y1="39" x2="50" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <circle cx="50" cy="90" r="6" fill="none" stroke="#f5efe7" stroke-width="3"/>
          <line x1="50" y1="95" x2="30" y2="125" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.close}</span>
        <span class="tip-diagram-label">Кисть заваливается назад</span>
      </div>
    </div>
  `;
}

function renderSquatKneesDiagram() {
  return `
    <div class="tip-diagram">
      <div class="tip-diagram-panel correct">
        <svg viewBox="0 0 100 140">
          <line x1="50" y1="15" x2="50" y2="55" stroke="#f5efe7" stroke-width="7" stroke-linecap="round"/>
          <circle cx="50" cy="8" r="8" fill="#f5efe7"/>
          <circle cx="50" cy="55" r="4" fill="#f5efe7"/>
          <line x1="50" y1="55" x2="30" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="50" y1="55" x2="70" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="30" y1="90" x2="28" y2="130" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="70" y1="90" x2="72" y2="130" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="30" y1="90" x2="28" y2="130" stroke="#7cae70" stroke-width="1" stroke-dasharray="3 3"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.check}</span>
        <span class="tip-diagram-label">Колено по линии носка</span>
      </div>
      <div class="tip-diagram-panel incorrect">
        <svg viewBox="0 0 100 140">
          <line x1="50" y1="15" x2="50" y2="55" stroke="#f5efe7" stroke-width="7" stroke-linecap="round"/>
          <circle cx="50" cy="8" r="8" fill="#f5efe7"/>
          <circle cx="50" cy="55" r="4" fill="#f5efe7"/>
          <line x1="50" y1="55" x2="45" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="50" y1="55" x2="55" y2="90" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="45" y1="90" x2="28" y2="130" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="55" y1="90" x2="72" y2="130" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.close}</span>
        <span class="tip-diagram-label">Колени заваливаются внутрь</span>
      </div>
    </div>
  `;
}

function renderBackPullDiagram() {
  return `
    <div class="tip-diagram">
      <div class="tip-diagram-panel correct">
        <svg viewBox="0 0 100 140">
          <path d="M32 22 L68 22 L60 72 Q50 78 40 72 Z" fill="rgba(124,174,112,0.3)" stroke="#7cae70" stroke-width="3"/>
          <circle cx="50" cy="12" r="8" fill="#f5efe7"/>
          <path d="M42 36 L48 42 L42 48" fill="none" stroke="#7cae70" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M58 36 L52 42 L58 48" fill="none" stroke="#7cae70" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="32" y1="28" x2="16" y2="52" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="68" y1="28" x2="84" y2="52" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.check}</span>
        <span class="tip-diagram-label">Лопатки сводятся — работает спина</span>
      </div>
      <div class="tip-diagram-panel incorrect">
        <svg viewBox="0 0 100 140">
          <path d="M36 26 L64 26 L58 72 Q50 76 42 72 Z" fill="none" stroke="#f5efe7" stroke-width="3"/>
          <circle cx="50" cy="16" r="8" fill="#f5efe7"/>
          <ellipse cx="74" cy="46" rx="8" ry="13" fill="rgba(193,92,80,0.35)" stroke="#c15c50" stroke-width="2"/>
          <line x1="64" y1="30" x2="74" y2="55" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="74" y1="55" x2="56" y2="36" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
          <line x1="36" y1="30" x2="34" y2="62" stroke="#f5efe7" stroke-width="6" stroke-linecap="round"/>
        </svg>
        <span class="tip-diagram-badge">${ICONS.close}</span>
        <span class="tip-diagram-label">Работает только рука (бицепс)</span>
      </div>
    </div>
  `;
}

function renderTipDiagram(key) {
  if (key === 'benchWrist') return renderBenchWristDiagram();
  if (key === 'squatKnees') return renderSquatKneesDiagram();
  if (key === 'backPull') return renderBackPullDiagram();
  return '';
}

function renderWaterCalcCard() {
  const latest = getLatestBodyweight();
  const prefill = latest ? latest.weight : '';
  return `
    <div class="card water-calc-card">
      <div class="entry-head">${ICONS.drop}<strong>Питьевой режим</strong></div>
      <p class="modal-hint">Ориентир: около 35 мл воды на кг веса в сутки, плюс 500–750 мл на каждый час тренировки. Это общая рекомендация, не медицинская норма.</p>
      <input type="number" id="water-weight-input" inputmode="decimal" step="0.1" min="0" placeholder="Вес, кг" value="${prefill}">
      <div id="water-result" class="calc-result"></div>
    </div>
  `;
}

function updateWaterResult() {
  const input = document.getElementById('water-weight-input');
  const resultEl = document.getElementById('water-result');
  if (!input || !resultEl) return;

  const weight = parseFloat(input.value);
  if (isNaN(weight) || weight <= 0) {
    resultEl.innerHTML = '<p class="empty-hint">Введите вес</p>';
    return;
  }

  const baseLiters = weight * 0.035;
  resultEl.innerHTML = `
    <div class="calc-big-value">${baseLiters.toFixed(1)} л</div>
    <div class="calc-hint">Базовая норма в день без тренировки — в день тренировки прибавьте 0.5–0.75 л за каждый час</div>
  `;
}

function renderTipCard(section) {
  return `
    <div class="card tip-card" style="border-top-color:${section.color}">
      <div class="entry-head tip-card-head" style="color:${section.color}">${ICONS.lightbulb}<strong>${escapeHtml(section.title)}</strong></div>
      ${section.diagram ? renderTipDiagram(section.diagram) : ''}
      <ul class="tip-list">
        ${section.items.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderTips() {
  const panel = document.getElementById('panel-tips');
  const activeCategory = state.tipsCategory;

  const tabsHtml = TIP_CATEGORIES.map(c => `
    <button class="chip ${c.id === activeCategory ? 'chip-active' : ''}" data-tips-category="${c.id}">${c.label}</button>
  `).join('');

  const cardsHtml = GYM_TIPS.filter(t => t.category === activeCategory).map(renderTipCard).join('');
  const waterCalcHtml = activeCategory === 'nutrition' ? renderWaterCalcCard() : '';

  panel.innerHTML = `
    <div class="tips-category-row">${tabsHtml}</div>
    ${waterCalcHtml}
    ${cardsHtml}
  `;

  panel.querySelectorAll('[data-tips-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tipsCategory = btn.dataset.tipsCategory;
      renderTips();
    });
  });

  const waterInput = document.getElementById('water-weight-input');
  if (waterInput) {
    waterInput.addEventListener('input', updateWaterResult);
    updateWaterResult();
  }
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
    sessions: state.sessions,
    plans: state.plans,
    bodyweightLogs: state.bodyweightLogs
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
    state.plans = Array.isArray(data.plans) ? data.plans : [];
    state.bodyweightLogs = Array.isArray(data.bodyweightLogs) ? data.bodyweightLogs : [];
    if (state.activePlanId && !state.plans.find(p => p.id === state.activePlanId)) {
      exitPlan();
    }
    saveExercises();
    saveEntries();
    saveSessions();
    savePlans();
    saveBodyweightLogs();
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
  loadProgressPhotos();

  if (state.needsOnboarding) {
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
      overlay.hidden = false;
      const finishOnboarding = (gender) => {
        seedDefaultExercises(gender);
        state.needsOnboarding = false;
        overlay.hidden = true;
        render();
      };
      document.getElementById('welcome-male-btn').addEventListener('click', () => finishOnboarding('male'));
      document.getElementById('welcome-female-btn').addEventListener('click', () => finishOnboarding('female'));
    }
  }

  const globalStatusBar = document.getElementById('global-status');
  if (globalStatusBar) {
    globalStatusBar.addEventListener('click', () => {
      closeToolsModal();
      switchTab('log');
    });
  }

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

  const addMalePresetBtn = document.getElementById('add-male-preset-btn');
  if (addMalePresetBtn) {
    addMalePresetBtn.addEventListener('click', () => {
      const added = addMissingDefaultExercises('male');
      if (state.tab === 'library') renderLibraryList();
      alert(added > 0 ? `Добавлено упражнений: ${added}` : 'Все упражнения из мужского набора уже есть в библиотеке.');
    });
  }

  const addFemalePresetBtn = document.getElementById('add-female-preset-btn');
  if (addFemalePresetBtn) {
    addFemalePresetBtn.addEventListener('click', () => {
      const added = addMissingDefaultExercises('female');
      if (state.tab === 'library') renderLibraryList();
      alert(added > 0 ? `Добавлено упражнений: ${added}` : 'Все упражнения из женского набора уже есть в библиотеке.');
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
    plateBar.value = state.barWeight;
    plateTarget.addEventListener('input', renderPlateResult);
    plateBar.addEventListener('input', () => {
      const val = parseFloat(plateBar.value);
      if (!isNaN(val) && val >= 0) {
        state.barWeight = val;
        saveBarWeight();
      }
      renderPlateResult();
    });
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
