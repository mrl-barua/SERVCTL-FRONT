import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createAuthenticatedSocket } from '../services/socket'

const MAX_PANES = 6
const LAYOUT_KEY = 'servctl_terminal_layout'

function generateId() {
  return 'pane-' + crypto.randomUUID()
}

export const useMultiTerminalStore = defineStore('multiTerminal', () => {
  const panes = ref([])
  const activePaneId = ref(null)
  const broadcastMode = ref(false)
  const layout = ref(localStorage.getItem(LAYOUT_KEY) || 'horizontal')

  const paneCount = computed(() => panes.value.length)

  function getPaneById(id) {
    return panes.value.find((p) => p.id === id) || null
  }

  function addPane(server) {
    if (panes.value.length >= MAX_PANES) return null

    const id = generateId()
    const socket = createAuthenticatedSocket('terminal')

    const pane = {
      id,
      serverId: server.id,
      serverName: server.name,
      lines: [],
      connected: false,
      socket,
    }

    socket.on('connect', () => {
      const target = panes.value.find((p) => p.id === id)
      if (target) {
        target.connected = true
        socket.emit('terminal:connect', { serverId: server.id })
      }
    })

    socket.on('disconnect', () => {
      const target = panes.value.find((p) => p.id === id)
      if (target) {
        target.connected = false
      }
    })

    socket.on('terminal:output', (payload) => {
      const target = panes.value.find((p) => p.id === id)
      if (!target) return
      const type = payload.type === 'error' ? 'error' : 'output'
      payload.lines.forEach((line) => {
        target.lines.push({ type, content: line, timestamp: new Date() })
      })
    })

    socket.on('terminal:ready', () => {
      const target = panes.value.find((p) => p.id === id)
      if (!target) return
      target.lines.push({
        type: 'success',
        content: `Connected to ${server.name}`,
        timestamp: new Date(),
      })
    })

    socket.on('terminal:error', (payload) => {
      const target = panes.value.find((p) => p.id === id)
      if (!target) return
      target.lines.push({
        type: 'error',
        content: payload.message || 'Terminal error',
        timestamp: new Date(),
      })
    })

    panes.value.push(pane)

    if (!activePaneId.value) {
      activePaneId.value = id
    }

    return id
  }

  function removePane(paneId) {
    const index = panes.value.findIndex((p) => p.id === paneId)
    if (index === -1) return

    const pane = panes.value[index]
    if (pane.socket) {
      pane.socket.disconnect()
    }

    panes.value.splice(index, 1)

    if (activePaneId.value === paneId) {
      activePaneId.value = panes.value.length > 0 ? panes.value[0].id : null
    }
  }

  function executeInPane(paneId, command) {
    const pane = panes.value.find((p) => p.id === paneId)
    if (!pane || !pane.socket || !pane.connected) return

    pane.lines.push({
      type: 'prompt',
      content: `$ ${command}`,
      timestamp: new Date(),
    })

    if (command === 'clear') {
      pane.lines.splice(0, pane.lines.length)
      return
    }

    pane.socket.emit('terminal:command', { command })
  }

  function broadcastCommand(command) {
    panes.value.forEach((pane) => {
      executeInPane(pane.id, command)
    })
  }

  function setLayout(newLayout) {
    layout.value = newLayout
    localStorage.setItem(LAYOUT_KEY, newLayout)
  }

  function setActivePaneId(id) {
    activePaneId.value = id
  }

  function toggleBroadcastMode() {
    broadcastMode.value = !broadcastMode.value
  }

  function cleanup() {
    panes.value.forEach((pane) => {
      if (pane.socket) {
        pane.socket.disconnect()
      }
    })
    panes.value = []
    activePaneId.value = null
    broadcastMode.value = false
  }

  return {
    panes,
    activePaneId,
    broadcastMode,
    layout,
    paneCount,
    getPaneById,
    addPane,
    removePane,
    executeInPane,
    broadcastCommand,
    setLayout,
    setActivePaneId,
    toggleBroadcastMode,
    cleanup,
  }
})
