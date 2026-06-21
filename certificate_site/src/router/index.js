import { createRouter, createWebHistory } from 'vue-router'
import Register from '../views/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'register',
      component: Register
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
