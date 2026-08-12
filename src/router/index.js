export const routes = [
  // служебная страница проверки токенов и компонентов, не входит в sitemap.xml
  { path: '/styleguide', name: 'styleguide', component: () => import('../views/StyleguideView.vue') },
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/works', name: 'works', component: () => import('../views/WorksView.vue') },
  { path: '/works/:slug', name: 'work-detail', component: () => import('../views/WorkDetailView.vue') },
  { path: '/services/:slug', name: 'service-detail', component: () => import('../views/ServiceDetailView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/contacts', name: 'contacts', component: () => import('../views/ContactsView.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyView.vue') },
]
