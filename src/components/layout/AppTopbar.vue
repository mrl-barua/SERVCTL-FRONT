<template>
  <div class="topbar">
    <div class="topbar-title">{{ routeTitle }}</div>
    <div class="topbar-actions">
      <button class="tb-btn" @click="handlePingAll">ping all</button>
      <button class="tb-btn primary" @click="openAddModal">+ add server</button>
    </div>

    <AddServerModal v-if="showModal" @close="closeAddModal" @add="handleAddServer" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../../stores/servers'
import { useToastStore } from '../../stores/toast'
import AddServerModal from '../servers/AddServerModal.vue'

const route = useRoute()
const serversStore = useServersStore()
const toastStore = useToastStore()

const showModal = ref(false)

const routeTitles = {
  overview: 'Overview',
  terminal: 'Terminal',
  deploy: 'Deploy',
  logs: 'Logs',
}

const routeTitle = computed(() => {
  const name = route.name || 'overview'
  return routeTitles[name] || 'Overview'
})

function handlePingAll() {
  serversStore.pingAll()
  toastStore.showToast('Pinging all servers...', 'success')
}

function openAddModal() {
  showModal.value = true
}

function closeAddModal() {
  showModal.value = false
}

function handleAddServer(serverData) {
  serversStore.addServer(serverData)
  closeAddModal()
  toastStore.showToast(`Server "${serverData.name}" added!`, 'success')
}
</script>

<style scoped>
.topbar {
  height: 52px;
  flex-shrink: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.topbar-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.tb-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.1s;
}

.tb-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tb-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.tb-btn.primary:hover {
  background: var(--accent2);
  border-color: var(--accent2);
}
</style>
