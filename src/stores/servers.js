import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/http'
import { useAuthStore } from './auth'

export const useServersStore = defineStore('servers', () => {
  const authStore = useAuthStore()
  const servers = ref([])

  const loading = ref(false)
  const error = ref(null)
  const meta = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  })

  async function withAuthRetry(operation) {
    try {
      return await operation()
    } catch (err) {
      if (err?.response?.status === 401) {
        await authStore.refreshSession()
        return operation()
      }
      throw err
    }
  }

  const totalServers = computed(() => servers.value.length)
  const onlineServers = computed(() => servers.value.filter(s => s.status === 'online').length)
  const offlineServers = computed(() => servers.value.filter(s => s.status === 'offline').length)
  const unknownServers = computed(() => servers.value.filter(s => s.status === 'unknown').length)

  const serversByEnv = computed(() => {
    const envOrder = ['prod', 'live', 'qa', 'test']
    const grouped = {}
    envOrder.forEach(env => {
      grouped[env] = servers.value.filter(s => s.env === env)
    })
    return grouped
  })

  function getServerById(id) {
    return servers.value.find(s => s.id === id)
  }

  async function addServer(dto) {
    const { data } = await withAuthRetry(() => apiClient.post('/servers', dto))
    servers.value.unshift(data)
    meta.value.total += 1
    return data
  }

  async function removeServer(id) {
    await withAuthRetry(() => apiClient.delete(`/servers/${id}`))
    const index = servers.value.findIndex(s => s.id === id)
    if (index > -1) {
      servers.value.splice(index, 1)
      meta.value.total = Math.max(0, meta.value.total - 1)
    }
  }

  async function updateServer(id, dto) {
    const { data } = await withAuthRetry(() => apiClient.patch(`/servers/${id}`, dto))
    const index = servers.value.findIndex(s => s.id === id)
    if (index > -1) {
      servers.value[index] = data
    }
    return data
  }

  async function updateServerStatus(id, status, uptime) {
    const { data } = await withAuthRetry(() =>
      apiClient.patch(`/servers/${id}/status`, {
        status,
        ...(uptime !== undefined ? { uptime } : {}),
      }),
    )

    const server = getServerById(id)
    if (server) {
      server.status = data.status
      server.uptime = data.uptime
      server.updatedAt = data.updatedAt
    }

    return data
  }

  async function pingAll() {
    const updates = servers.value.map((server) => {
      const nextStatus = server.status === 'online' ? 'online' : Math.random() > 0.25 ? 'online' : 'offline'
      const nextUptime = nextStatus === 'online' ? Number((95 + Math.random() * 5).toFixed(1)) : 0
      return updateServerStatus(server.id, nextStatus, nextUptime)
    })

    await Promise.all(updates)
  }

  async function fetchServers(params = {}) {
    loading.value = true
    error.value = null
    try {
      const query = {
        page: params.page ?? meta.value.page,
        limit: params.limit ?? meta.value.limit,
        ...(params.env ? { env: params.env } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
      }

      const { data } = await withAuthRetry(() => apiClient.get('/servers', { params: query }))
      servers.value = data.items
      meta.value = {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      }
      return servers.value
    } catch (err) {
      error.value = err?.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    servers,
    meta,
    loading,
    error,
    totalServers,
    onlineServers,
    offlineServers,
    unknownServers,
    serversByEnv,
    getServerById,
    addServer,
    removeServer,
    updateServer,
    updateServerStatus,
    pingAll,
    fetchServers,
  }
})
