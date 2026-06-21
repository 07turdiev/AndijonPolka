import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Views
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import CertifiedUsers from '../views/CertifiedUsers.vue'
import Applications from '../views/Applications.vue'
import Organizations from '../views/Organizations.vue'
import TestTopics from '../views/TestTopics.vue'
import TestQuestions from '../views/TestQuestions.vue'
import Quarters from '../views/Quarters.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'Applications' }
      },
      {
        path: 'certified-users',
        name: 'CertifiedUsers',
        component: CertifiedUsers,
        meta: { requiresAuth: true }
      },
      {
        path: 'applications',
        name: 'Applications',
        component: Applications,
        meta: { requiresAuth: true }
      },
      {
        path: 'organizations',
        name: 'Organizations',
        component: Organizations,
        meta: { requiresAuth: true }
      },
      {
        path: 'test-topics',
        name: 'TestTopics',
        component: TestTopics,
        meta: { requiresAuth: true }
      },
      {
        path: 'test-questions',
        name: 'TestQuestions',
        component: TestQuestions,
        meta: { requiresAuth: true }
      },
      {
        path: 'quarters',
        name: 'Quarters',
        component: Quarters,
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 