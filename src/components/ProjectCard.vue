<script setup>
import { RouterLink } from 'vue-router';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="card project-card">
    <header>
      <h3>{{ store.t(props.project.title) }}</h3>
      <p>{{ store.t(props.project.summary) }}</p>
    </header>

    <div class="tag-list">
      <span
        v-for="tag in props.project.tech ?? []"
        :key="`${props.project.slug}-${tag}`"
        class="pill"
      >
        {{ tag }}
      </span>
    </div>

    <footer>
      <RouterLink :to="`/projects/${props.project.slug}`" class="btn btn-primary">
        {{ store.ui('projectCard.viewDetails') }}
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
