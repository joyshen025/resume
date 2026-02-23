import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

// 這邊就是專案進入點：先吃全域樣式，再把 router 掛上去。
createApp(App).use(router).mount('#app');
