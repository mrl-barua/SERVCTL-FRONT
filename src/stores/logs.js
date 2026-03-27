import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'OK']
const LOG_MSGS = {
  INFO: ['Request handled successfully', 'Config reloaded', 'Health check passed', 'Scheduled task started', 'Cache refreshed', 'Connection pool resized'],
  WARN: ['High memory usage detected (82%)', 'Slow query: >500ms', 'Disk usage at 78%', 'Rate limit threshold approaching', 'Retry attempt 2/3'],
  ERROR: ['Connection timeout to db-prod-01', 'Failed to acquire lock', 'Deployment script exited with code 1', 'SSL certificate expires in 7 days', 'Uncaught exception in worker'],
  DEBUG: ['SQL: SELECT * FROM sessions WHERE…', 'Cache miss for key user:1042', 'Worker spawned pid:24891', 'Parsed config file /etc/app/config.yml'],
  OK: ['Deployment completed successfully', 'Service restarted OK', 'Backup finished (2.3GB)', 'SSL cert renewed', 'Migration 0024 applied'],
}

export const useLogsStore = defineStore('logs', () => {
  const entries = ref([])
  const tailMode = ref(false)
  let tailInterval = null

  function generateLogs(count = 80, servers = []) {
    entries.value = []
    if (servers.length === 0) return

    const now = Date.now()
    for (let i = 0; i < count; i++) {
      const server = servers[Math.floor(Math.random() * servers.length)]
      const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)]
      const msgs = LOG_MSGS[level]
      const msg = msgs[Math.floor(Math.random() * msgs.length)]
      const ts = new Date(now - i * 23000 - Math.random() * 20000)

      entries.value.push({
        id: `log-${i}`,
        timestamp: ts,
        serverId: server.id,
        serverName: server.name,
        level,
        message: msg,
      })
    }

    entries.value.sort((a, b) => b.timestamp - a.timestamp)
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

  function startTail(servers) {
    if (tailMode.value) return

    tailMode.value = true
    const levels = LOG_LEVELS
    const logLevels = LOG_MSGS

    tailInterval = setInterval(() => {
      if (!tailMode.value) return

      const server = servers[Math.floor(Math.random() * servers.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      const msgs = logLevels[level]
      const msg = msgs[Math.floor(Math.random() * msgs.length)]

      addLogEntry(server.id, server.name, level, msg)

      // Keep only last 100 entries
      if (entries.value.length > 100) {
        entries.value = entries.value.slice(0, 100)
      }
    }, 3000)
  }

  function stopTail() {
    tailMode.value = false
    if (tailInterval) {
      clearInterval(tailInterval)
      tailInterval = null
    }
  }

  function clear() {
    entries.value = []
  }

  const filteredEntries = computed(() => {
    return entries.value
  })

  return {
    entries,
    tailMode,
    filteredEntries,
    generateLogs,
    addLogEntry,
    startTail,
    stopTail,
    clear,
  }
})
