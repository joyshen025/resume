<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { localizeText } from '../utils/i18n';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  locale: {
    type: String,
    default: 'zh-TW',
  },
});

const projectTitle = computed(() => localizeText(props.project.title, props.locale));
const projectSummary = computed(() => localizeText(props.project.summary, props.locale));
const detailCtaLabel = computed(() => store.ui('projectCard.viewDetails'));
</script>

<template>
  <article class="card project-card">
    <header>
      <h3>{{ projectTitle }}</h3>
      <p>{{ projectSummary }}</p>
    </header>

    <div class="tag-list">
      <span v-for="tag in project.tech ?? []" :key="`${project.slug}-${tag}`" class="pill">
        {{ tag }}
      </span>
    </div>

    <footer>
      <RouterLink :to="`/projects/${project.slug}`" class="btn btn-primary">
        {{ detailCtaLabel }}
      </RouterLink>
    </footer>
  </article>
</template>

<style scoped>
.project-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
}

.project-card h3 {
  margin: 0;
  font-size: 1.1rem;
}

.project-card p {
  margin: 0.45rem 0 0;
  color: var(--text-soft);
}

.tag-list {
  display: flex;
  gap: 0.44rem;
  flex-wrap: wrap;
}
</style>
