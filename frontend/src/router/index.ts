import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      redirect: '/groups',
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('@/pages/GroupsPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/groups/:gid',
      name: 'Ranking',
      component: () => import('@/pages/RankingPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/groups/:gid/add',
      name: 'AddName',
      component: () => import('@/pages/AddNamePage.vue'),
      meta: { auth: true },
    },
    {
      path: '/groups/:gid/my-names',
      name: 'MyNames',
      component: () => import('@/pages/MyNamesPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/groups/:gid/discover',
      name: 'Discover',
      component: () => import('@/pages/DiscoverPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { auth: true, admin: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.meta.auth && !token) {
    next('/login')
  } else if (to.meta.guest && token) {
    next('/groups')
  } else if (to.meta.admin && user.role !== 'admin' && user.role !== 'root') {
    next('/groups')
  } else {
    next()
  }
})

export default router
