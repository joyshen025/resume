<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useResumeStore } from '../stores/resumeStore';

const route = useRoute();
const store = useResumeStore();

const project = computed(() => {
  const allProjects = store.state.data?.projects ?? [];
  return allProjects.find((item) => item.slug === route.params.slug);
});
const projectContributions = computed(() => {
  if (!project.value) {
    return [];
  }

  if (Array.isArray(project.value.contributions) && project.value.contributions.length > 0) {
    return project.value.contributions;
  }

  return project.value.solution ? [project.value.solution] : [];
});
const projectTech = computed(() => project.value?.tech ?? []);

function localeText(zhText, enText) {
  return store.state.locale === 'en-US' ? enText : zhText;
}
</script>

<template>
  <section v-if="project" class="panel detail-wrap">
    <RouterLink to="/projects" class="btn back-btn">
      {{ store.ui('projectDetail.backToProjects') }}
    </RouterLink>

    <header class="detail-head">
      <h1>{{ store.t(project.title) }}</h1>
      <p>{{ store.t(project.summary) }}</p>
      <div class="meta">
        <span class="pill">{{ project.updatedAt }}</span>
      </div>
    </header>

    <section v-if="projectContributions.length > 0" class="panel block">
      <h2 class="section-title">{{ localeText('我在這個專案做了什麼', 'What I Did') }}</h2>
      <ul class="impact-list">
        <li v-for="(entry, index) in projectContributions" :key="`contribution-${index}`">
          {{ store.t(entry) }}
        </li>
      </ul>
    </section>

    <section class="panel block">
      <h2 class="section-title">{{ localeText('使用技術', 'Technologies Used') }}</h2>
      <div class="tag-list">
        <span v-for="tag in projectTech" :key="`tech-${tag}`" class="pill">
          {{ tag }}
        </span>
      </div>
      <p v-if="projectTech.length === 0" class="empty-text">
        {{ localeText('尚未填寫技術', 'No tech listed yet') }}
      </p>
    </section>

    <section class="panel block">
      <h2 class="section-title">{{ store.ui('projectDetail.preview') }}</h2>
      <div class="shot-grid">
        <figure v-for="shot in project.shots ?? []" :key="shot.name" class="card shot">
          <img :src="shot.url" :alt="shot.name" />
          <figcaption>{{ shot.name }}</figcaption>
        </figure>
      </div>
    </section>

    <footer class="link-row">
      <a class="btn btn-primary" :href="project.links?.github" target="_blank" rel="noreferrer">
        GitHub
      </a>
      <a class="btn" :href="project.links?.demo" target="_blank" rel="noreferrer">Demo</a>
    </footer>
  </section>

  <section v-else class="panel detail-wrap">
    <h1>{{ store.ui('projectDetail.notFound') }}</h1>
    <RouterLink to="/projects" class="btn">
      {{ store.ui('projectDetail.backToList') }}
    </RouterLink>
  </section>
</template>

<style scoped>
.detail-wrap {
  display: grid;
  gap: 0.9rem;
  padding: 1.2rem;
}

.back-btn {
  width: fit-content;
}

.detail-head h1 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-family: 'Space Grotesk', 'IBM Plex Sans', sans-serif;
}

.detail-head p {
  margin: 0.6rem 0 0;
}

.meta {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.block {
  padding: 0.9rem;
  gap: 0.62rem;
}

.block p {
  margin: 0.45rem 0 0;
  color: var(--text-soft);
}

.impact-list {
  margin: 0.6rem 0 0;
  padding-left: 1.2rem;
  color: var(--text-soft);
}

.tag-list {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-text {
  margin: 0.5rem 0 0;
  color: var(--text-soft);
}

.shot-grid {
  margin-top: 0.6rem;
  display: grid;
  gap: 0.7rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shot {
  margin: 0;
  padding: 0.8rem;
  display: grid;
  gap: 0.5rem;
}

.shot img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: contain;
  border-radius: 10px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
}

.shot figcaption {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.link-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 880px) {
  .shot-grid {
    grid-template-columns: 1fr;
  }
}
</style>
