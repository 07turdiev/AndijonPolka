import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/homeView.vue'
import i18n from '../plugins/i18n.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/' + i18n.global.locale,
      name: 'home',
      component: HomeView
    },
    {
      path: '/',
      redirect: '/' + i18n.global.locale,
    },
    {
      path: '/' + i18n.global.locale + '/azo-bolish',
      name: 'membership',
      component: () => import('../views/Membership.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  let routeLocale = to.fullPath.split('/')[1]
  if (routeLocale != i18n.global.locale) {
    next({ path: '/' + i18n.global.locale })
  }
  next()
})

export default router
