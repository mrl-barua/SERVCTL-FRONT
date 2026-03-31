<template>
  <div>
    <div
      v-if="!bannerDismissed"
      class="ssh-banner"
      :class="{ expanded: bannerExpanded }"
    >
      <div class="ssh-banner-main" @click="bannerExpanded = !bannerExpanded">
        <span class="ssh-banner-icon">ℹ</span>
        <div class="ssh-banner-text">
          <strong>SSH link protocol</strong>
          <span v-if="!bannerExpanded"> - click to expand</span>
          <template v-else>
            - clicking the SSH button opens <code>ssh://</code> URIs. Register a
            handler with:
            <code>xdg-mime default xterm.desktop x-scheme-handler/ssh</code>
            The terminal runs allowlisted commands via backend WebSocket.
          </template>
        </div>
      </div>

      <div class="ssh-banner-actions">
        <button
          class="ssh-banner-toggle"
          @click.stop="bannerExpanded = !bannerExpanded"
        >
          {{ bannerExpanded ? "-" : "+" }}
        </button>
        <button class="ssh-banner-dismiss" @click.stop="dismissBanner">
          ×
        </button>
      </div>
    </div>

    <div class="terminal-toolbar">
      <div class="form-row" style="margin-bottom: 0">
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

      <div class="split-controls">
        <button
          :class="['card-btn', { active: splitMode }]"
          @click="toggleSplitMode"
        >
          {{ splitMode ? '⊞ Exit Split' : '⊞ Split Terminal' }}
        </button>
        <template v-if="splitMode">
          <button class="card-btn" @click="addPaneFromSelected" :disabled="!selectedServerId">
            + Add Pane
          </button>
          <select v-model="multiTermStore.layout" class="form-select layout-select">
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="grid">Grid</option>
          </select>
          <button
            :class="['card-btn', { active: multiTermStore.broadcastMode }]"
            @click="multiTermStore.broadcastMode = !multiTermStore.broadcastMode"
          >
            {{ multiTermStore.broadcastMode ? '📡 Broadcasting' : '📡 Broadcast' }}
          </button>
        </template>
      </div>
    </div>

    <template v-if="!splitMode">
      <TerminalPanel :serverId="selectedServerId" />
    </template>
    <template v-else>
      <MultiTerminalView />
      <BroadcastInputBar v-if="multiTermStore.broadcastMode" />
    </template>

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
import { useMultiTerminalStore } from "../stores/multiTerminal";
import TerminalPanel from "../components/terminal/TerminalPanel.vue";
import MultiTerminalView from "../components/terminal/MultiTerminalView.vue";
import BroadcastInputBar from "../components/terminal/BroadcastInputBar.vue";
import QuickCommandsManager from "../components/terminal/QuickCommandsManager.vue";

const route = useRoute();
const serversStore = useServersStore();
const qcStore = useQuickCommandsStore();
const multiTermStore = useMultiTerminalStore();
const selectedServerId = ref(0);
const managerOpen = ref(false);
const splitMode = ref(false);

function toggleSplitMode() {
  splitMode.value = !splitMode.value;
  if (splitMode.value && multiTermStore.panes.length === 0 && selectedServerId.value) {
    addPaneFromSelected();
  }
  if (!splitMode.value) {
    multiTermStore.cleanup();
  }
}

function addPaneFromSelected() {
  const server = serversStore.getServerById(selectedServerId.value);
  if (server) {
    multiTermStore.addPane(server);
  }
}
const bannerExpanded = ref(false);
const bannerDismissed = ref(
  localStorage.getItem("servctl_banner_dismissed") === "true",
);

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
    input.style.width = "100%";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }
}

function dismissBanner() {
  bannerDismissed.value = true;
  localStorage.setItem("servctl_banner_dismissed", "true");
}
</script>

<style scoped>
.terminal-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.split-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.split-controls .card-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg4);
}

.layout-select {
  font-size: 10px;
  padding: 4px 8px;
}

.ssh-banner {
  background: #0d1a2b;
  border: 1px solid var(--accent2);
  border-radius: var(--radius);
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  min-height: 32px;
}

.ssh-banner.expanded {
  align-items: flex-start;
  padding: 10px 12px;
}

.ssh-banner-icon {
  color: var(--accent);
  font-size: 14px;
  flex-shrink: 0;
}

.ssh-banner-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.ssh-banner.expanded .ssh-banner-main {
  align-items: flex-start;
}

.ssh-banner-text {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.5;
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

.ssh-banner-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ssh-banner-toggle,
.ssh-banner-dismiss {
  width: 20px;
  height: 20px;
  border: 1px solid var(--border);
  background: var(--bg4);
  color: var(--text3);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.ssh-banner-toggle:hover,
.ssh-banner-dismiss:hover {
  color: var(--text);
  border-color: var(--border2);
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

:deep(.terminal-panel) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

:deep(.term-input-row) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--border);
  background: #0a0c10;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
}

:deep(.term-prompt-label) {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30%;
  min-width: 0;
}

:deep(.term-input) {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  caret-color: var(--accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.term-run-btn) {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 8px;
  white-space: nowrap;
}

:deep(.terminal-bar) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
}

:deep(.term-dots) {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

:deep(.term-title) {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 11px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 767px) {
  .quick-cmds-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quick-cmds-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }

  .quick-cmd-btn {
    flex-shrink: 0;
  }

  .qcm-open-btn {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  :deep(.term-body) {
    min-height: 180px;
    max-height: 240px;
  }

  :deep(.term-prompt-label) {
    max-width: 28%;
    font-size: 10px;
  }

  :deep(.term-input) {
    font-size: 11px;
  }

  :deep(.term-run-btn) {
    font-size: 9px;
    padding: 4px 6px;
  }

  :deep(.term-title) {
    font-size: 10px;
  }

  :deep(.terminal-panel) {
    margin-left: 0;
    margin-right: 0;
    border-radius: var(--radius-lg);
    position: relative;
    left: 0;
  }

  :deep(.content) {
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
  }

  :deep(.view) {
    width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }
}
</style>
