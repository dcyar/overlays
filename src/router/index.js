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
      path: '/logow',
      name: 'logow',
      component: () => import('../views/LogoWhiteView.vue')
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
        },
      ]
    },
    {
      path: '/sonido',
      name: 'sound',
      component: () => import('../views/SoundView.vue')
    },
    {
      path: '/logos',
      children: [
        {
          path: 'corali',
          component: () => import('../views/logos/CoraliView.vue')
        },
        {
          path: 'tios-junior',
          component: () => import('../views/logos/TiosJuniorView.vue')
        },
        {
          path: 'elvita',
          component: () => import('../views/logos/ElvitaView.vue')
        },
        {
          path: 'dulce-beatriz',
          component: () => import('../views/logos/DulceBeatrizView.vue')
        },
        {
          path: 'sami',
          component: () => import('../views/logos/SamiView.vue')
        },
        {
          path: 'santa-cecilia',
          component: () => import('../views/logos/SantaCeciliaView.vue')
        },
        {
          path: 'tierra-santa',
          component: () => import('../views/logos/TierraSantaView.vue')
        },
        {
          path: 'yobana',
          component: () => import('../views/logos/YobanaView.vue')
        },
      ]
    }
  ]
})

export default router
