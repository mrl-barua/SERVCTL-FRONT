import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useAppStore } from './stores/app'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
const appStore = useAppStore(pinia)

// Fire background init immediately — never blocks rendering.
// The router guard reads localStorage directly so auth is always correct.
authStore.initializeAuth().catch(() => {})
appStore.initializeConfig().catch(() => {})

// router.isReady() resolves in < 1 ms once the initial navigation
// (beforeEach guards + route matching) is complete.
// Without this, RouterView has no resolved route on first render → blank page.
router.isReady().then(() => {
  app.mount('#app')
})
