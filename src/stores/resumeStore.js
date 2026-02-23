import { computed, reactive } from 'vue';
import { fetchResumeData } from '../boots/api';
import { localizeText } from '../utils/i18n';

const DATA_STORAGE_KEY = 'resume.product.data.v1';
const PREF_STORAGE_KEY = 'resume.product.pref.v1';
const AUTH_STORAGE_KEY = 'resume.product.auth.v1';

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(key) {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

const state = reactive({
  initialized: false,
  loading: true,
  locale: 'zh-TW',
  theme: 'dawn',
  selectedVersion: 'frontend',
  token: '',
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

const isLoggedIn = computed(() => Boolean(state.token));

function savePrefs() {
  writeStorage(PREF_STORAGE_KEY, {
    locale: state.locale,
    theme: state.theme,
    selectedVersion: state.selectedVersion,
  });
}

function saveData() {
  if (!state.data) {
    return;
  }

  writeStorage(DATA_STORAGE_KEY, state.data);
}

function saveToken() {
  writeStorage(AUTH_STORAGE_KEY, state.token);
}

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

function hydratePreferences() {
  const prefs = readStorage(PREF_STORAGE_KEY);
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

async function initialize() {
  if (state.initialized) {
    return;
  }

  state.loading = true;

  const seed = await fetchResumeData();
  const draft = readStorage(DATA_STORAGE_KEY);
  const preferSeedData = import.meta.env.DEV;

  // In local development, always use seed JSON so file edits are reflected immediately.
  state.data = cloneValue(preferSeedData ? seed : draft ?? seed);

  hydratePreferences();

  const token = readStorage(AUTH_STORAGE_KEY);
  state.token = typeof token === 'string' ? token : '';

  state.initialized = true;
  state.loading = false;
}

function setLocale(nextLocale) {
  if (!supportedLocales.value.includes(nextLocale)) {
    return;
  }

  state.locale = nextLocale;
  savePrefs();
}

function toggleTheme() {
  state.theme = state.theme === 'dawn' ? 'midnight' : 'dawn';
  savePrefs();
}

function setVersion(versionId) {
  state.selectedVersion = versionId;
  normalizeVersion();
  savePrefs();
}

function login(pin) {
  if (!state.data?.security?.loginPin) {
    return false;
  }

  if (pin !== state.data.security.loginPin) {
    return false;
  }

  state.token = `session-${Date.now()}`;
  saveToken();
  return true;
}

function logout() {
  state.token = '';
  saveToken();
}

function t(messageMap) {
  return localizeText(messageMap, state.locale, state.data?.meta?.defaultLocale ?? 'zh-TW');
}

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

function ui(path, params) {
  const messageMap = getNestedValue(state.data?.ui, path);
  const localizedText = t(messageMap);
  return interpolateText(localizedText, params);
}

function updateMetaLocaleField(fieldName, locale, nextValue) {
  if (!state.data?.meta?.[fieldName] || typeof state.data.meta[fieldName] !== 'object') {
    return;
  }

  state.data.meta[fieldName][locale] = nextValue;
  saveData();
}

function updateMetaField(fieldName, nextValue) {
  if (!state.data?.meta || typeof fieldName !== 'string') {
    return;
  }

  if (typeof state.data.meta[fieldName] !== 'string') {
    return;
  }

  state.data.meta[fieldName] = typeof nextValue === 'string' ? nextValue : '';
  saveData();
}

function updateSkillsFromNames(nextNames) {
  if (!state.data || !Array.isArray(nextNames)) {
    return;
  }

  const currentSkills = Array.isArray(state.data.skills) ? state.data.skills : [];
  const normalizedNames = nextNames
    .map((name) => (typeof name === 'string' ? name.trim() : ''))
    .filter((name) => name.length > 0);

  state.data.skills = normalizedNames.map((name, index) => {
    const current = currentSkills[index] ?? {};
    const fallbackId = `skill-${String(index + 1).padStart(2, '0')}`;

    return {
      id: typeof current.id === 'string' && current.id.trim().length > 0 ? current.id : fallbackId,
      name,
      category:
        typeof current.category === 'string' && current.category.trim().length > 0
          ? current.category
          : 'general',
    };
  });

  saveData();
}

function addSkill(skillName, category = 'general') {
  const normalizedName = typeof skillName === 'string' ? skillName.trim() : '';

  if (!state.data || normalizedName.length === 0) {
    return;
  }

  if (!Array.isArray(state.data.skills)) {
    state.data.skills = [];
  }

  if (state.data.skills.some((item) => item?.name === normalizedName)) {
    return;
  }

  const latestIndex = state.data.skills.reduce((max, item) => {
    const match = /^skill-(\d+)$/.exec(item?.id ?? '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  state.data.skills.push({
    id: `skill-${String(latestIndex + 1).padStart(2, '0')}`,
    name: normalizedName,
    category: typeof category === 'string' && category.trim().length > 0 ? category.trim() : 'general',
  });

  saveData();
}

function removeSkill(skillName) {
  const normalizedName = typeof skillName === 'string' ? skillName.trim() : '';

  if (!state.data?.skills || normalizedName.length === 0) {
    return;
  }

  state.data.skills = state.data.skills.filter((item) => item?.name !== normalizedName);
  saveData();
}

function updateSectionOrder(nextOrder) {
  if (!state.data) {
    return;
  }

  state.data.sectionOrder = [...nextOrder];
  saveData();
}

function moveSection(sectionId, direction) {
  if (!state.data?.sectionOrder) {
    return;
  }

  const currentOrder = [...state.data.sectionOrder];
  const index = currentOrder.indexOf(sectionId);

  if (index < 0) {
    return;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= currentOrder.length) {
    return;
  }

  [currentOrder[index], currentOrder[targetIndex]] = [
    currentOrder[targetIndex],
    currentOrder[index],
  ];
  updateSectionOrder(currentOrder);
}

function getProjectBySlug(slug) {
  if (!state.data?.projects) {
    return null;
  }

  return state.data.projects.find((item) => item.slug === slug) ?? null;
}

function updateProjectSummary(slug, locale, nextSummary) {
  const project = getProjectBySlug(slug);

  if (!project?.summary || typeof project.summary !== 'object') {
    return;
  }

  project.summary[locale] = nextSummary;
  saveData();
}

function updateProjectContributions(slug, nextContributions) {
  const project = getProjectBySlug(slug);

  if (!project || !Array.isArray(nextContributions)) {
    return;
  }

  project.contributions = nextContributions
    .map((item) => {
      const zh = typeof item?.['zh-TW'] === 'string' ? item['zh-TW'].trim() : '';
      const en = typeof item?.['en-US'] === 'string' ? item['en-US'].trim() : '';

      return {
        'zh-TW': zh,
        'en-US': en,
      };
    })
    .filter((item) => item['zh-TW'].length > 0 || item['en-US'].length > 0);

  saveData();
}

function getExperienceById(experienceId) {
  if (!state.data?.experiences) {
    return null;
  }

  return state.data.experiences.find((item) => item.id === experienceId) ?? null;
}

function updateExperienceBase(experienceId, payload) {
  const experience = getExperienceById(experienceId);

  if (!experience || !payload || typeof payload !== 'object') {
    return;
  }

  if (typeof payload.company === 'string') {
    experience.company = payload.company.trim();
  }

  if (typeof payload.start === 'string' && payload.start.trim().length > 0) {
    experience.start = payload.start.trim();
  }

  if (typeof payload.end === 'string') {
    const normalizedEnd = payload.end.trim();
    experience.end = normalizedEnd.length > 0 ? normalizedEnd : null;
  } else if (payload.end === null) {
    experience.end = null;
  }

  saveData();
}

function updateExperienceLocaleField(experienceId, fieldName, locale, nextValue) {
  const experience = getExperienceById(experienceId);

  if (!experience) {
    return;
  }

  if (!experience[fieldName] || typeof experience[fieldName] !== 'object') {
    experience[fieldName] = { 'zh-TW': '', 'en-US': '' };
  }

  experience[fieldName][locale] = typeof nextValue === 'string' ? nextValue : '';
  saveData();
}

function updateExperienceHighlights(experienceId, nextHighlights) {
  const experience = getExperienceById(experienceId);

  if (!experience || !Array.isArray(nextHighlights)) {
    return;
  }

  experience.highlights = nextHighlights
    .map((item) => {
      const zh = typeof item?.['zh-TW'] === 'string' ? item['zh-TW'].trim() : '';
      const en = typeof item?.['en-US'] === 'string' ? item['en-US'].trim() : '';

      return {
        'zh-TW': zh,
        'en-US': en,
      };
    })
    .filter((item) => item['zh-TW'].length > 0 || item['en-US'].length > 0);

  saveData();
}

function addExperience() {
  if (!state.data) {
    return null;
  }

  if (!Array.isArray(state.data.experiences)) {
    state.data.experiences = [];
  }

  const latestIndex = state.data.experiences.reduce((max, item) => {
    const match = /^exp-(\d+)$/.exec(item?.id ?? '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  const nextId = `exp-${String(latestIndex + 1).padStart(2, '0')}`;
  const currentMonth = new Date().toISOString().slice(0, 7);

  state.data.experiences.unshift({
    id: nextId,
    start: currentMonth,
    end: null,
    company: '',
    role: {
      'zh-TW': '',
      'en-US': '',
    },
    summary: {
      'zh-TW': '',
      'en-US': '',
    },
    highlights: [],
  });

  saveData();
  return nextId;
}

function removeExperience(experienceId) {
  if (!state.data?.experiences) {
    return;
  }

  state.data.experiences = state.data.experiences.filter((item) => item.id !== experienceId);
  saveData();
}

function addProjectTech(slug, techName) {
  const normalizedTech = techName?.trim();

  if (!normalizedTech) {
    return;
  }

  const project = getProjectBySlug(slug);

  if (!project) {
    return;
  }

  if (!Array.isArray(project.tech)) {
    project.tech = [];
  }

  if (project.tech.includes(normalizedTech)) {
    return;
  }

  project.tech.push(normalizedTech);
  saveData();
}

function removeProjectTech(slug, techName) {
  const normalizedTech = techName?.trim();

  if (!normalizedTech) {
    return;
  }

  const project = getProjectBySlug(slug);

  if (!project || !Array.isArray(project.tech)) {
    return;
  }

  project.tech = project.tech.filter((item) => item !== normalizedTech);
  saveData();
}

async function resetData() {
  const seed = await fetchResumeData();
  state.data = cloneValue(seed);
  normalizeVersion();
  saveData();
}

const store = {
  state,
  supportedLocales,
  visibleProjects,
  featuredProjects,
  experienceTimeline,
  isLoggedIn,
  initialize,
  setLocale,
  setVersion,
  toggleTheme,
  login,
  logout,
  t,
  ui,
  updateMetaField,
  updateMetaLocaleField,
  updateSkillsFromNames,
  addSkill,
  removeSkill,
  moveSection,
  updateProjectSummary,
  updateProjectContributions,
  updateExperienceBase,
  updateExperienceLocaleField,
  updateExperienceHighlights,
  addExperience,
  removeExperience,
  addProjectTech,
  removeProjectTech,
  resetData,
};

export function useResumeStore() {
  return store;
}
