import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/http'
import { createAuthenticatedSocket } from '../services/socket'
import { useAuthStore } from './auth'

export const useLogsStore = defineStore('logs', () => {
  const authStore = useAuthStore()
  const entries = ref([])
  const tailMode = ref(false)
  const loading = ref(false)
  const socketConnected = ref(false)
  let socket = null
  let activeServerId = null

  async function withAuthRetry(operation) {
    try {
      return await operation()
    } catch (error) {
      if (error?.response?.status === 401) {
        await authStore.refreshSession()
        return operation()
      }
      throw error
    }
  }

  function addLogEntry(serverId, serverName, level, message) {
    entries.value.unshift({
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      serverId,
      serverName,
      level,
      message,
    })
  }

  async function fetchLogs(serverId, options = {}) {
    if (!serverId) {
      entries.value = []
      return []
    }

    loading.value = true
    try {
      const { data } = await withAuthRetry(() =>
        apiClient.get(`/logs/${serverId}`, {
          params: {
            limit: options.limit || 120,
            ...(options.level && options.level !== 'all' ? { level: options.level } : {}),
            ...(options.search ? { search: options.search } : {}),
          },
        }),
      )

      entries.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  function connectSocket() {
    if (socket) {
      return socket
    }

    socket = createAuthenticatedSocket('logs')

    socket.on('connect', () => {
      socketConnected.value = true
    })

    socket.on('disconnect', () => {
      socketConnected.value = false
    })

    socket.on('logs:entry', (entry) => {
      entries.value.unshift(entry)
      if (entries.value.length > 300) {
        entries.value = entries.value.slice(0, 300)
      }
    })

    return socket
  }

  function startTail(serverId) {
    if (!serverId) {
      return
    }

    const activeSocket = connectSocket()
    tailMode.value = true
    activeServerId = serverId
    activeSocket.emit('logs:subscribe', { serverId })
  }

  function stopTail() {
    if (socket && activeServerId) {
      socket.emit('logs:unsubscribe', { serverId: activeServerId })
    }

    tailMode.value = false
    activeServerId = null
  }

  function clear() {
    entries.value = []
  }

  const filteredEntries = computed(() => {
    return entries.value
  })

  function disconnectSocket() {
    if (!socket) {
      return
    }

    socket.disconnect()
    socket = null
    socketConnected.value = false
    tailMode.value = false
    activeServerId = null
  }

  return {
    entries,
    tailMode,
    loading,
    socketConnected,
    filteredEntries,
    fetchLogs,
    addLogEntry,
    startTail,
    stopTail,
    clear,
    disconnectSocket,
  }
})
