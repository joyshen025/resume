<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useResumeStore } from '../stores/resumeStore';

const store = useResumeStore();
const route = useRoute();

const navItems = [
  {
    to: '/',
    labelPath: 'header.nav.home',
  },
  {
    to: '/projects',
    labelPath: 'header.nav.projects',
  },
  {
    to: '/timeline',
    labelPath: 'header.nav.timeline',
  },
  {
    to: '/admin',
    labelPath: 'header.nav.admin',
  },
];

const localeOptions = computed(() => [
  { id: 'zh-TW', label: store.ui('header.locale.zhTw') },
  { id: 'en-US', label: store.ui('header.locale.enUs') },
]);

const themeLabel = computed(() => {
  if (store.state.theme === 'dawn') {
    return store.ui('header.theme.dark');
  }

  return store.ui('header.theme.light');
});

const title = computed(() =>
  store.t(store.state.data?.meta?.jobTitle ?? { 'zh-TW': '', 'en-US': '' })
);

function isActive(targetPath) {
  if (targetPath === '/') {
    return route.path === '/';
  }

  return route.path === targetPath || route.path.startsWith(`${targetPath}/`);
}

function printPage() {
  window.print();
}
</script>

<template>
  <header class="topbar no-print">
    <div class="topbar__inner">
      <RouterLink to="/" class="brand">
        <strong>{{ store.state.data?.meta?.ownerName ?? store.ui('header.brandFallback') }}</strong>
        <span>{{ title }}</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': isActive(item.to) }"
        >
          {{ store.ui(item.labelPath) }}
        </RouterLink>
      </nav>

      <div class="toolbar">
        <select
          class="select-input compact"
          :value="store.state.locale"
          @change="store.setLocale($event.target.value)"
        >
          <option v-for="locale in localeOptions" :key="locale.id" :value="locale.id">
            {{ locale.label }}
          </option>
        </select>

        <button class="btn" type="button" @click="store.toggleTheme()">
          {{ themeLabel }}
        </button>

        <button class="btn" type="button" @click="printPage">{{ store.ui('header.print') }}</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--bg-base) 76%, transparent);
  border-bottom: 1px solid var(--border);
}

.topbar__inner {
  width: min(var(--container), 100% - 2.2rem);
  margin: 0 auto;
  min-height: 76px;
  display: grid;
  align-items: center;
  gap: 0.9rem;
  grid-template-columns: 1.3fr 1fr auto;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  color: var(--text-main);
}

.brand strong {
  font-family: 'Space Grotesk', 'IBM Plex Sans', sans-serif;
  font-size: 1.05rem;
}

.brand span {
  font-size: 0.84rem;
  color: var(--text-soft);
}

.nav-links {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.nav-link {
  border-radius: 999px;
  padding: 0.42rem 0.72rem;
  font-size: 0.88rem;
  border: 1px solid transparent;
  color: var(--text-soft);
}

.nav-link.is-active {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text-main);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.42rem;
}

.compact {
  width: auto;
  padding: 0.52rem 0.52rem;
  font-size: 0.82rem;
}

@media (max-width: 1020px) {
  .topbar__inner {
    width: min(var(--container), 100% - 1.2rem);
    padding: 0.62rem 0;
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-wrap: wrap;
  }
}
</style>
