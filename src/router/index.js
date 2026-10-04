import { redirects } from './redirects.js'
import services from '../data/services.json'

// несуществующая услуга — та же 404, адрес в строке остаётся как был
function serviceExists(to) {
  if (services.some((service) => service.slug === to.params.slug)) return true
  return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') }, query: to.query, hash: to.hash }
}

export const routes = [
  // служебная страница проверки токенов и компонентов, не входит в sitemap.xml
  { path: '/styleguide', name: 'styleguide', component: () => import('../views/StyleguideView.vue') },
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/works', name: 'works', component: () => import('../views/WorksView.vue') },
  { path: '/works/:slug', name: 'work-detail', component: () => import('../views/WorkDetailView.vue') },
  ...redirects,
  { path: '/services/:slug', name: 'service-detail', component: () => import('../views/ServiceDetailView.vue'), beforeEnter: serviceExists },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/contacts', name: 'contacts', component: () => import('../views/ContactsView.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyView.vue') },
  // всё остальное — 404; пререндерится как /404 → dist/404.html
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]
