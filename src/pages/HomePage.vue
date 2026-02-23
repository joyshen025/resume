<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import TerminalIntro from '../components/TerminalIntro.vue';
import ProjectCard from '../components/ProjectCard.vue';
import { useResumeStore } from '../stores/resumeStore';
import { formatPeriod } from '../utils/date';

const store = useResumeStore();

const profile = computed(() => store.state.data?.meta ?? null);
const sectionSet = computed(() => new Set(store.state.data?.sectionOrder ?? []));
const usedSkills = computed(() => {
  const skills = store.state.data?.skills ?? [];
  const uniqueNames = new Set(
    skills
      .map((skill) => skill?.name)
      .filter((name) => typeof name === 'string' && name.trim().length > 0)
  );

  return [...uniqueNames];
});
const featuredProjects = computed(() => store.featuredProjects.value.slice(0, 3));
const timelinePreview = computed(() => store.experienceTimeline.value.slice(0, 3));
const introLines = computed(() => profile.value?.introLines?.[store.state.locale] ?? []);

function localizePeriod(start, end) {
  const present = store.ui('common.present');
  return formatPeriod(start, end, store.state.locale, present);
}
</script>

<template>
  <div class="home-grid">
    <section v-if="sectionSet.has('hero') && profile" class="panel hero">
      <div class="hero__content">
        <p class="pill">{{ profile.location }}</p>
        <h1>{{ profile.ownerName }}</h1>
        <p class="hero__title">{{ store.t(profile.jobTitle) }}</p>
        <p class="hero__summary">{{ store.t(profile.summary) }}</p>
        <div class="hero__actions">
          <RouterLink to="/projects" class="btn btn-primary">
            {{ store.ui('home.exploreProjects') }}
          </RouterLink>
          <a class="btn" :href="`mailto:${profile.email}`">{{ store.ui('home.contact') }}</a>
          <a class="btn" :href="profile.github" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <TerminalIntro :lines="introLines" />
    </section>

    <section v-if="sectionSet.has('skills')" class="panel section">
      <header class="section-head">
        <h2 class="section-title">{{ store.ui('home.skillsTitle') }}</h2>
        <p class="section-desc">{{ store.ui('home.skillsDesc') }}</p>
      </header>

      <div v-if="usedSkills.length > 0" class="skills-cloud">
        <span v-for="skill in usedSkills" :key="skill" class="pill skill-chip">
          {{ skill }}
        </span>
      </div>

      <p v-else class="empty-skill">{{ store.ui('home.noSkills') }}</p>
    </section>

    <section v-if="sectionSet.has('featuredProjects')" class="section">
      <header class="section-head">
        <h2 class="section-title">{{ store.ui('home.featuredProjectsTitle') }}</h2>
        <p class="section-desc">{{ store.ui('home.featuredProjectsDesc') }}</p>
      </header>

      <div class="project-grid">
        <ProjectCard
          v-for="project in featuredProjects"
          :key="project.id"
          :project="project"
          :locale="store.state.locale"
        />
      </div>
    </section>

    <section v-if="sectionSet.has('timelinePreview')" class="panel section">
      <header class="section-head">
        <h2 class="section-title">{{ store.ui('home.timelineTitle') }}</h2>
      </header>

      <div class="timeline-preview">
        <article v-for="item in timelinePreview" :key="item.id" class="timeline-item">
          <p class="timeline-item__period">{{ localizePeriod(item.start, item.end) }}</p>
          <h3>{{ item.company }}</h3>
          <p class="timeline-item__role">{{ store.t(item.role) }}</p>
          <p>{{ store.t(item.summary) }}</p>
        </article>
      </div>

      <RouterLink to="/timeline" class="btn">{{ store.ui('home.seeFullTimeline') }}</RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home-grid {
  display: grid;
  gap: 1rem;
}

.hero {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
  grid-template-columns: 1.2fr 1fr;
}

.hero h1 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  font-family: 'Space Grotesk', 'IBM Plex Sans', sans-serif;
}

.hero__title {
  margin: 0.3rem 0 0;
  color: var(--text-soft);
  font-weight: 600;
}

.hero__summary {
  margin: 0.8rem 0 0;
  max-width: 60ch;
}

.hero__actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.section {
  display: grid;
  gap: 0.9rem;
  padding: 1.2rem;
}

.section-head {
  display: grid;
  gap: 0.25rem;
}

.skills-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-chip {
  border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  margin:0 0.5px ;
}

.empty-skill {
  margin: 0;
  color: var(--text-soft);
}

.project-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.timeline-preview {
  display: grid;
  gap: 0.8rem;
}

.timeline-item {
  border-left: 3px solid color-mix(in srgb, var(--accent) 35%, var(--border));
  padding-left: 0.7rem;
}

.timeline-item h3 {
  margin: 0.2rem 0 0;
}

.timeline-item p {
  margin: 0.2rem 0 0;
}

.timeline-item__period {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.timeline-item__role {
  color: var(--text-soft);
  font-weight: 600;
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
