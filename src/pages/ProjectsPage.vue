<script setup>
import { computed, ref } from 'vue';
import ProjectCard from '../components/ProjectCard.vue';
import TagFilter from '../components/TagFilter.vue';
import { useResumeStore } from '../stores/resumeStore';
import { localizeText } from '../utils/i18n';

const store = useResumeStore();
const keyword = ref('');
const selectedTags = ref([]);

const allTags = computed(() => {
  // 這裡把 tech + domainTag 合併成可篩選清單。
  const tags = new Set();

  for (const project of store.visibleProjects.value) {
    for (const tag of project.tech ?? []) {
      tags.add(tag);
    }

    for (const tag of project.domainTags ?? []) {
      tags.add(tag);
    }
  }

  return [...tags].sort();
});

const filteredProjects = computed(() => {
  const query = keyword.value.trim().toLowerCase();

  // 篩選邏輯：先過版本，再做關鍵字 + tag AND 條件。
  return store.visibleProjects.value
    .filter((project) => {
      const title = localizeText(project.title, store.state.locale).toLowerCase();
      const summary = localizeText(project.summary, store.state.locale).toLowerCase();
      const tags = [...(project.tech ?? []), ...(project.domainTags ?? [])];
      const tagMatches =
        selectedTags.value.length === 0 || selectedTags.value.every((tag) => tags.includes(tag));
      const queryMatches =
        query.length === 0 ||
        title.includes(query) ||
        summary.includes(query) ||
        tags.some((tag) => tag.toLowerCase().includes(query));

      return tagMatches && queryMatches;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
});

const resultCountText = computed(() =>
  store.ui('projects.resultCount', { count: filteredProjects.value.length })
);
</script>

<template>
  <section class="panel projects-wrap">
    <header class="section-head">
      <h1 class="section-title">{{ store.ui('projects.title') }}</h1>
      <p class="section-desc">{{ store.ui('projects.description') }}</p>
    </header>

    <div class="controls">
      <input
        v-model="keyword"
        type="search"
        class="text-input"
        :placeholder="store.ui('projects.searchPlaceholder')"
      />

      <TagFilter v-model="selectedTags" :tags="allTags" />
    </div>

    <p class="result-count">{{ resultCountText }}</p>

    <div v-if="filteredProjects.length > 0" class="project-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :locale="store.state.locale"
      />
    </div>

    <p v-else class="empty-state">{{ store.ui('projects.emptyState') }}</p>
  </section>
</template>

<style scoped>
.projects-wrap {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
}

.controls {
  display: grid;
  gap: 0.7rem;
}

.result-count {
  margin: 0;
  color: var(--text-soft);
}

.project-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.empty-state {
  margin: 0;
  color: var(--text-soft);
}

@media (max-width: 960px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
