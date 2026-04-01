import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createAuthenticatedSocket } from '../services/socket'

const QUICK_CMDS = [
  { label: 'uptime', cmd: 'uptime' },
  { label: 'disk usage', cmd: 'df -h' },
  { label: 'memory', cmd: 'free -h' },
  { label: 'processes', cmd: 'ps aux --sort=-%cpu | head -10' },
  { label: 'network', cmd: 'ss -tuln' },
  { label: 'sys log tail', cmd: 'sudo tail -50 /var/log/syslog' },
  { label: 'service status', cmd: 'sudo systemctl status nginx' },
  { label: 'docker ps', cmd: 'docker ps' },
  { label: 'who', cmd: 'who' },
  { label: 'last logins', cmd: 'last -10' },
]

export const useTerminalStore = defineStore('terminal', () => {
  const lines = ref([])
  const history = ref([])
  const historyIndex = ref(-1)
  const connectedServerId = ref(null)
  const socketConnected = ref(false)
  let socket = null

  function addLine(type, content, timestamp = new Date()) {
    lines.value.push({
      type, // 'prompt', 'output', 'info', 'error', 'success'
      content,
      timestamp,
    })
  }

  function addToHistory(cmd) {
    history.value.unshift(cmd)
    historyIndex.value = -1
  }

  function getPrevHistory() {
    if (history.value.length === 0) return ''
    historyIndex.value = Math.min(historyIndex.value + 1, history.value.length - 1)
    return history.value[historyIndex.value] || ''
  }

  function getNextHistory() {
    historyIndex.value = Math.max(historyIndex.value - 1, -1)
    return historyIndex.value >= 0 ? history.value[historyIndex.value] : ''
  }

  function clear() {
    lines.value = []
  }

  function connect(serverId) {
    if (!socket) {
      socket = createAuthenticatedSocket('terminal')

      socket.on('connect', () => {
        socketConnected.value = true
        if (connectedServerId.value) {
          socket.emit('terminal:connect', { serverId: connectedServerId.value })
        }
      })

      socket.on('disconnect', () => {
        socketConnected.value = false
      })

      socket.on('terminal:output', (payload) => {
        const type = payload.type === 'error' ? 'error' : 'output'
        payload.lines.forEach((line) => addLine(type, line))
      })
    }

    if (connectedServerId.value !== serverId) {
      lines.value = []
    }
    connectedServerId.value = serverId
    socket.emit('terminal:connect', { serverId })
  }

  function executeCommand(cmd, serverUser, serverName) {
    const timestamp = new Date()
    addLine('prompt', `${serverUser}@${serverName}:~$ ${cmd}`, timestamp)
    addToHistory(cmd)

    if (!socket || !connectedServerId.value) {
      addLine('error', 'No active terminal session')
      return
    }

    if (cmd === 'clear') {
      clear()
      return
    }

    socket.emit('terminal:command', { command: cmd })
  }

  function disconnect() {
    connectedServerId.value = null
    if (!socket) {
      return
    }

    socket.disconnect()
    socket = null
    socketConnected.value = false
  }

  return {
    lines,
    history,
    historyIndex,
    connectedServerId,
    socketConnected,
    QUICK_CMDS,
    addLine,
    addToHistory,
    getPrevHistory,
    getNextHistory,
    clear,
    connect,
    executeCommand,
    disconnect,
  }
})
