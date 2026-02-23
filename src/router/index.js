import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import ProjectsPage from '../pages/ProjectsPage.vue';
import ProjectDetailPage from '../pages/ProjectDetailPage.vue';
import TimelinePage from '../pages/TimelinePage.vue';
import AdminPage from '../pages/AdminPage.vue';

// 路由這邊先固定好五個核心頁面，面試 demo 切頁會很直覺。
const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/projects', name: 'projects', component: ProjectsPage },
  { path: '/projects/:slug', name: 'project-detail', component: ProjectDetailPage },
  { path: '/timeline', name: 'timeline', component: TimelinePage },
  { path: '/admin', name: 'admin', component: AdminPage },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // 換頁回頂端，避免上一頁捲動位置殘留。
    return { top: 0 };
  },
});

export default router;
