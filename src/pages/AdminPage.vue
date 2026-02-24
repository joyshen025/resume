<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useResumeStore } from '../stores/resumeStore';
import { getAdminSaveNotice, getAdminText } from '../constants/adminText';
import { readJsonStorage, writeJsonStorage } from '../utils/storage';

const store = useResumeStore();
const LOCALE_ZH = 'zh-TW';
const LOCALE_EN = 'en-US';
const DATA_STORAGE_KEY = 'resume.product.data.v1';
const AUTH_STORAGE_KEY = 'resume.product.auth.v1';

const pin = ref('');
const loginError = ref('');
const storedAuthToken = readJsonStorage(AUTH_STORAGE_KEY, '');
const sessionToken = ref(typeof storedAuthToken === 'string' ? storedAuthToken : '');

const ownerName = ref('');
const jobTitleZh = ref('');
const jobTitleEn = ref('');
const summaryZh = ref('');
const summaryEn = ref('');
const nextSkillName = ref('');

const selectedProjectSlug = ref('');
const projectSlugDraft = ref('');
const projectTitleZh = ref('');
const projectTitleEn = ref('');
const projectSummaryZh = ref('');
const projectSummaryEn = ref('');
const projectContributionsZh = ref('');
const projectContributionsEn = ref('');
const nextTechName = ref('');

const selectedExperienceId = ref('');
const expCompany = ref('');
const expStart = ref('');
const expEnd = ref('');
const expRoleZh = ref('');
const expRoleEn = ref('');
const expSummaryZh = ref('');
const expSummaryEn = ref('');
const expHighlightsZh = ref('');
const expHighlightsEn = ref('');

const saveNotices = reactive({
  meta: null,
  project: null,
  experience: null,
});

const saveNoticeTimers = {
  meta: null,
  project: null,
  experience: null,
};

