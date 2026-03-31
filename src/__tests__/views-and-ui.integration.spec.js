import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'

// Mock HTTP client before any store imports
vi.mock('../services/http', () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && (url === '/servers' || url.startsWith('/servers'))) {
        return Promise.resolve({ data: { items: [], total: 0, page: 1, limit: 20 } })
      }
      if (url === '/config') {
        return Promise.resolve({ data: { mode: 'local', features: {} } })
      }
      return Promise.resolve({ data: [] })
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock socket service
vi.mock('../services/socket', () => ({
  createAuthenticatedSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: false,
  })),
}))

// Stub child components to isolate tests
vi.mock('../components/servers/StatCard.vue', () => ({
  default: {
    name: 'StatCard',
    props: ['label', 'value', 'color', 'subLabel', 'progress', 'progressColor'],
    template: '<div class="stat-card" :data-label="label" :data-value="value">{{ label }}: {{ value }}</div>',
  },
}))

vi.mock('../components/servers/ServerGrid.vue', () => ({
  default: { name: 'ServerGrid', template: '<div class="server-grid-stub" />' },
}))

vi.mock('../components/servers/TagManager.vue', () => ({
  default: {
    name: 'TagManager',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue" class="tag-manager-stub">TagManager</div>',
  },
}))

vi.mock('../components/servers/GroupManager.vue', () => ({
  default: {
    name: 'GroupManager',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div v-if="modelValue" class="group-manager-stub">GroupManager</div>',
  },
}))

vi.mock('../components/terminal/TerminalPanel.vue', () => ({
  default: {
    name: 'TerminalPanel',
    props: ['serverId'],
    template: '<div class="terminal-panel-stub" />',
  },
}))

vi.mock('../components/terminal/MultiTerminalView.vue', () => ({
  default: { name: 'MultiTerminalView', template: '<div class="multi-terminal-stub" />' },
}))

vi.mock('../components/terminal/BroadcastInputBar.vue', () => ({
  default: { name: 'BroadcastInputBar', template: '<div class="broadcast-bar-stub" />' },
}))

vi.mock('../components/terminal/QuickCommandsManager.vue', () => ({
  default: {
    name: 'QuickCommandsManager',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="qcm-stub" />',
  },
}))

vi.mock('../components/NetworkModeBanner.vue', () => ({
  default: { name: 'NetworkModeBanner', template: '<div class="network-banner-stub" />' },
}))

vi.mock('../components/layout/AppTopbar.vue', () => ({
  default: {
    name: 'AppTopbar',
    props: ['isMobile'],
    emits: ['toggle-sidebar'],
    template: '<div class="topbar-stub" />',
  },
}))

vi.mock('../components/AppToast.vue', () => ({
  default: { name: 'AppToast', template: '<div class="toast-stub" />' },
}))

vi.mock('../components/common/ConfirmModal.vue', () => ({
  default: {
    name: 'ConfirmModal',
    props: ['modelValue', 'title', 'message', 'serverName', 'confirmLabel', 'loading'],
    emits: ['update:modelValue', 'confirm'],
    template: '<div class="confirm-modal-stub" />',
  },
}))

vi.mock('../components/servers/AddServerModal.vue', () => ({
  default: {
    name: 'AddServerModal',
    props: ['mode', 'initialServer'],
    emits: ['close', 'update'],
    template: '<div class="add-server-modal-stub" />',
  },
}))

import OverviewView from '../views/OverviewView.vue'
import TerminalView from '../views/TerminalView.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import ServerCard from '../components/servers/ServerCard.vue'
import App from '../App.vue'
import { useServersStore } from '../stores/servers'
import { factories } from './helpers'

// Suppress unhandled rejections from background store fetches during tests
const originalConsoleWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Unhandled error')) return
    originalConsoleWarn(...args)
  }
  process.on('unhandledRejection', () => {})
})
afterAll(() => {
  console.warn = originalConsoleWarn
})

// ---------- Shared helpers ----------

function createMockRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'landing', component: { template: '<div />' } },
      { path: '/overview', name: 'overview', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/terminal', name: 'terminal', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/health', name: 'health', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/deploy', name: 'deploy', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/logs', name: 'logs', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/keys', name: 'keys', component: { template: '<div />' }, meta: { requiresAuth: true } },
      { path: '/login', name: 'login', component: { template: '<div />' } },
    ],
  })
}

// ---------- OverviewView ----------

