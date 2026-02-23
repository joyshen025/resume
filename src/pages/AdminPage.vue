<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useResumeStore } from '../stores/resumeStore';
import { getAdminSaveNotice, getAdminText } from '../constants/adminText';

const store = useResumeStore();
const pin = ref('');
const loginError = ref('');

const ownerName = ref('');
const jobTitleZh = ref('');
const jobTitleEn = ref('');
const summaryZh = ref('');
const summaryEn = ref('');
const nextSkillName = ref('');

const selectedProjectSlug = ref('');
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

const isLoggedIn = computed(() => store.isLoggedIn.value);

const orderedSections = computed(() => {
  const map = new Map(
    (store.state.data?.sectionCatalog ?? []).map((section) => [section.id, section])
  );
  const order = store.state.data?.sectionOrder ?? [];
  return order.map((id) => map.get(id)).filter(Boolean);
});

const projects = computed(() => store.state.data?.projects ?? []);
const selectedProject = computed(() =>
  projects.value.find((project) => project.slug === selectedProjectSlug.value)
);
const selectedProjectTech = computed(() => selectedProject.value?.tech ?? []);
const metaSkills = computed(() => store.state.data?.skills ?? []);
const adminText = computed(() => getAdminText(store.state.locale));
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

const experiences = computed(() => store.state.data?.experiences ?? []);
const selectedExperience = computed(() =>
  experiences.value.find((item) => item.id === selectedExperienceId.value)
);

function formatExperienceOption(item) {
  const untitled = store.ui('admin.untitledExperience');
  const company = item.company?.trim() ? item.company : untitled;
  const period = item.start ? ` - ${item.start}` : '';
  return `${company}${period}`;
}

function syncMetaEditor() {
  const meta = store.state.data?.meta;

  if (!meta) {
    return;
  }

  ownerName.value = meta.ownerName ?? '';
  jobTitleZh.value = meta.jobTitle?.['zh-TW'] ?? '';
  jobTitleEn.value = meta.jobTitle?.['en-US'] ?? '';
  summaryZh.value = meta.summary?.['zh-TW'] ?? '';
  summaryEn.value = meta.summary?.['en-US'] ?? '';
  nextSkillName.value = '';
}

function syncProjectEditor() {
  const project = selectedProject.value;

  if (!project) {
    projectSummaryZh.value = '';
    projectSummaryEn.value = '';
    projectContributionsZh.value = '';
    projectContributionsEn.value = '';
    nextTechName.value = '';
    return;
  }

  projectSummaryZh.value = project.summary?.['zh-TW'] ?? '';
  projectSummaryEn.value = project.summary?.['en-US'] ?? '';
  const contributions =
    Array.isArray(project.contributions) && project.contributions.length > 0
      ? project.contributions
      : project.solution
        ? [project.solution]
        : [];
  projectContributionsZh.value = contributions.map((item) => item?.['zh-TW'] ?? '').join('\n');
  projectContributionsEn.value = contributions.map((item) => item?.['en-US'] ?? '').join('\n');
  nextTechName.value = '';
}

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
  expRoleZh.value = experience.role?.['zh-TW'] ?? '';
  expRoleEn.value = experience.role?.['en-US'] ?? '';
  expSummaryZh.value = experience.summary?.['zh-TW'] ?? '';
  expSummaryEn.value = experience.summary?.['en-US'] ?? '';

  const highlights = Array.isArray(experience.highlights) ? experience.highlights : [];
  expHighlightsZh.value = highlights.map((item) => item?.['zh-TW'] ?? '').join('\n');
  expHighlightsEn.value = highlights.map((item) => item?.['en-US'] ?? '').join('\n');
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

function submitLogin() {
  loginError.value = '';

  const success = store.login(pin.value.trim());

  if (!success) {
    loginError.value = store.ui('admin.login.error');
    return;
  }

  pin.value = '';
}

function saveMeta() {
  if (!store.state.data?.meta) {
    showSaveNotice('meta', false);
    return;
  }

  store.updateMetaField('ownerName', ownerName.value.trim());
  store.updateMetaLocaleField('jobTitle', 'zh-TW', jobTitleZh.value.trim());
  store.updateMetaLocaleField('jobTitle', 'en-US', jobTitleEn.value.trim());
  store.updateMetaLocaleField('summary', 'zh-TW', summaryZh.value.trim());
  store.updateMetaLocaleField('summary', 'en-US', summaryEn.value.trim());
  showSaveNotice('meta', true);
}

