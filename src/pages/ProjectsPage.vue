<script setup>
import { computed, ref } from 'vue';
import ProjectCard from '../components/ProjectCard.vue';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();
const selectedTags = ref([]);

function getProjectTags(project) {
  const tech = Array.isArray(project.tech) ? project.tech : [];
  const domains = Array.isArray(project.domainTags) ? project.domainTags : [];
  return [...tech, ...domains];
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag);
    return;
  }

  selectedTags.value.push(tag);
}

function clearTags() {
  selectedTags.value = [];
}

const allTags = computed(() => {
  const tagSet = new Set();

  for (const project of store.visibleProjects.value) {
    for (const tag of getProjectTags(project)) {
      tagSet.add(tag);
    }
  }

  return [...tagSet].sort();
});

const filteredProjects = computed(() => {
  const matches = store.visibleProjects.value.filter((project) => {
    if (selectedTags.value.length === 0) {
      return true;
    }

    const projectTags = getProjectTags(project);
    return selectedTags.value.some((tag) => projectTags.includes(tag));
  });

  return [...matches].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
      <div class="filters">
        <button class="btn btn-danger" type="button" @click="clearTags">
          {{ store.ui('tagFilter.clear') }}
        </button>

        <button
          v-for="tag in allTags"
          :key="tag"
          class="btn"
          type="button"
          :class="{ 'is-active': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <p class="result-count">{{ resultCountText }}</p>

    <div v-if="filteredProjects.length > 0" class="project-grid">
      <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
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

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filters .btn {
  padding: 0.42rem 0.72rem;
  font-size: 0.82rem;
}

.filters .btn.is-active {
  border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
  background: color-mix(in srgb, var(--accent) 20%, transparent);
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
