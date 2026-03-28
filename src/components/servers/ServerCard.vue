<template>
  <div :class="['server-card', server.env]">
    <div class="card-top">
      <div class="card-icon">{{ envIcons[server.env] }}</div>
      <div style="flex: 1; min-width: 0">
        <div class="card-name">{{ server.name }}</div>
        <div class="card-host">{{ server.user }}@{{ server.host }}:{{ server.port }}</div>
      </div>
      <span :class="['card-env-badge', `badge-${server.env}`]">{{ envLabels[server.env] }}</span>
    </div>

    <div v-if="server.notes" class="card-meta">
      <span class="meta-pill">{{ server.notes }}</span>
    </div>

    <div class="card-status">
      <div class="status-indicator">
        <span :class="['status-dot', server.status]"></span>
        <span :class="['status-text', server.status]">{{ server.status }}</span>
      </div>
      <span v-if="server.uptime > 0" style="font-size: 10px; color: var(--text3); margin-left: 8px">uptime {{ server.uptime }}%</span>
    </div>

    <div class="uptime-bar">
      <div :class="['uptime-fill', server.uptime >= 99 ? '' : server.uptime >= 90 ? 'warn' : 'bad']" :style="{ width: server.uptime + '%' }"></div>
    </div>

    <div class="card-actions" style="margin-top: 12px">
      <router-link :to="{ name: 'terminal', query: { serverId: server.id } }" class="card-btn ssh"> ⌨ SSH </router-link>
      <button class="card-btn" @click="handleCopySSH">copy cmd</button>
      <button v-if="server.deploy" class="card-btn deploy" @click="handleDeploy">↑ deploy</button>
      <button class="card-btn logs" @click="handleLogs">≡ logs</button>
      <button class="card-btn edit" @click="openEditModal">✎ edit</button>
      <button class="card-btn danger" @click="handleDelete">✕ delete</button>
    </div>

    <AddServerModal
      v-if="showEditModal"
      mode="edit"
      :initial-server="server"
      @close="closeEditModal"
      @update="handleUpdateServer"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSSH } from '../../composables/useSSH'
import { useServersStore } from '../../stores/servers'
import { useToastStore } from '../../stores/toast'
import AddServerModal from './AddServerModal.vue'

const props = defineProps({
  server: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const { copySSHCommand } = useSSH()
const serversStore = useServersStore()
const toastStore = useToastStore()
const showEditModal = ref(false)

const envLabels = {
  prod: 'Production',
  live: 'Live',
  qa: 'QA',
  test: 'Testing',
}

const envIcons = {
  prod: '🖥',
  live: '⚡',
  qa: '🔬',
  test: '🧪',
}

async function handleCopySSH() {
  const success = await copySSHCommand(props.server)
  if (success) {
    toastStore.showToast('SSH command copied to clipboard!', 'success')
  } else {
    toastStore.showToast('Failed to copy SSH command', 'error')
  }
}

function handleDeploy() {
  router.push({ name: 'deploy', query: { serverId: props.server.id } })
}

function handleLogs() {
  router.push({ name: 'logs', query: { serverId: props.server.id } })
}

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function handleUpdateServer(serverData) {
  try {
    await serversStore.updateServer(props.server.id, serverData)
    closeEditModal()
    toastStore.showToast(`Server "${props.server.name}" updated`, 'success')
  } catch (error) {
    const message = error?.response?.data?.message || 'Failed to update server'
    toastStore.showToast(Array.isArray(message) ? message.join(', ') : message, 'error')
  }
}

async function handleDelete() {
  const confirmed = window.confirm(`Delete server "${props.server.name}"?`)
  if (!confirmed) return

  try {
    await serversStore.removeServer(props.server.id)
    toastStore.showToast(`Server "${props.server.name}" deleted`, 'success')
  } catch (error) {
    const message = error?.response?.data?.message || 'Failed to delete server'
    toastStore.showToast(Array.isArray(message) ? message.join(', ') : message, 'error')
  }
}
</script>

<style scoped>
.server-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s ease;
  position: relative;
  overflow: hidden;
}

.server-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
}

.server-card.prod::before {
  background: var(--prod);
}

.server-card.live::before {
  background: var(--live);
}

.server-card.qa::before {
  background: var(--qa);
}

.server-card.test::before {
  background: var(--test);
}

.server-card:hover {
  border-color: var(--border2);
  background: var(--bg3);
  transform: translateY(-2px);
}

.server-card.selected {
  border-color: var(--accent);
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.card-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius);
  background: var(--bg4);
  border: 1px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
}

.card-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.card-host {
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
}

.card-env-badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.badge-prod {
  background: var(--prod-bg);
  color: var(--prod);
  border: 1px solid #4a1515;
}

.badge-live {
  background: var(--live-bg);
  color: var(--live);
  border: 1px solid #0d4030;
}

.badge-qa {
  background: var(--qa-bg);
  color: var(--qa);
  border: 1px solid #3a2a0a;
}

.badge-test {
  background: var(--test-bg);
  color: var(--test);
  border: 1px solid #0a1f3a;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-pill {
  font-size: 10px;
  color: var(--text3);
  background: var(--bg4);
  border: 1px solid var(--border);
  padding: 2px 8px;
  border-radius: 99px;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.online {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.status-dot.offline {
  background: var(--red);
}

.status-dot.unknown {
  background: var(--gray);
}

.status-text.online {
  color: var(--green);
}

.status-text.offline {
  color: var(--red);
}

.status-text.unknown {
  color: var(--gray);
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg4);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-btn:hover {
  border-color: var(--border2);
  background: var(--bg3);
  color: var(--text);
}

.card-btn.ssh {
  border-color: var(--accent2);
  color: var(--accent);
}

.card-btn.ssh:hover {
  background: #0d1a2b;
}

.card-btn.deploy {
  border-color: #1e3a1e;
  color: var(--green);
}

.card-btn.deploy:hover {
  background: var(--green-bg);
}

.card-btn.logs {
  border-color: #3a2a0a;
  color: var(--yellow);
}

.card-btn.logs:hover {
  background: var(--yellow-bg);
}

.card-btn.edit {
  border-color: var(--accent2);
  color: var(--accent);
}

.card-btn.edit:hover {
  background: #0d1a2b;
}

.card-btn.danger {
  border-color: #5d1f1f;
  color: var(--red);
}

.card-btn.danger:hover {
  background: var(--red-bg);
}

.uptime-bar {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.uptime-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--green);
  transition: width 0.4s;
}

.uptime-fill.warn {
  background: var(--yellow);
}

.uptime-fill.bad {
  background: var(--red);
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 6px var(--green);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 12px var(--green);
  }
}
</style>
