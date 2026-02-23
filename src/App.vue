<template>
  <!-- 這層當 app 外殼：主題切換靠 data-theme，內容交給 RouterView。 -->
  <div class="app-shell" :data-theme="store.state.theme">
    <MyHeader />
    <main class="app-main">
      <!-- 初始化還沒完成時，先給一個 loading 狀態。 -->
      <div v-if="store.state.loading" class="loading-panel">{{ loadingText }}</div>
      <RouterView v-else />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import MyHeader from './layouts/MyHeader.vue';
import { useResumeStore } from './stores/resumeStore';

const store = useResumeStore();
const loadingText = computed(() => store.ui('app.loading'));

onMounted(() => {
  // 小提醒：全部資料都先從 store 啟動，裡面會做 seed + localStorage merge。
  store.initialize();
});
</script>

<style scoped></style>
