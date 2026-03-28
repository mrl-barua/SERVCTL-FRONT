import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import DemoView from '../views/DemoView.vue'
import OverviewView from '../views/OverviewView.vue'
import TerminalView from '../views/TerminalView.vue'
import DeployView from '../views/DeployView.vue'
import LogsView from '../views/LogsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import KeyVaultView from '../views/KeyVaultView.vue'
import InstallGuideView from '../views/InstallGuideView.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
  },
  {
    path: '/demo',
    name: 'demo',
    component: DemoView,
  },
  {
    path: '/install',
    name: 'install',
    component: InstallGuideView,
  },
  {
    path: '/overview',
    name: 'overview',
    component: OverviewView,
    meta: { requiresAuth: true },
  },
  {
    path: '/terminal',
    name: 'terminal',
    component: TerminalView,
    meta: { requiresAuth: true },
  },
  {
    path: '/deploy',
    name: 'deploy',
    component: DeployView,
    meta: { requiresAuth: true },
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/keys',
    name: 'keys',
    component: KeyVaultView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('servctl_access_token')
  const isAuthRoute =
    to.name === 'login' || to.name === 'register' || to.name === 'reset-password'

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }

  if (isAuthRoute && token) {
    return { name: 'overview' }
  }

  return true
})

export default router
