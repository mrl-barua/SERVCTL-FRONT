<template>
  <div>
    <div class="ssh-banner">
      <span class="ssh-banner-icon">ℹ</span>
      <div class="ssh-banner-text">
        <strong>SSH link protocol</strong> — clicking the SSH button opens
        <code>ssh://</code> URIs. On Ubuntu, register a URI handler with:
        <code>xdg-mime default xterm.desktop x-scheme-handler/ssh</code>
        or use the copy-command button to paste into any terminal. The terminal
        below runs allowlisted commands through the backend websocket terminal
        module.
      </div>
    </div>

    <div class="form-row" style="margin-bottom: 14px">
      <label class="form-label">active server</label>
      <select
        v-model.number="selectedServerId"
        class="form-select"
        style="max-width: 280px"
      >
        <option value="">select a server</option>
        <option
          v-for="server in serversStore.servers"
          :key="server.id"
          :value="server.id"
        >
          {{ server.name }} ({{ server.host }})
        </option>
      </select>
    </div>

    <TerminalPanel :serverId="selectedServerId" />

    <div class="quick-cmds-bar">
      <div class="quick-cmds-label">quick commands</div>
      <div class="quick-cmds-list">
        <button
          v-for="cmd in quickCommands"
          :key="cmd.id"
          class="card-btn quick-cmd-btn"
          :title="cmd.command"
          @click="injectCmd(cmd.command)"
        >
          <span v-if="cmd.icon" class="qcb-icon">{{ cmd.icon }}</span>
          {{ cmd.label }}
          <span
            v-if="cmd.scope === 'server'"
            class="qcb-server-dot"
            title="Server-specific command"
          >
            ●
          </span>
        </button>
      </div>

      <button
        class="card-btn qcm-open-btn"
        @click="managerOpen = true"
        title="Manage quick commands"
      >
        ⚙ manage
      </button>
    </div>

    <QuickCommandsManager v-model="managerOpen" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useServersStore } from "../stores/servers";
import { useQuickCommandsStore } from "../stores/quickCommands";
import TerminalPanel from "../components/terminal/TerminalPanel.vue";
import QuickCommandsManager from "../components/terminal/QuickCommandsManager.vue";

const route = useRoute();
const serversStore = useServersStore();
const qcStore = useQuickCommandsStore();
const selectedServerId = ref(0);
const managerOpen = ref(false);

const quickCommands = computed(() =>
  qcStore.forServer(selectedServerId.value || null),
);

// Set selected server from query param or default to first server
watch(
  () => route.query.serverId,
  (newServerId) => {
    if (newServerId) {
      selectedServerId.value = parseInt(newServerId);
    } else if (serversStore.servers.length > 0) {
      selectedServerId.value = serversStore.servers[0].id;
    }
  },
  { immediate: true },
);

watch(
  () => serversStore.servers,
  (servers) => {
    if (!selectedServerId.value && servers.length > 0) {
      selectedServerId.value = servers[0].id;
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => selectedServerId.value,
  async (id) => {
    if (id) {
      await qcStore.fetchForServer(id);
      return;
    }

    await qcStore.fetchAll();
  },
  { immediate: true },
);

function injectCmd(cmd) {
  const input = document.querySelector(".term-input");
  if (input) {
    input.value = cmd;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }
}
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

.card-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
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

.quick-cmds-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.quick-cmds-label {
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.quick-cmds-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.qcb-icon {
  font-size: 12px;
}

.qcb-server-dot {
  font-size: 6px;
  color: var(--accent);
  vertical-align: super;
}

.qcm-open-btn {
  margin-left: auto;
  flex-shrink: 0;
  border-color: var(--border2);
}

.qcm-open-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
