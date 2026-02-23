<script setup>
import { useResumeStore } from '../stores/resumeStore';
import { formatPeriod } from '../utils/date';

const store = useResumeStore();

function formatDateRange(item) {
  const present = store.ui('common.present');
  return formatPeriod(item.start, item.end, store.state.locale, present);
}
</script>

<template>
  <section class="panel timeline-wrap">
    <header class="section-head">
      <h1 class="section-title">{{ store.ui('timeline.title') }}</h1>
      <p class="section-desc">{{ store.ui('timeline.description') }}</p>
    </header>

    <!-- 每一筆經歷都走同一個卡片結構，方便之後擴展更多欄位。 -->
    <div class="timeline-list">
      <article
        v-for="item in store.experienceTimeline.value"
        :key="item.id"
        class="card timeline-item"
      >
        <div class="timeline-item__line" />
        <div class="timeline-item__body">
          <p class="timeline-item__period">{{ formatDateRange(item) }}</p>
          <h2>{{ item.company }}</h2>
          <p class="timeline-item__role">{{ store.t(item.role) }}</p>
          <p class="timeline-item__summary">{{ store.t(item.summary) }}</p>

          <ul>
            <li
              v-for="(highlight, index) in item.highlights"
              :key="`highlight-${item.id}-${index}`"
            >
              {{ store.t(highlight) }}
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.timeline-wrap {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
}

.timeline-list {
  display: grid;
  gap: 0.8rem;
}

.timeline-item {
  position: relative;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: 18px 1fr;
  align-items: stretch;
  padding: 0.9rem;
}

.timeline-item__line {
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--accent),
    color-mix(in srgb, var(--accent) 30%, transparent)
  );
}

.timeline-item h2 {
  margin: 0;
  font-size: 1.12rem;
}

.timeline-item__period {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.86rem;
}

.timeline-item__role {
  margin: 0.42rem 0 0;
  color: var(--text-soft);
  font-weight: 600;
}

.timeline-item__summary {
  margin: 0.42rem 0 0;
}

.timeline-item ul {
  margin: 0.54rem 0 0;
  padding-left: 1rem;
  color: var(--text-soft);
}
</style>
