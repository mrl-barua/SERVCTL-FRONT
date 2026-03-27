import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useServersStore = defineStore('servers', () => {
  const servers = ref([
    { id: 1, name: 'web-prod-01', host: '10.0.1.10', user: 'ubuntu', port: 22, env: 'prod', notes: 'nginx + app server', deploy: './deploy.sh production', logpath: '/var/log/nginx/access.log', status: 'online', uptime: 99.8 },
    { id: 2, name: 'db-prod-01', host: '10.0.1.11', user: 'ubuntu', port: 22, env: 'prod', notes: 'PostgreSQL primary', deploy: '', logpath: '/var/log/postgresql/postgresql.log', status: 'online', uptime: 99.9 },
    { id: 3, name: 'web-live-01', host: '10.0.2.10', user: 'ubuntu', port: 22, env: 'live', notes: 'live traffic mirror', deploy: './deploy.sh live', logpath: '/var/log/nginx/access.log', status: 'online', uptime: 97.2 },
    { id: 4, name: 'web-qa-01', host: '10.0.3.10', user: 'deploy', port: 22, env: 'qa', notes: 'QA environment', deploy: './deploy.sh qa', logpath: '/var/log/app/app.log', status: 'online', uptime: 94.1 },
    { id: 5, name: 'api-qa-01', host: '10.0.3.11', user: 'deploy', port: 22, env: 'qa', notes: 'API service', deploy: './deploy.sh api-qa', logpath: '/var/log/app/api.log', status: 'unknown', uptime: 87.5 },
    { id: 6, name: 'dev-test-01', host: '10.0.4.10', user: 'dev', port: 2222, env: 'test', notes: 'dev sandbox', deploy: 'make deploy', logpath: '/var/log/app/dev.log', status: 'online', uptime: 78.0 },
    { id: 7, name: 'load-test-01', host: '10.0.4.11', user: 'dev', port: 22, env: 'test', notes: 'k6 load testing', deploy: './run-k6.sh', logpath: '/var/log/k6/output.log', status: 'offline', uptime: 0 },
  ])

  const loading = ref(false)
  const error = ref(null)
  let nextId = 20

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

  function addServer(dto) {
    const newServer = {
      id: nextId++,
      ...dto,
      status: 'unknown',
      uptime: 0,
    }
    servers.value.push(newServer)
    return newServer
  }

  function removeServer(id) {
    const index = servers.value.findIndex(s => s.id === id)
    if (index > -1) {
      servers.value.splice(index, 1)
    }
  }

  function updateServerStatus(id, status) {
    const server = getServerById(id)
    if (server) {
      server.status = status
    }
  }

  function pingAll() {
    servers.value.forEach(s => {
      if (s.status === 'unknown') {
        s.status = Math.random() > 0.3 ? 'online' : 'offline'
      }
    })
  }

  async function fetchServers() {
    loading.value = true
    error.value = null
    try {
      // For now, just use mock data that's already loaded
      // When API_MODE is enabled, this would call:
      // const response = await axios.get('/servers')
      // servers.value = response.data
      return servers.value
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    servers,
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
    updateServerStatus,
    pingAll,
    fetchServers,
  }
})
