import services from './services.json'

// услуги с draft: true не показываются нигде и отдают 404 — страница ещё в работе.
// включить обратно: убрать draft в services.json
export const publishedServices = services.filter((service) => !service.draft)
