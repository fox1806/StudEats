
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/user-profile',
        name: 'userProfile',
        component: () => import('pages/UserProfile.vue')
      },
      {
        path: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: 'register',
        component: () => import('pages/RegisterPage.vue')
      },
      {
        path: 'statistika',
        component: () => import('pages/PrikazStatistika.vue')
      },
      {
        path: 'o-aplikaciji',
        component: () => import('pages/OAplikaciji.vue')
      },
      // path za kontakt
      {
        path: 'kontakt',
        component: () => import('pages/Kontakt.vue')
      },

    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
