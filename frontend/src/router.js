import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/auth' },
  { path: '/auth', component: () => import('./views/AuthPage.vue') },
  {
    path: '/home',
    component: () => import('./views/HomePage.vue'),
    beforeEnter: (to, from, next) => {
      localStorage.getItem('token') ? next() : next('/auth')
    }
  }
]

export default createRouter({ history: createWebHistory(), routes })