describe('OverviewView', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    router.push('/overview')
    await router.isReady()
  })

  function mountOverview() {
    return mount(OverviewView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders stat cards (total, online, offline, unknown)', () => {
    const wrapper = mountOverview()
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(4)

    const labels = statCards.map(c => c.attributes('data-label'))
    expect(labels).toContain('total servers')
    expect(labels).toContain('online')
    expect(labels).toContain('offline')
    expect(labels).toContain('unknown')
  })

  it('renders "Manage Tags" button', () => {
    const wrapper = mountOverview()
    const buttons = wrapper.findAll('.toolbar-btn')
    const tagBtn = buttons.find(b => b.text().includes('Manage Tags'))
    expect(tagBtn).toBeTruthy()
  })

  it('renders "Manage Groups" button', () => {
    const wrapper = mountOverview()
    const buttons = wrapper.findAll('.toolbar-btn')
    const groupBtn = buttons.find(b => b.text().includes('Manage Groups'))
    expect(groupBtn).toBeTruthy()
  })

  it('clicking "Manage Tags" opens TagManager modal', async () => {
    const wrapper = mountOverview()
    const tagBtn = wrapper.findAll('.toolbar-btn').find(b => b.text().includes('Manage Tags'))

    expect(wrapper.find('.tag-manager-stub').exists()).toBe(false)
    await tagBtn.trigger('click')
    expect(wrapper.find('.tag-manager-stub').exists()).toBe(true)
  })

  it('clicking "Manage Groups" opens GroupManager modal', async () => {
    const wrapper = mountOverview()
    const groupBtn = wrapper.findAll('.toolbar-btn').find(b => b.text().includes('Manage Groups'))

    expect(wrapper.find('.group-manager-stub').exists()).toBe(false)
    await groupBtn.trigger('click')
    expect(wrapper.find('.group-manager-stub').exists()).toBe(true)
  })
})

// ---------- TerminalView ----------

describe('TerminalView', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    router.push('/terminal')
    await router.isReady()
  })

  function mountTerminal() {
    return mount(TerminalView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders server selector dropdown', () => {
    const wrapper = mountTerminal()
    const select = wrapper.find('.form-select')
    expect(select.exists()).toBe(true)
    expect(select.element.tagName).toBe('SELECT')
  })

  it('renders "Split Terminal" button', () => {
    const wrapper = mountTerminal()
    const splitBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Split Terminal'))
    expect(splitBtn).toBeTruthy()
  })

  it('clicking "Split Terminal" activates split mode', async () => {
    const wrapper = mountTerminal()
    const splitBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Split Terminal'))
    await splitBtn.trigger('click')

    // After activating, button text changes to "Exit Split"
    const exitBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Exit Split'))
    expect(exitBtn).toBeTruthy()
  })

  it('in split mode, shows layout selector and broadcast toggle', async () => {
    const wrapper = mountTerminal()
    const splitBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Split Terminal'))
    await splitBtn.trigger('click')

    // Layout selector should appear
    const layoutSelect = wrapper.find('.layout-select')
    expect(layoutSelect.exists()).toBe(true)

    // Broadcast toggle button should appear
    const broadcastBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Broadcast'))
    expect(broadcastBtn).toBeTruthy()
  })

  it('"Add Pane" button is disabled when no server selected', async () => {
    const wrapper = mountTerminal()

    // Ensure no server is selected
    const select = wrapper.find('.form-select')
    await select.setValue('')

    // Enter split mode
    const splitBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Split Terminal'))
    await splitBtn.trigger('click')

    const addPaneBtn = wrapper.findAll('.card-btn').find(b => b.text().includes('Add Pane'))
    expect(addPaneBtn).toBeTruthy()
    expect(addPaneBtn.attributes('disabled')).toBeDefined()
  })
})

// ---------- AppSidebar (collapsible) ----------

describe('AppSidebar', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    router.push('/overview')
    await router.isReady()
  })

  function mountSidebar(props = {}) {
    return mount(AppSidebar, {
      props: {
        collapsed: false,
        ...props,
      },
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders all nav items when not collapsed', () => {
    const wrapper = mountSidebar({ collapsed: false })
    const navItems = wrapper.findAll('.nav-item')

    // Overview, Terminal, Deploy, Logs, Keys, Health
    expect(navItems.length).toBe(6)

    const navTexts = navItems.map(n => n.text())
    expect(navTexts.some(t => t.includes('Overview'))).toBe(true)
    expect(navTexts.some(t => t.includes('Terminal'))).toBe(true)
    expect(navTexts.some(t => t.includes('Deploy'))).toBe(true)
    expect(navTexts.some(t => t.includes('Logs'))).toBe(true)
    expect(navTexts.some(t => t.includes('Keys'))).toBe(true)
    expect(navTexts.some(t => t.includes('Health'))).toBe(true)
  })

  it('shows only icons when collapsed prop is true', () => {
    const wrapper = mountSidebar({ collapsed: true })
    const navItems = wrapper.findAll('.nav-item')

    // Nav items exist but should not show text labels
    expect(navItems.length).toBe(6)

    // When collapsed, the template does not render text (only icon spans)
    // Each nav item should have the icon but NOT the label text
    navItems.forEach(item => {
      const icon = item.find('.icon')
      expect(icon.exists()).toBe(true)
    })

    // The text "Overview", "Terminal", etc. should not appear in collapsed nav items
    const fullText = navItems.map(n => n.text()).join(' ')
    expect(fullText).not.toContain('Overview')
    expect(fullText).not.toContain('Terminal')
  })

  it('hides server list when collapsed', () => {
    const wrapper = mountSidebar({ collapsed: true })
    const serverList = wrapper.find('.sidebar-servers')
    expect(serverList.exists()).toBe(false)
  })

  it('shows collapse toggle button ("<<" when expanded, ">>" when collapsed)', () => {
    const expandedWrapper = mountSidebar({ collapsed: false })
    const toggleExpanded = expandedWrapper.find('.collapse-toggle')
    expect(toggleExpanded.exists()).toBe(true)
    expect(toggleExpanded.text()).toBe('\u00AB') // "«"

    const collapsedWrapper = mountSidebar({ collapsed: true })
    const toggleCollapsed = collapsedWrapper.find('.collapse-toggle')
    expect(toggleCollapsed.text()).toBe('\u00BB') // "»"
  })

  it('emits toggle-collapse when toggle button clicked', async () => {
    const wrapper = mountSidebar({ collapsed: false })
    const toggle = wrapper.find('.collapse-toggle')
    await toggle.trigger('click')
    expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
    expect(wrapper.emitted('toggle-collapse').length).toBe(1)
  })

  it('renders Health nav item', () => {
    const wrapper = mountSidebar({ collapsed: false })
    const navItems = wrapper.findAll('.nav-item')
    const healthItem = navItems.find(n => n.text().includes('Health'))
    expect(healthItem).toBeTruthy()
  })
})

