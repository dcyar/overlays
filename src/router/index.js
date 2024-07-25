import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/sponsors',
      name: 'sponsors',
      component: () => import('../views/SponsorsView.vue')
    },
    {
      path: '/logo',
      name: 'logo',
      component: () => import('../views/LogoView.vue')
    },
    {
      path: '/titulo',
      name: 'title',
      component: () => import('../views/TitleView.vue')
    },
    {
      path: '/events',
      name: 'events',
      children: [
        {
          path: '270724',
          component: () => import('../views/270724View.vue')
        }
      ]
    }
  ]
})

export default router
