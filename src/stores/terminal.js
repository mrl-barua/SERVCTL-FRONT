import { defineStore } from 'pinia'
import { ref } from 'vue'

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

const FAKE_OUTPUTS = {
  'uptime': () => ` ${new Date().toLocaleTimeString()} up ${Math.floor(Math.random() * 100)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}, 1 user, load average: ${(Math.random() * 2).toFixed(2)}, ${(Math.random() * 1.5).toFixed(2)}, ${Math.random().toFixed(2)}`,
  'df -h': () => `Filesystem      Size  Used Avail Use%\n/dev/sda1        50G   18G   30G  38% /\ntmpfs           2.0G     0  2.0G   0% /dev/shm`,
  'free -h': () => `              total    used    free  shared  buff/cache  available\nMem:            7.7G    2.1G    3.4G    120M       2.1G        5.2G\nSwap:           2.0G      0B    2.0G`,
  'docker ps': () => `CONTAINER ID   IMAGE          STATUS         PORTS                NAMES\na1b2c3d4e5f6   nginx:latest   Up 2 hours     0.0.0.0:80->80/tcp   web\n7890abcdef12   postgres:15    Up 2 hours     5432/tcp             db`,
  'who': () => `ubuntu   pts/0   ${new Date().toISOString().slice(0, 16).replace('T', ' ')} (192.168.1.5)`,
}

export const useTerminalStore = defineStore('terminal', () => {
  const lines = ref([])
  const history = ref([])
  const historyIndex = ref(-1)

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

  function executeCommand(cmd, serverUser, serverName, serverHost) {
    const timestamp = new Date()
    addLine('prompt', `${serverUser}@${serverName}:~$ ${cmd}`, timestamp)
    addToHistory(cmd)

    // Simulate output
    setTimeout(() => {
      if (FAKE_OUTPUTS[cmd]) {
        const out = FAKE_OUTPUTS[cmd]()
        out.split('\n').forEach(l => addLine('output', l))
      } else if (cmd === 'clear') {
        clear()
      } else if (cmd.startsWith('echo ')) {
        addLine('output', cmd.slice(5))
      } else if (cmd === 'whoami') {
        addLine('output', serverUser)
      } else if (cmd === 'pwd') {
        addLine('output', `/home/${serverUser}`)
      } else if (cmd === 'hostname') {
        addLine('output', serverName)
      } else if (cmd === 'exit') {
        addLine('info', `Connection to ${serverHost} closed.`)
      } else {
        addLine('success', `[simulated] command queued: ${cmd}`)
        addLine('output', 'Note: this dashboard simulates output. Use the SSH button to open a real connection.')
      }
    }, 120)
  }

  return {
    lines,
    history,
    historyIndex,
    QUICK_CMDS,
    addLine,
    addToHistory,
    getPrevHistory,
    getNextHistory,
    clear,
    executeCommand,
  }
})
