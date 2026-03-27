<template>
  <div>
    <div class="ssh-banner">
      <span class="ssh-banner-icon">ℹ</span>
      <div class="ssh-banner-text">
        <strong>SSH link protocol</strong> — clicking the SSH button opens <code>ssh://</code> URIs. On Ubuntu, register a URI handler with:
        <code>xdg-mime default xterm.desktop x-scheme-handler/ssh</code>
        or use the copy-command button to paste into any terminal.
        The simulated terminal below lets you run predefined commands.
      </div>
    </div>

    <div class="form-row" style="margin-bottom: 14px">
      <label class="form-label">active server</label>
      <select v-model.number="selectedServerId" class="form-select" style="max-width: 280px">
        <option value="">select a server</option>
        <option v-for="server in serversStore.servers" :key="server.id" :value="server.id">
          {{ server.name }} ({{ server.host }})
        </option>
      </select>
    </div>

    <TerminalPanel :serverId="selectedServerId" />
    <QuickCommands />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'
import TerminalPanel from '../components/terminal/TerminalPanel.vue'
import QuickCommands from '../components/terminal/QuickCommands.vue'

const route = useRoute()
const serversStore = useServersStore()
const selectedServerId = ref(0)

// Set selected server from query param or default to first server
watch(
  () => route.query.serverId,
  (newServerId) => {
    if (newServerId) {
      selectedServerId.value = parseInt(newServerId)
    } else if (serversStore.servers.length > 0) {
      selectedServerId.value = serversStore.servers[0].id
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.ssh-banner {
  background: #0d1a2b;
  border: 1px solid var(--accent2);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.ssh-banner-icon {
  color: var(--accent);
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.ssh-banner-text {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.7;
}

.ssh-banner-text strong {
  color: var(--accent);
}

.ssh-banner-text code {
  background: var(--bg4);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  color: var(--green);
}

.form-row {
  margin-bottom: 14px;
}

.form-label {
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 5px;
}

.form-select {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 5px 10px;
  border-radius: var(--radius);
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
