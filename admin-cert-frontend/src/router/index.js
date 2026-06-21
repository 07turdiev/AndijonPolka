import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Participants from '../views/Participants.vue'

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
      { path: '', redirect: { name: 'Participants' } },
      { path: 'participants', name: 'Participants', component: Participants, meta: { requiresAuth: true } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters.isAuthenticated
  if (requiresAuth && !isAuthenticated) next('/login')
  else if (to.path === '/login' && isAuthenticated) next('/')
  else next()
})

export default router
