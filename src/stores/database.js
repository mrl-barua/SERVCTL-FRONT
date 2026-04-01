import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/http'
import { createAuthenticatedSocket } from '../services/socket'

export const useDatabaseStore = defineStore('database', () => {
  const connections = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Active session state
  const connected = ref(false)
  const activeConnectionId = ref(null)
  const activeDbType = ref(null)
  const activeDatabase = ref(null)

  // Schema state
  const databases = ref([])
  const tables = ref([])
  const columns = ref([])

  // Query state
  const results = ref(null)
  const queryLoading = ref(false)
  const queryError = ref(null)
  const queryHistory = ref([])

  let socket = null

  // ── REST: Connection CRUD ─────────────────────────────

  async function fetchConnections() {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get('/database/connections')
      connections.value = data
      return data
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load connections'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createConnection(dto) {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.post('/database/connections', dto)
      connections.value.unshift(data)
      return data
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to create connection'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteConnection(id) {
    await apiClient.delete(`/database/connections/${id}`)
    connections.value = connections.value.filter((c) => c.id !== id)
    if (activeConnectionId.value === id) {
      disconnect()
    }
  }

  async function testConnection(id) {
    const { data } = await apiClient.post(`/database/connections/${id}/test`)
    return data
  }

  // ── WebSocket: Session ────────────────────────────────

  function ensureSocket() {
    if (socket) return

    socket = createAuthenticatedSocket('database')

    socket.on('database:connected', (payload) => {
      connected.value = true
      activeDbType.value = payload.type
      activeDatabase.value = payload.database || null
    })

    socket.on('database:error', (payload) => {
      queryError.value = payload.message
      queryLoading.value = false
    })

    socket.on('database:results', (payload) => {
      results.value = payload
      queryLoading.value = false
      queryError.value = null
    })

    socket.on('database:databases-list', (payload) => {
      databases.value = payload.databases
    })

    socket.on('database:tables-list', (payload) => {
      tables.value = payload.tables
    })

    socket.on('database:columns-list', (payload) => {
      columns.value = payload.columns
    })

    socket.on('disconnect', () => {
      connected.value = false
    })
  }

  function connectToDb(connectionId) {
    ensureSocket()
    // Reset state
    connected.value = false
    results.value = null
    databases.value = []
    tables.value = []
    columns.value = []
    queryError.value = null
    activeConnectionId.value = connectionId
    socket.emit('database:connect', { connectionId })
  }

  function executeQuery(query, database) {
    if (!socket || !connected.value) return
    queryLoading.value = true
    queryError.value = null
    socket.emit('database:query', { query, database })
    // Add to history
    queryHistory.value.unshift({
      query,
      database,
      timestamp: new Date(),
    })
    if (queryHistory.value.length > 50) {
      queryHistory.value = queryHistory.value.slice(0, 50)
    }
  }

  function fetchDatabases() {
    if (!socket || !connected.value) return
    socket.emit('database:databases')
  }

  function fetchTables(database) {
    if (!socket || !connected.value) return
    activeDatabase.value = database
    tables.value = []
    columns.value = []
    socket.emit('database:tables', { database })
  }

  function fetchColumns(database, table) {
    if (!socket || !connected.value) return
    socket.emit('database:columns', { database, table })
  }

  function disconnect() {
    connected.value = false
    activeConnectionId.value = null
    activeDbType.value = null
    activeDatabase.value = null
    results.value = null
    databases.value = []
    tables.value = []
    columns.value = []
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  function clearResults() {
    results.value = null
    queryError.value = null
  }

  return {
    connections,
    loading,
    error,
    connected,
    activeConnectionId,
    activeDbType,
    activeDatabase,
    databases,
    tables,
    columns,
    results,
    queryLoading,
    queryError,
    queryHistory,
    fetchConnections,
    createConnection,
    deleteConnection,
    testConnection,
    connectToDb,
    executeQuery,
    fetchDatabases,
    fetchTables,
    fetchColumns,
    disconnect,
    clearResults,
  }
})