// ---------- App.vue sidebar tests (resizable) ----------

describe('App.vue sidebar', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    // Navigate to a protected route so the dashboard layout renders
    router.push('/overview')
    await router.isReady()
  })

  function mountApp(options = {}) {
    // Ensure window.innerWidth is desktop-sized so isMobile is false
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: options.innerWidth ?? 1024,
    })

    return mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('sidebar has default width 220px style', () => {
    const wrapper = mountApp()
    const sidebar = wrapper.find('.sidebar')
    expect(sidebar.exists()).toBe(true)
    // Default sidebarWidth is 220 and sidebarCollapsed is false
    expect(sidebar.attributes('style')).toContain('width: 220px')
  })

  it('sidebar resize handle exists when not collapsed and not mobile', () => {
    const wrapper = mountApp()
    const handle = wrapper.find('.sidebar-resize-handle')
    expect(handle.exists()).toBe(true)
  })

  it('resize handle is hidden when sidebar is collapsed', async () => {
    // Set localStorage to collapsed state before mounting
    localStorage.setItem('servctl_sidebar_collapsed', 'true')

    const wrapper = mountApp()
    await nextTick()

    // The resize handle should not exist when collapsed
    // v-if="!isMobile && !sidebarCollapsed" controls it
    const handle = wrapper.find('.sidebar-resize-handle')
    expect(handle.exists()).toBe(false)
  })
})

// ---------- ServerCard drag-and-drop ----------

describe('ServerCard drag-and-drop', () => {
  let pinia
  let router

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createMockRouter()
    router.push('/overview')
    await router.isReady()
  })

  function mountServerCard(props = {}) {
    const defaultServer = factories.server()
    return mount(ServerCard, {
      props: {
        server: defaultServer,
        ...props,
      },
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('has draggable="true" attribute', () => {
    const wrapper = mountServerCard()
    const card = wrapper.find('.server-card')
    expect(card.attributes('draggable')).toBe('true')
  })

  it('shows selection checkbox when selectable prop is true', () => {
    const wrapper = mountServerCard({ selectable: true })
    const checkbox = wrapper.find('.select-checkbox')
    expect(checkbox.exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('emits toggle-select when checkbox is clicked', async () => {
    const server = factories.server({ id: 42 })
    const wrapper = mountServerCard({ server, selectable: true })
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.trigger('change')
    expect(wrapper.emitted('toggle-select')).toBeTruthy()
    expect(wrapper.emitted('toggle-select')[0]).toEqual([42])
  })

  it('adds .dragging class on dragstart', async () => {
    const wrapper = mountServerCard()
    const card = wrapper.find('.server-card')

    // Simulate dragstart with a mock dataTransfer
    await card.trigger('dragstart', {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    })

    expect(card.classes()).toContain('dragging')
  })

  it('removes .dragging class on dragend', async () => {
    const wrapper = mountServerCard()
    const card = wrapper.find('.server-card')

    // First trigger dragstart
    await card.trigger('dragstart', {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    })
    expect(card.classes()).toContain('dragging')

    // Then trigger dragend
    await card.trigger('dragend')
    expect(card.classes()).not.toContain('dragging')
  })

  it('adds .selected class when selected prop is true', () => {
    const wrapper = mountServerCard({ selected: true })
    const card = wrapper.find('.server-card')
    expect(card.classes()).toContain('selected')
  })
})
