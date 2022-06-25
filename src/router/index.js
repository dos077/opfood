import { createRouter, createWebHistory } from 'vue-router';
import QuickList from '@/views/QuickList.vue';
import SavesList from '@/components/SavesList.vue';
import HomeView from '@/views/HomeView.vue';
import AdvanceView from '@/views/AdvanceView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/quick',
    name: 'quick',
    component: QuickList,
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: SavesList,
  },
  {
    path: '/advance',
    name: 'advance',
    component: AdvanceView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
