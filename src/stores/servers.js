import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/http'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

export const useServersStore = defineStore('servers', () => {
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  const servers = ref([])

  const loading = ref(false)
  const error = ref(null)
  const meta = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  })

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
    const { data } = await apiClient.post('/servers', dto)
    servers.value.unshift(data)
    meta.value.total += 1
    return data
  }

  async function removeServer(id) {
    await apiClient.delete(`/servers/${id}`)
    const index = servers.value.findIndex(s => s.id === id)
    if (index > -1) {
      servers.value.splice(index, 1)
      meta.value.total = Math.max(0, meta.value.total - 1)
    }
  }

  async function updateServer(id, dto) {
    const { data } = await apiClient.patch(`/servers/${id}`, dto)
    const index = servers.value.findIndex(s => s.id === id)
    if (index > -1) {
      servers.value[index] = data
    }
    return data
  }

  async function updateServerStatus(id, status, uptime) {
    const { data } = await apiClient.patch(`/servers/${id}/status`, {
      status,
      ...(uptime !== undefined ? { uptime } : {}),
    })

    const server = getServerById(id)
    if (server) {
      const prevStatus = server.status
      server.status = data.status
      server.uptime = data.uptime
      server.updatedAt = data.updatedAt

      // Notify on status transitions
      if (prevStatus !== data.status && prevStatus !== 'unknown') {
        if (data.status === 'offline') {
          toastStore.showToast(`${server.name} went offline`, 'error')
        } else if (data.status === 'online' && prevStatus === 'offline') {
          toastStore.showToast(`${server.name} is back online`, 'success')
        }
      }
    }

    return data
  }

  async function pingAll() {
    const serverIds = servers.value.map((s) => s.id)
    if (serverIds.length === 0) return

    const { data } = await apiClient.post('/servers/bulk/ping', { serverIds })

    if (data.results) {
      for (const result of data.results) {
        const server = getServerById(result.id)
        if (server) {
          server.status = result.status
          server.uptime = result.uptime
        }
      }
    }

    return data
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

      const { data } = await apiClient.get('/servers', { params: query })
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
