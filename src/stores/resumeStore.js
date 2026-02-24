import { computed, reactive } from 'vue';
import { fetchResumeData } from '../boots/api';
import { localizeText } from '../utils/i18n';
import { readJsonStorage } from '../utils/storage';

const DATA_STORAGE_KEY = 'resume.product.data.v1';
const PREF_STORAGE_KEY = 'resume.product.pref.v1';

// 深拷貝資料，避免直接修改原始物件參考。
function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

const state = reactive({
  initialized: false,
  loading: true,
  locale: 'zh-TW',
  theme: 'dawn',
  selectedVersion: 'frontend',
  data: null,
});

const supportedLocales = computed(() => state.data?.meta?.supportedLocales ?? ['zh-TW', 'en-US']);
const visibleProjects = computed(() => state.data?.projects ?? []);
const featuredProjects = computed(() =>
  visibleProjects.value.filter((project) => Boolean(project.featured))
);
const experienceTimeline = computed(() =>
  [...(state.data?.experiences ?? [])].sort((a, b) => b.start.localeCompare(a.start))
);

// 確保目前選擇的履歷版本存在於可用版本清單中。
function normalizeVersion() {
  const versions = state.data?.resumeVersions ?? [];

  if (versions.length === 0) {
    return;
  }

  const hasCurrent = versions.some((version) => version.id === state.selectedVersion);

  if (!hasCurrent) {
    state.selectedVersion = versions[0].id;
  }
}

// 套用使用者偏好（語系、主題、版本）到 store 狀態。
function hydratePreferences() {
  const prefs = readJsonStorage(PREF_STORAGE_KEY);
  const defaultLocale = state.data?.meta?.defaultLocale ?? 'zh-TW';
  const localeCandidates = new Set(supportedLocales.value);

  if (prefs?.locale && localeCandidates.has(prefs.locale)) {
    state.locale = prefs.locale;
  } else if (localeCandidates.has(defaultLocale)) {
    state.locale = defaultLocale;
  }

  if (prefs?.theme === 'midnight' || prefs?.theme === 'dawn') {
    state.theme = prefs.theme;
  }

  if (typeof prefs?.selectedVersion === 'string') {
    state.selectedVersion = prefs.selectedVersion;
  }

  normalizeVersion();
}

// 初始化履歷資料與偏好設定，只會執行一次。
async function initialize() {
  if (state.initialized) {
    return;
  }

  state.loading = true;

  const seed = await fetchResumeData();
  const draft = readJsonStorage(DATA_STORAGE_KEY);
  const preferSeedData = import.meta.env.DEV;

  state.data = cloneValue(preferSeedData ? seed : (draft ?? seed));
  hydratePreferences();

  state.initialized = true;
  state.loading = false;
}

// 依目前語系與預設語系回傳對應文字。
function t(messageMap) {
  return localizeText(messageMap, state.locale, state.data?.meta?.defaultLocale ?? 'zh-TW');
}

// 透過 a.b.c 路徑讀取巢狀物件欄位值。
function getNestedValue(source, path) {
  if (!source || typeof source !== 'object' || typeof path !== 'string') {
    return undefined;
  }

  return path.split('.').reduce((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return current[segment];
  }, source);
}

// 將模板中的 {key} 佔位符替換成 params 對應值。
function interpolateText(template, params) {
  if (typeof template !== 'string') {
    return '';
  }

  if (!params || typeof params !== 'object') {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
      return match;
    }

    const value = params[key];
    return value === null || value === undefined ? '' : String(value);
  });
}

// 讀取 UI 文案後，進行語系與參數插值處理。
function ui(path, params) {
  const messageMap = getNestedValue(state.data?.ui, path);
  const localizedText = t(messageMap);
  return interpolateText(localizedText, params);
}

const store = {
  state,
  supportedLocales,
  visibleProjects,
  featuredProjects,
  experienceTimeline,
  initialize,
  t,
  ui,
};

// 回傳全域單例 store，供元件共用同一份狀態。
export function useResumeStore() {
  return store;
}