function saveProject() {
  if (!selectedProjectSlug.value) {
    showSaveNotice('project', false);
    return;
  }

  store.updateProjectSummary(selectedProjectSlug.value, 'zh-TW', projectSummaryZh.value.trim());
  store.updateProjectSummary(selectedProjectSlug.value, 'en-US', projectSummaryEn.value.trim());

  const zhLines = projectContributionsZh.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const enLines = projectContributionsEn.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const maxLength = Math.max(zhLines.length, enLines.length);
  const nextContributions = [];

  for (let index = 0; index < maxLength; index += 1) {
    const zh = zhLines[index] ?? '';
    const en = enLines[index] ?? '';

    if (zh.length > 0 || en.length > 0) {
      nextContributions.push({
        'zh-TW': zh,
        'en-US': en,
      });
    }
  }

  store.updateProjectContributions(selectedProjectSlug.value, nextContributions);
  showSaveNotice('project', true);
}

function addProjectTech() {
  if (!selectedProjectSlug.value) {
    return;
  }

  const techName = nextTechName.value.trim();

  if (!techName) {
    return;
  }

  store.addProjectTech(selectedProjectSlug.value, techName);
  nextTechName.value = '';
}

function removeProjectTech(techName) {
  if (!selectedProjectSlug.value) {
    return;
  }

  store.removeProjectTech(selectedProjectSlug.value, techName);
}

function addMetaSkill() {
  const skillName = nextSkillName.value.trim();

  if (!skillName) {
    return;
  }

  store.addSkill(skillName);
  nextSkillName.value = '';
}

function removeMetaSkill(skillName) {
  store.removeSkill(skillName);
}

function saveExperience() {
  if (!selectedExperienceId.value) {
    showSaveNotice('experience', false);
    return;
  }

  store.updateExperienceBase(selectedExperienceId.value, {
    company: expCompany.value.trim(),
    start: expStart.value.trim(),
    end: expEnd.value.trim() || null,
  });

  store.updateExperienceLocaleField(
    selectedExperienceId.value,
    'role',
    'zh-TW',
    expRoleZh.value.trim()
  );
  store.updateExperienceLocaleField(
    selectedExperienceId.value,
    'role',
    'en-US',
    expRoleEn.value.trim()
  );
  store.updateExperienceLocaleField(
    selectedExperienceId.value,
    'summary',
    'zh-TW',
    expSummaryZh.value.trim()
  );
  store.updateExperienceLocaleField(
    selectedExperienceId.value,
    'summary',
    'en-US',
    expSummaryEn.value.trim()
  );

  const zhLines = expHighlightsZh.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const enLines = expHighlightsEn.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const maxLength = Math.max(zhLines.length, enLines.length);
  const nextHighlights = [];

  for (let index = 0; index < maxLength; index += 1) {
    const zh = zhLines[index] ?? '';
    const en = enLines[index] ?? '';

    if (zh.length > 0 || en.length > 0) {
      nextHighlights.push({
        'zh-TW': zh,
        'en-US': en,
      });
    }
  }

  store.updateExperienceHighlights(selectedExperienceId.value, nextHighlights);
  showSaveNotice('experience', true);
}

function addExperience() {
  const nextId = store.addExperience();

  if (!nextId) {
    return;
  }

  selectedExperienceId.value = nextId;
  syncExperienceEditor();
}

function removeExperience() {
  if (!selectedExperienceId.value) {
    return;
  }

  const currentId = selectedExperienceId.value;
  store.removeExperience(currentId);

  const fallbackId = experiences.value[0]?.id ?? '';
  selectedExperienceId.value = fallbackId;
  syncExperienceEditor();
}

