import { ref } from 'vue'

export function useFakeLogs() {
  const isGenerating = ref(false)

  function generateFakeLogEntries(servers, count = 80) {
    if (!servers || servers.length === 0) return []

    const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'OK']
    const LOG_MSGS = {
      INFO: ['Request handled successfully', 'Config reloaded', 'Health check passed', 'Scheduled task started', 'Cache refreshed', 'Connection pool resized'],
      WARN: ['High memory usage detected (82%)', 'Slow query: >500ms', 'Disk usage at 78%', 'Rate limit threshold approaching', 'Retry attempt 2/3'],
      ERROR: ['Connection timeout to db-prod-01', 'Failed to acquire lock', 'Deployment script exited with code 1', 'SSL certificate expires in 7 days', 'Uncaught exception in worker'],
      DEBUG: ['SQL: SELECT * FROM sessions WHERE…', 'Cache miss for key user:1042', 'Worker spawned pid:24891', 'Parsed config file /etc/app/config.yml'],
      OK: ['Deployment completed successfully', 'Service restarted OK', 'Backup finished (2.3GB)', 'SSL cert renewed', 'Migration 0024 applied'],
    }

    const entries = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      const server = servers[Math.floor(Math.random() * servers.length)]
      const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)]
      const msgs = LOG_MSGS[level]
      const message = msgs[Math.floor(Math.random() * msgs.length)]
      const timestamp = new Date(now - i * 23000 - Math.random() * 20000)

      entries.push({
        id: `log-${i}`,
        timestamp,
        serverId: server.id,
        serverName: server.name,
        level,
        message,
      })
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp)
  }

  function generateRandomLogEntry(servers) {
    if (!servers || servers.length === 0) return null

    const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'OK']
    const LOG_MSGS = {
      INFO: ['Request handled successfully', 'Config reloaded', 'Health check passed', 'Scheduled task started', 'Cache refreshed'],
      WARN: ['High memory usage detected', 'Slow query detected', 'Disk usage at 78%', 'Rate limit approaching'],
      ERROR: ['Connection timeout', 'Failed to acquire lock', 'Script exited with error', 'SSL certificate warning'],
      DEBUG: ['SQL query logged', 'Cache miss detected', 'Worker spawned', 'Config file parsed'],
      OK: ['Deployment completed', 'Service restarted', 'Backup finished', 'Migration applied'],
    }

    const server = servers[Math.floor(Math.random() * servers.length)]
    const level = LOG_LEVELS[Math.floor(Math.random() * LOG_LEVELS.length)]
    const msgs = LOG_MSGS[level]
    const message = msgs[Math.floor(Math.random() * msgs.length)]

    return {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      serverId: server.id,
      serverName: server.name,
      level,
      message,
    }
  }

  return {
    isGenerating,
    generateFakeLogEntries,
    generateRandomLogEntry,
  }
}
