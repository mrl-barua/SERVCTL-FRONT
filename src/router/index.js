import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'
import TerminalView from '../views/TerminalView.vue'
import DeployView from '../views/DeployView.vue'
import LogsView from '../views/LogsView.vue'

const routes = [
  {
    path: '/',
    name: 'overview',
    component: OverviewView,
  },
  {
    path: '/terminal',
    name: 'terminal',
    component: TerminalView,
  },
  {
    path: '/deploy',
    name: 'deploy',
    component: DeployView,
  },
  {
    path: '/logs',
    name: 'logs',
    component: LogsView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