async function restoreDefault() {
  await store.resetData();
  syncMetaEditor();
  syncProjectEditor();

  if (!selectedExperienceId.value && experiences.value.length > 0) {
    selectedExperienceId.value = experiences.value[0].id;
  }

  syncExperienceEditor();
}

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
    <div v-if="visibleSaveNotices.length > 0" class="toast-wrap" aria-live="polite" aria-atomic="true">
      <p
        v-for="notice in visibleSaveNotices"
        :key="`${notice.id}-${notice.at}`"
        :class="['save-notice', notice.type === 'success' ? 'save-notice--success' : 'save-notice--error']"
      >
        {{ notice.text }}
      </p>
    </div>
    <header class="section-head">
      <h1 class="section-title">{{ store.ui('admin.title') }}</h1>
      <p class="section-desc">{{ store.ui('admin.description') }}</p>
    </header>

    <div v-if="!isLoggedIn" class="card login-box">
      <h2>{{ store.ui('admin.login.title') }}</h2>
      <p>{{ store.t(store.state.data?.security?.loginHint ?? { 'zh-TW': '', 'en-US': '' }) }}</p>
      <input
        v-model="pin"
        type="password"
        class="text-input"
        :placeholder="store.ui('admin.login.pinPlaceholder')"
      />
      <button class="btn btn-primary" type="button" @click="submitLogin">
        {{ store.ui('admin.login.button') }}
      </button>
      <p v-if="loginError" class="error-text">{{ loginError }}</p>
    </div>

    <div v-else class="admin-grid">
      <section class="card edit-card">
        <h2>{{ store.ui('admin.meta.title') }}</h2>

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
          {{ store.ui('admin.meta.save') }}
        </button>
      </section>

      <section class="card edit-card">
        <h2>{{ store.ui('admin.project.title') }}</h2>

        <label class="field-label">
          <span>{{ store.ui('admin.project.select') }}</span>
          <select v-model="selectedProjectSlug" class="select-input">
            <option v-for="project in projects" :key="project.id" :value="project.slug">
              {{ store.t(project.title) }}
            </option>
          </select>
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
            <span>{{ store.ui('admin.project.tech') }}</span>
            <div class="tech-input-row">
              <input
                v-model="nextTechName"
                type="text"
                class="text-input"
                :placeholder="store.ui('admin.project.techPlaceholder')"
                @keydown.enter.prevent="addProjectTech"
              />
              <button class="btn" type="button" @click="addProjectTech">
                {{ store.ui('admin.project.add') }}
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
                {{ store.ui('admin.project.remove') }}
              </button>
            </div>
            <p v-if="selectedProjectTech.length === 0" class="empty-tech">
              {{ store.ui('admin.project.emptyTech') }}
            </p>
          </div>
        </div>

        <button class="btn btn-primary" type="button" @click="saveProject">
          {{ store.ui('admin.project.save') }}
        </button>
      </section>

      <section class="card edit-card">
        <h2>{{ store.ui('admin.experience.title') }}</h2>

        <label class="field-label">
          <span>{{ store.ui('admin.experience.select') }}</span>
          <select v-model="selectedExperienceId" class="select-input">
            <option v-for="item in experiences" :key="item.id" :value="item.id">
              {{ formatExperienceOption(item) }}
            </option>
          </select>
        </label>

        <div class="experience-actions">
          <button class="btn" type="button" @click="addExperience">
            {{ store.ui('admin.experience.add') }}
          </button>
          <button
            class="btn btn-danger"
            type="button"
            :disabled="!selectedExperienceId"
            @click="removeExperience"
          >
            {{ store.ui('admin.experience.remove') }}
          </button>
        </div>

        <label class="field-label">
          <span>{{ store.ui('admin.experience.company') }}</span>
          <input v-model="expCompany" type="text" class="text-input" />
        </label>

        <div class="date-grid">
          <label class="field-label">
            <span>{{ store.ui('admin.experience.start') }}</span>
            <input v-model="expStart" type="month" class="text-input" />
          </label>
          <label class="field-label">
            <span>{{ store.ui('admin.experience.end') }}</span>
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

        <p class="hint-text">{{ store.ui('admin.experience.hint') }}</p>

        <button class="btn btn-primary" type="button" @click="saveExperience">
          {{ store.ui('admin.experience.save') }}
        </button>
      </section>

      <section class="card edit-card action-card">
        <h2>{{ store.ui('admin.actions.title') }}</h2>
        <button class="btn" type="button" @click="restoreDefault">
          {{ store.ui('admin.actions.restore') }}
        </button>
        <button class="btn btn-danger" type="button" @click="store.logout">
          {{ store.ui('admin.actions.logout') }}
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

.order-list {
  display: grid;
  gap: 0.5rem;
}

.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.52rem 0.6rem;
}

.order-actions {
  display: flex;
  gap: 0.35rem;
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

  .order-row,
  .tech-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-grid {
    grid-template-columns: 1fr;
  }
}
</style>