const isLoggedIn = computed(() => sessionToken.value.length > 0);
const projects = computed(() => store.state.data?.projects ?? []);
const selectedProject = computed(() =>
  projects.value.find((project) => project.slug === selectedProjectSlug.value)
);
const selectedProjectTech = computed(() => selectedProject.value?.tech ?? []);
const metaSkills = computed(() => store.state.data?.skills ?? []);
const adminText = computed(() => getAdminText(store.state.locale));
const experiences = computed(() => store.state.data?.experiences ?? []);
const selectedExperience = computed(() =>
  experiences.value.find((item) => item.id === selectedExperienceId.value)
);
const visibleSaveNotices = computed(() =>
  ['meta', 'project', 'experience']
    .map((section) => {
      const notice = saveNotices[section];

      if (!notice) {
        return null;
      }

      return {
        id: section,
        type: notice.type,
        text: notice.text,
        at: notice.at ?? 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.at - a.at)
);

// 顯示儲存通知，並在短時間後自動關閉
function showSaveNotice(section, isSuccess) {
  saveNotices[section] = {
    type: isSuccess ? 'success' : 'error',
    text: getAdminSaveNotice(store.state.locale, section, isSuccess),
    at: Date.now(),
  };

  if (saveNoticeTimers[section]) {
    window.clearTimeout(saveNoticeTimers[section]);
  }

  saveNoticeTimers[section] = window.setTimeout(() => {
    saveNotices[section] = null;
    saveNoticeTimers[section] = null;
  }, 2400);
}

// 依公司名稱與開始日期，組合經歷下拉選單文字
function formatExperienceOption(item) {
  const untitled = adminText.value.untitledExperience;
  const company = item.company?.trim() ? item.company : untitled;
  const period = item.start ? ` - ${item.start}` : '';
  return `${company}${period}`;
}

function localeLabel(zhText, enText) {
  return store.state.locale === LOCALE_EN ? enText : zhText;
}

function formatProjectOption(project) {
  const localizedTitle = typeof store.t(project.title) === 'string' ? store.t(project.title).trim() : '';

  if (localizedTitle) {
    return localizedTitle;
  }

  return project.slug || project.id;
}

function normalizeProjectSlug(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function getUniqueProjectSlug(value, currentSlug = '') {
  const fallbackBase = normalizeProjectSlug(value) || 'new-project';
  let nextSlug = fallbackBase;
  let sequence = 2;

  while (
    projects.value.some(
      (project) => project.slug === nextSlug && project.slug !== currentSlug
    )
  ) {
    nextSlug = `${fallbackBase}-${sequence}`;
    sequence += 1;
  }

  return nextSlug;
}

// 將目前 CMS 輸入框同步成主資料內容
function syncMetaEditor() {
  const meta = store.state.data?.meta;

  if (!meta) {
    return;
  }

  ownerName.value = meta.ownerName ?? '';
  jobTitleZh.value = meta.jobTitle?.[LOCALE_ZH] ?? '';
  jobTitleEn.value = meta.jobTitle?.[LOCALE_EN] ?? '';
  summaryZh.value = meta.summary?.[LOCALE_ZH] ?? '';
  summaryEn.value = meta.summary?.[LOCALE_EN] ?? '';
  nextSkillName.value = '';
}

// 將目前 CMS 輸入框同步成專案內容
function syncProjectEditor() {
  const project = selectedProject.value;

  if (!project) {
    projectSlugDraft.value = '';
    projectTitleZh.value = '';
    projectTitleEn.value = '';
    projectSummaryZh.value = '';
    projectSummaryEn.value = '';
    projectContributionsZh.value = '';
    projectContributionsEn.value = '';
    nextTechName.value = '';
    return;
  }

  projectSlugDraft.value = project.slug ?? '';
  projectTitleZh.value = project.title?.[LOCALE_ZH] ?? '';
  projectTitleEn.value = project.title?.[LOCALE_EN] ?? '';
  projectSummaryZh.value = project.summary?.[LOCALE_ZH] ?? '';
  projectSummaryEn.value = project.summary?.[LOCALE_EN] ?? '';

  const contributions =
    Array.isArray(project.contributions) && project.contributions.length > 0
      ? project.contributions
      : project.solution
        ? [project.solution]
        : [];

  projectContributionsZh.value = contributions.map((item) => item?.[LOCALE_ZH] ?? '').join('\n');
  projectContributionsEn.value = contributions.map((item) => item?.[LOCALE_EN] ?? '').join('\n');
  nextTechName.value = '';
}

// 將目前 CMS 輸入框同步成經歷內容
function syncExperienceEditor() {
  const experience = selectedExperience.value;

  if (!experience) {
    expCompany.value = '';
    expStart.value = '';
    expEnd.value = '';
    expRoleZh.value = '';
    expRoleEn.value = '';
    expSummaryZh.value = '';
    expSummaryEn.value = '';
    expHighlightsZh.value = '';
    expHighlightsEn.value = '';
    return;
  }

  expCompany.value = experience.company ?? '';
  expStart.value = experience.start ?? '';
  expEnd.value = experience.end ?? '';
  expRoleZh.value = experience.role?.[LOCALE_ZH] ?? '';
  expRoleEn.value = experience.role?.[LOCALE_EN] ?? '';
  expSummaryZh.value = experience.summary?.[LOCALE_ZH] ?? '';
  expSummaryEn.value = experience.summary?.[LOCALE_EN] ?? '';

  const highlights = Array.isArray(experience.highlights) ? experience.highlights : [];
  expHighlightsZh.value = highlights.map((item) => item?.[LOCALE_ZH] ?? '').join('\n');
  expHighlightsEn.value = highlights.map((item) => item?.[LOCALE_EN] ?? '').join('\n');
}

// 依 slug 取得指定專案
function getProjectBySlug(slug) {
  if (!store.state.data?.projects || !slug) {
    return null;
  }

  return store.state.data.projects.find((item) => item.slug === slug) ?? null;
}

// 依 id 取得指定經歷
function getExperienceById(experienceId) {
  if (!store.state.data?.experiences || !experienceId) {
    return null;
  }

  return store.state.data.experiences.find((item) => item.id === experienceId) ?? null;
}

// 將一段多行中英文文字，依行號配對成陣列
function buildLocaleLines(zhText, enText) {
  const zhLines = zhText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const enLines = enText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const maxLength = Math.max(zhLines.length, enLines.length);
  const result = [];

  for (let index = 0; index < maxLength; index += 1) {
    const zh = zhLines[index] ?? '';
    const en = enLines[index] ?? '';

    if (zh.length > 0 || en.length > 0) {
      result.push({
        [LOCALE_ZH]: zh,
        [LOCALE_EN]: en,
      });
    }
  }

  return result;
}

// 儲存目前 state.data 到 localStorage
function persistData() {
  if (!store.state.data) {
    return;
  }

  writeJsonStorage(DATA_STORAGE_KEY, store.state.data);
}

// 驗證 PIN，成功時建立登入 session token。
function login(pinValue) {
  const expectedPin = store.state.data?.security?.loginPin;

  if (!expectedPin || pinValue !== expectedPin) {
    return false;
  }

  sessionToken.value = `session-${Date.now()}`;
  writeJsonStorage(AUTH_STORAGE_KEY, sessionToken.value);
  return true;
}

// 登出 CMS，清空 session token。
function logout() {
  sessionToken.value = '';
  writeJsonStorage(AUTH_STORAGE_KEY, sessionToken.value);
}

// 更新主資料中的一般字串欄位
function updateMetaField(fieldName, nextValue) {
  if (!store.state.data?.meta || typeof fieldName !== 'string') {
    return;
  }

  if (typeof store.state.data.meta[fieldName] !== 'string') {
    return;
  }

  store.state.data.meta[fieldName] = typeof nextValue === 'string' ? nextValue : '';
}

// 更新主資料中的多語系欄位
function updateMetaLocaleField(fieldName, locale, nextValue) {
  if (
    !store.state.data?.meta?.[fieldName] ||
    typeof store.state.data.meta[fieldName] !== 'object'
  ) {
    return;
  }

  store.state.data.meta[fieldName][locale] = typeof nextValue === 'string' ? nextValue : '';
}

// 新增主資料技能，避免重複名稱
function addSkill(skillName, category = 'general') {
  const normalizedName = typeof skillName === 'string' ? skillName.trim() : '';

  if (!store.state.data || normalizedName.length === 0) {
    return;
  }

  if (!Array.isArray(store.state.data.skills)) {
    store.state.data.skills = [];
  }

  if (store.state.data.skills.some((item) => item?.name === normalizedName)) {
    return;
  }

  const latestIndex = store.state.data.skills.reduce((max, item) => {
    const match = /^skill-(\d+)$/.exec(item?.id ?? '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  store.state.data.skills.push({
    id: `skill-${String(latestIndex + 1).padStart(2, '0')}`,
    name: normalizedName,
    category:
      typeof category === 'string' && category.trim().length > 0 ? category.trim() : 'general',
  });
}

// 刪除指定名稱的主資料技能
function removeSkill(skillName) {
  const normalizedName = typeof skillName === 'string' ? skillName.trim() : '';

  if (!store.state.data?.skills || normalizedName.length === 0) {
    return;
  }

  store.state.data.skills = store.state.data.skills.filter((item) => item?.name !== normalizedName);
}

// 更新專案摘要多語系內容
function markProjectUpdatedAt(project) {
  if (!project || typeof project !== 'object') {
    return;
  }

  project.updatedAt = new Date().toISOString().slice(0, 10);
}

function updateProjectBase(slug, payload) {
  const project = getProjectBySlug(slug);

  if (!project || !payload || typeof payload !== 'object') {
    return slug;
  }

  if (!project.title || typeof project.title !== 'object') {
    project.title = {
      [LOCALE_ZH]: '',
      [LOCALE_EN]: '',
    };
  }

  if (typeof payload.titleZh === 'string') {
    project.title[LOCALE_ZH] = payload.titleZh;
  }

  if (typeof payload.titleEn === 'string') {
    project.title[LOCALE_EN] = payload.titleEn;
  }

  const slugSource =
    payload.slug ||
    payload.titleEn ||
    payload.titleZh ||
    project.slug ||
    project.id ||
    'new-project';
  const nextSlug = getUniqueProjectSlug(slugSource, slug);
  project.slug = nextSlug;
  markProjectUpdatedAt(project);
  return nextSlug;
}

// 更新專案摘要多語系內容
function updateProjectSummary(slug, locale, nextSummary) {
  const project = getProjectBySlug(slug);

  if (!project) {
    return;
  }

  if (!project.summary || typeof project.summary !== 'object') {
    project.summary = {
      [LOCALE_ZH]: '',
      [LOCALE_EN]: '',
    };
  }

  project.summary[locale] = typeof nextSummary === 'string' ? nextSummary : '';
}

// 更新專案「我做了什麼」清單
function updateProjectContributions(slug, nextContributions) {
  const project = getProjectBySlug(slug);

  if (!project || !Array.isArray(nextContributions)) {
    return;
  }

  project.contributions = nextContributions
    .map((item) => {
      const zh = typeof item?.[LOCALE_ZH] === 'string' ? item[LOCALE_ZH].trim() : '';
      const en = typeof item?.[LOCALE_EN] === 'string' ? item[LOCALE_EN].trim() : '';

      return {
        [LOCALE_ZH]: zh,
        [LOCALE_EN]: en,
      };
    })
    .filter((item) => item[LOCALE_ZH].length > 0 || item[LOCALE_EN].length > 0);
}

// 新增專案技術標籤
function addProjectTechBySlug(slug, techName) {
  const normalizedTech = typeof techName === 'string' ? techName.trim() : '';
  const project = getProjectBySlug(slug);

  if (!project || !normalizedTech) {
    return;
  }

  if (!Array.isArray(project.tech)) {
    project.tech = [];
  }

  if (project.tech.includes(normalizedTech)) {
    return;
  }

  project.tech.push(normalizedTech);
}

// 移除專案技術標籤
function removeProjectTechBySlug(slug, techName) {
  const normalizedTech = typeof techName === 'string' ? techName.trim() : '';
  const project = getProjectBySlug(slug);

  if (!project || !Array.isArray(project.tech) || !normalizedTech) {
    return;
  }

  project.tech = project.tech.filter((item) => item !== normalizedTech);
}

function createProject() {
  if (!store.state.data) {
    return null;
  }

  if (!Array.isArray(store.state.data.projects)) {
    store.state.data.projects = [];
  }

  const latestIndex = store.state.data.projects.reduce((max, item) => {
    const match = /^project-(\d+)$/.exec(item?.id ?? '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  const nextIndex = latestIndex + 1;
  const nextId = `project-${String(nextIndex).padStart(2, '0')}`;
  const nextSlug = getUniqueProjectSlug(nextId);
  const defaultVersion = store.state.data.resumeVersions?.[0]?.id ?? 'frontend';
  const emptyLocaleText = {
    [LOCALE_ZH]: '',
    [LOCALE_EN]: '',
  };

  store.state.data.projects.unshift({
    id: nextId,
    slug: nextSlug,
    title: {
      [LOCALE_ZH]: '新專案',
      [LOCALE_EN]: 'New Project',
    },
    summary: {
      ...emptyLocaleText,
    },
    problem: {
      ...emptyLocaleText,
    },
    solution: {
      ...emptyLocaleText,
    },
    contributions: [],
    impact: [],
    tech: [],
    domainTags: [],
    versions: [defaultVersion],
    featured: false,
    updatedAt: new Date().toISOString().slice(0, 10),
    activity: {
      commits: 0,
      last30Days: 0,
    },
    links: {
      github: '',
      demo: '',
    },
    shots: [],
  });

  return nextSlug;
}

function deleteProject(projectSlug) {
  if (!store.state.data?.projects || !projectSlug) {
    return;
  }

  store.state.data.projects = store.state.data.projects.filter(
    (project) => project.slug !== projectSlug
  );
}

// 更新經歷的基本欄位（公司、起訖時間）
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
}

// 更新經歷的多語系欄位
function updateExperienceLocaleField(experienceId, fieldName, locale, nextValue) {
  const experience = getExperienceById(experienceId);

  if (!experience) {
    return;
  }

  if (!experience[fieldName] || typeof experience[fieldName] !== 'object') {
    experience[fieldName] = {
      [LOCALE_ZH]: '',
      [LOCALE_EN]: '',
    };
  }

  experience[fieldName][locale] = typeof nextValue === 'string' ? nextValue : '';
}

// 更新經歷重點清單
function updateExperienceHighlights(experienceId, nextHighlights) {
  const experience = getExperienceById(experienceId);

  if (!experience || !Array.isArray(nextHighlights)) {
    return;
  }

  experience.highlights = nextHighlights
    .map((item) => {
      const zh = typeof item?.[LOCALE_ZH] === 'string' ? item[LOCALE_ZH].trim() : '';
      const en = typeof item?.[LOCALE_EN] === 'string' ? item[LOCALE_EN].trim() : '';

      return {
        [LOCALE_ZH]: zh,
        [LOCALE_EN]: en,
      };
    })
    .filter((item) => item[LOCALE_ZH].length > 0 || item[LOCALE_EN].length > 0);
}

// 新增一筆空白經歷，回傳新 id
function createExperience() {
  if (!store.state.data) {
    return null;
  }

  if (!Array.isArray(store.state.data.experiences)) {
    store.state.data.experiences = [];
  }

  const latestIndex = store.state.data.experiences.reduce((max, item) => {
    const match = /^exp-(\d+)$/.exec(item?.id ?? '');
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  const nextId = `exp-${String(latestIndex + 1).padStart(2, '0')}`;
  const currentMonth = new Date().toISOString().slice(0, 7);

  store.state.data.experiences.unshift({
    id: nextId,
    start: currentMonth,
    end: null,
    company: '',
    role: {
      [LOCALE_ZH]: '',
      [LOCALE_EN]: '',
    },
    summary: {
      [LOCALE_ZH]: '',
      [LOCALE_EN]: '',
    },
    highlights: [],
  });

  return nextId;
}

// 刪除一筆經歷
function deleteExperience(experienceId) {
  if (!store.state.data?.experiences || !experienceId) {
    return;
  }

  store.state.data.experiences = store.state.data.experiences.filter(
    (item) => item.id !== experienceId
  );
}

// 驗證 PIN 後登入 CMS
function submitLogin() {
  loginError.value = '';

  const success = login(pin.value.trim());

  if (!success) {
    loginError.value = adminText.value.login.error;
    return;
  }

  pin.value = '';
}

// 儲存個人主資料
function saveMeta() {
  if (!store.state.data?.meta) {
    showSaveNotice('meta', false);
    return;
  }

  updateMetaField('ownerName', ownerName.value.trim());
  updateMetaLocaleField('jobTitle', LOCALE_ZH, jobTitleZh.value.trim());
  updateMetaLocaleField('jobTitle', LOCALE_EN, jobTitleEn.value.trim());
  updateMetaLocaleField('summary', LOCALE_ZH, summaryZh.value.trim());
  updateMetaLocaleField('summary', LOCALE_EN, summaryEn.value.trim());
  persistData();
  showSaveNotice('meta', true);
}

// 儲存專案摘要與我做了什麼
function saveProject() {
  if (!selectedProjectSlug.value) {
    showSaveNotice('project', false);
    return;
  }

  const nextSlug = updateProjectBase(selectedProjectSlug.value, {
    slug: projectSlugDraft.value.trim(),
    titleZh: projectTitleZh.value.trim(),
    titleEn: projectTitleEn.value.trim(),
  });

  updateProjectSummary(nextSlug, LOCALE_ZH, projectSummaryZh.value.trim());
  updateProjectSummary(nextSlug, LOCALE_EN, projectSummaryEn.value.trim());
  updateProjectContributions(
    nextSlug,
    buildLocaleLines(projectContributionsZh.value, projectContributionsEn.value)
  );

  selectedProjectSlug.value = nextSlug;
  persistData();
  showSaveNotice('project', true);
}

function addProject() {
  const nextSlug = createProject();

  if (!nextSlug) {
    showSaveNotice('project', false);
    return;
  }

  persistData();
  selectedProjectSlug.value = nextSlug;
  syncProjectEditor();
  showSaveNotice('project', true);
}

function removeProject() {
  if (!selectedProjectSlug.value) {
    return;
  }

  const currentSlug = selectedProjectSlug.value;
  deleteProject(currentSlug);
  persistData();

  selectedProjectSlug.value = projects.value[0]?.slug ?? '';
  syncProjectEditor();
  showSaveNotice('project', true);
}

// 新增專案技術標籤
function addProjectTech() {
  if (!selectedProjectSlug.value) {
    return;
  }

  const techName = nextTechName.value.trim();

  if (!techName) {
    return;
  }

  addProjectTechBySlug(selectedProjectSlug.value, techName);
  persistData();
  nextTechName.value = '';
}

// 移除專案技術標籤
function removeProjectTech(techName) {
  if (!selectedProjectSlug.value) {
    return;
  }

  removeProjectTechBySlug(selectedProjectSlug.value, techName);
  persistData();
}

// 新增主資料技能
function addMetaSkill() {
  const skillName = nextSkillName.value.trim();

  if (!skillName) {
    return;
  }

  addSkill(skillName);
  persistData();
  nextSkillName.value = '';
}

// 移除主資料技能
function removeMetaSkill(skillName) {
  removeSkill(skillName);
  persistData();
}

// 儲存經歷資料
function saveExperience() {
  if (!selectedExperienceId.value) {
    showSaveNotice('experience', false);
    return;
  }

  updateExperienceBase(selectedExperienceId.value, {
    company: expCompany.value.trim(),
    start: expStart.value.trim(),
    end: expEnd.value.trim() || null,
  });

  updateExperienceLocaleField(
    selectedExperienceId.value,
    'role',
    LOCALE_ZH,
    expRoleZh.value.trim()
  );
  updateExperienceLocaleField(
    selectedExperienceId.value,
    'role',
    LOCALE_EN,
    expRoleEn.value.trim()
  );
  updateExperienceLocaleField(
    selectedExperienceId.value,
    'summary',
    LOCALE_ZH,
    expSummaryZh.value.trim()
  );
  updateExperienceLocaleField(
    selectedExperienceId.value,
    'summary',
    LOCALE_EN,
    expSummaryEn.value.trim()
  );

  updateExperienceHighlights(
    selectedExperienceId.value,
    buildLocaleLines(expHighlightsZh.value, expHighlightsEn.value)
  );
  persistData();
  showSaveNotice('experience', true);
}

// 新增經歷並切到新資料
function addExperience() {
  const nextId = createExperience();

  if (!nextId) {
    return;
  }

  persistData();
  selectedExperienceId.value = nextId;
  syncExperienceEditor();
}

// 刪除目前經歷，並切到下一筆
function removeExperience() {
  if (!selectedExperienceId.value) {
    return;
  }

  const currentId = selectedExperienceId.value;
  deleteExperience(currentId);
  persistData();

  const fallbackId = experiences.value[0]?.id ?? '';
  selectedExperienceId.value = fallbackId;
  syncExperienceEditor();
}

watch(
  () => store.state.data,
  () => {
    if (!selectedProjectSlug.value && projects.value.length > 0) {
      selectedProjectSlug.value = projects.value[0].slug;
    }

    if (!selectedExperienceId.value && experiences.value.length > 0) {
      selectedExperienceId.value = experiences.value[0].id;
    }

    syncMetaEditor();
    syncProjectEditor();
    syncExperienceEditor();
  },
  { immediate: true }
);

watch(selectedProjectSlug, syncProjectEditor);
watch(selectedExperienceId, syncExperienceEditor);

// 離開頁面前清除通知計時器，避免記憶體殘留
onBeforeUnmount(() => {
  Object.keys(saveNoticeTimers).forEach((key) => {
    if (saveNoticeTimers[key]) {
      window.clearTimeout(saveNoticeTimers[key]);
      saveNoticeTimers[key] = null;
    }
  });
});
</script>

<template>
  <section class="panel admin-wrap">
    <div
      v-if="visibleSaveNotices.length > 0"
      class="toast-wrap"
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        v-for="notice in visibleSaveNotices"
        :key="`${notice.id}-${notice.at}`"
        :class="[
          'save-notice',
          notice.type === 'success' ? 'save-notice--success' : 'save-notice--error',
        ]"
      >
        {{ notice.text }}
      </p>
    </div>
    <header class="section-head">
      <h1 class="section-title">{{ adminText.title }}</h1>
      <p class="section-desc">{{ adminText.description }}</p>
    </header>

    <div v-if="!isLoggedIn" class="card login-box">
      <h2>{{ adminText.login.title }}</h2>
      <p>{{ adminText.login.hint }}</p>
      <input
        v-model="pin"
        type="password"
        class="text-input"
        :placeholder="adminText.login.pinPlaceholder"
      />
      <button class="btn btn-primary" type="button" @click="submitLogin">
        {{ adminText.login.button }}
      </button>
      <p v-if="loginError" class="error-text">{{ loginError }}</p>
    </div>

    <div v-else class="admin-grid">
      <section class="card edit-card">
        <h2>{{ adminText.meta.title }}</h2>

        <label class="field-label">
          <span>{{ adminText.fieldName }}</span>
          <input v-model="ownerName" type="text" class="text-input" />
        </label>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ adminText.fieldJobTitle }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <input v-model="jobTitleZh" type="text" class="text-input" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <input v-model="jobTitleEn" type="text" class="text-input" />
          </label>
        </section>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ adminText.fieldSummary }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <textarea v-model="summaryZh" class="text-area" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <textarea v-model="summaryEn" class="text-area" />
          </label>
        </section>

        <div class="tech-editor">
          <label class="field-label">
            <span>{{ adminText.fieldSkills }}</span>
            <div class="tech-input-row">
              <input
                v-model="nextSkillName"
                type="text"
                class="text-input"
                :placeholder="adminText.skillsPlaceholder"
                @keydown.enter.prevent="addMetaSkill"
              />
              <button class="btn" type="button" @click="addMetaSkill">
                {{ adminText.skillsAdd }}
              </button>
            </div>
          </label>

          <div class="tech-list">
            <div v-for="skill in metaSkills" :key="`meta-skill-${skill.id}`" class="tech-row">
              <span class="pill">{{ skill.name }}</span>
              <button class="btn" type="button" @click="removeMetaSkill(skill.name)">
                {{ adminText.skillsRemove }}
              </button>
            </div>
            <p v-if="metaSkills.length === 0" class="empty-tech">
              {{ adminText.skillsEmpty }}
            </p>
          </div>
        </div>

        <button class="btn btn-primary" type="button" @click="saveMeta">
          {{ adminText.meta.save }}
        </button>
      </section>

      <section class="card edit-card">
        <h2>{{ adminText.project.title }}</h2>

        <label class="field-label">
          <span>{{ adminText.project.select }}</span>
          <select v-model="selectedProjectSlug" class="select-input">
            <option v-for="project in projects" :key="project.id" :value="project.slug">
              {{ formatProjectOption(project) }}
            </option>
          </select>
        </label>

        <div class="experience-actions">
          <button class="btn" type="button" @click="addProject">
            {{ localeLabel('新增專案', 'Add Project') }}
          </button>
          <button
            class="btn btn-danger"
            type="button"
            :disabled="!selectedProjectSlug"
            @click="removeProject"
          >
            {{ localeLabel('刪除目前專案', 'Remove Current Project') }}
          </button>
        </div>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ localeLabel('專案名稱', 'Project Title') }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <input v-model="projectTitleZh" type="text" class="text-input" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <input v-model="projectTitleEn" type="text" class="text-input" />
          </label>
        </section>

        <label class="field-label">
          <span>{{ localeLabel('專案 Slug（網址代號）', 'Project Slug (URL)') }}</span>
          <input
            v-model="projectSlugDraft"
            type="text"
            class="text-input"
            :placeholder="localeLabel('例如：my-project', 'Example: my-project')"
          />
        </label>

        <label class="field-label">
          <span>{{ adminText.projectSummaryZh }}</span>
          <textarea v-model="projectSummaryZh" class="text-area" />
        </label>

        <label class="field-label">
          <span>{{ adminText.projectSummaryEn }}</span>
          <textarea v-model="projectSummaryEn" class="text-area" />
        </label>

        <label class="field-label">
          <span>{{ adminText.projectContributionZh }}</span>
          <textarea v-model="projectContributionsZh" class="text-area short-area" />
        </label>

        <label class="field-label">
          <span>{{ adminText.projectContributionEn }}</span>
          <textarea v-model="projectContributionsEn" class="text-area short-area" />
        </label>

        <p class="hint-text">{{ adminText.projectContributionHint }}</p>

        <div class="tech-editor">
          <label class="field-label">
            <span>{{ adminText.project.tech }}</span>
            <div class="tech-input-row">
              <input
                v-model="nextTechName"
                type="text"
                class="text-input"
                :placeholder="adminText.project.techPlaceholder"
                @keydown.enter.prevent="addProjectTech"
              />
              <button class="btn" type="button" @click="addProjectTech">
                {{ adminText.project.add }}
              </button>
            </div>
          </label>

          <div class="tech-list">
            <div
              v-for="tech in selectedProjectTech"
              :key="`tech-${selectedProjectSlug}-${tech}`"
              class="tech-row"
            >
              <span class="pill">{{ tech }}</span>
              <button class="btn" type="button" @click="removeProjectTech(tech)">
                {{ adminText.project.remove }}
              </button>
            </div>
            <p v-if="selectedProjectTech.length === 0" class="empty-tech">
              {{ adminText.project.emptyTech }}
            </p>
          </div>
        </div>

        <button class="btn btn-primary" type="button" @click="saveProject">
          {{ adminText.project.save }}
        </button>
      </section>

      <section class="card edit-card">
        <h2>{{ adminText.experience.title }}</h2>

        <label class="field-label">
          <span>{{ adminText.experience.select }}</span>
          <select v-model="selectedExperienceId" class="select-input">
            <option v-for="item in experiences" :key="item.id" :value="item.id">
              {{ formatExperienceOption(item) }}
            </option>
          </select>
        </label>

        <div class="experience-actions">
          <button class="btn" type="button" @click="addExperience">
            {{ adminText.experience.add }}
          </button>
          <button
            class="btn btn-danger"
            type="button"
            :disabled="!selectedExperienceId"
            @click="removeExperience"
          >
            {{ adminText.experience.remove }}
          </button>
        </div>

        <label class="field-label">
          <span>{{ adminText.experience.company }}</span>
          <input v-model="expCompany" type="text" class="text-input" />
        </label>

        <div class="date-grid">
          <label class="field-label">
            <span>{{ adminText.experience.start }}</span>
            <input v-model="expStart" type="month" class="text-input" />
          </label>
          <label class="field-label">
            <span>{{ adminText.experience.end }}</span>
            <input v-model="expEnd" type="month" class="text-input" />
          </label>
        </div>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ adminText.fieldRole }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <input v-model="expRoleZh" type="text" class="text-input" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <input v-model="expRoleEn" type="text" class="text-input" />
          </label>
        </section>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ adminText.fieldSummary }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <textarea v-model="expSummaryZh" class="text-area" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <textarea v-model="expSummaryEn" class="text-area" />
          </label>
        </section>

        <section class="bilingual-field">
          <p class="bilingual-title">{{ adminText.fieldHighlights }}</p>
          <label class="field-label">
            <span class="locale-label">{{ adminText.localeZh }}</span>
            <textarea v-model="expHighlightsZh" class="text-area short-area" />
          </label>

          <label class="field-label">
            <span class="locale-label">{{ adminText.localeEn }}</span>
            <textarea v-model="expHighlightsEn" class="text-area short-area" />
          </label>
        </section>

        <p class="hint-text">{{ adminText.experience.hint }}</p>

        <button class="btn btn-primary" type="button" @click="saveExperience">
          {{ adminText.experience.save }}
        </button>
      </section>

      <section class="card edit-card action-card">
        <h2>{{ adminText.actions.title }}</h2>
        <button class="btn btn-danger" type="button" @click="logout">
          {{ adminText.actions.logout }}
        </button>
      </section>
    </div>
  </section>
</template>

<style scoped>
.admin-wrap {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
}

.toast-wrap {
  position: fixed;
  left: 50%;
  top: clamp(3.8rem, 18vh, 8.5rem);
  transform: translateX(-50%);
  width: min(560px, calc(100vw - 1.4rem));
  display: grid;
  gap: 0.45rem;
  z-index: 999;
  pointer-events: none;
}

.login-box {
  display: grid;
  gap: 0.7rem;
  max-width: 420px;
  padding: 1rem;
}

.login-box h2 {
  margin: 0;
}

.error-text {
  margin: 0;
  color: #c24940;
}

.admin-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.edit-card {
  padding: 1rem;
  display: grid;
  gap: 0.7rem;
  min-width: 0;
  align-content: start;
}

.edit-card h2 {
  margin: 0;
  font-size: 1.1rem;
}

.field-label {
  display: grid;
  gap: 0.35rem;
  align-content: start;
}

.field-label span {
  color: var(--text-soft);
  font-size: 0.86rem;
}

.bilingual-field {
  display: grid;
  gap: 0.45rem;
  align-content: start;
}

.bilingual-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
}

.locale-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.tech-editor {
  margin-top: 0.4rem;
  display: grid;
  gap: 0.6rem;
}

.tech-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.tech-list {
  display: grid;
  gap: 0.45rem;
}

.tech-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.empty-tech {
  margin: 0;
  color: var(--text-soft);
}

.experience-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.short-area {
  min-height: 84px;
}

.hint-text {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.84rem;
}

.save-notice {
  margin: 0;
  padding: 0.5rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 0.84rem;
  font-weight: 600;
  box-shadow: 0 10px 26px rgba(20, 36, 30, 0.2);
}

.save-notice--success {
  color: #1f6a39;
  background: #e9f7ef;
  border-color: #bfe3ca;
}

.save-notice--error {
  color: #8b2f2f;
  background: #fdeeee;
  border-color: #e8bcbc;
}

.action-card {
  align-content: start;
}

@media (max-width: 980px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }

  .tech-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-grid {
    grid-template-columns: 1fr;
  }
}
</style>
