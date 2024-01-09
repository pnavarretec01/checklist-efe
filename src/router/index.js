//import { routeGuard } from '@/router/route-guard';
import { setupLayouts } from 'virtual:generated-layouts';
import { createRouter, createWebHistory } from 'vue-router';
import routes from '~pages';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...setupLayouts(routes),
  ],
})

//router.beforeEach(routeGuard);


// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
export default router
