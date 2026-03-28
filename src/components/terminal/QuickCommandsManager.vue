<template>
  <Teleport to="body">
    <div
      class="qcm-overlay"
      :class="{ open: modelValue }"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="qcm-drawer" :class="{ open: modelValue }">
        <div class="qcm-header">
          <div class="qcm-title">
            <span class="qcm-icon">⚡</span>
            Quick Commands
          </div>
          <button class="qcm-close" @click="$emit('update:modelValue', false)">
            ✕
          </button>
        </div>

        <div class="qcm-tabs">
          <button
            class="qcm-tab"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            All Commands
            <span class="tab-count">{{ commands.length }}</span>
          </button>
          <button
            class="qcm-tab"
            :class="{ active: activeTab === 'global' }"
            @click="activeTab = 'global'"
          >
            Global
            <span class="tab-count">{{ globalCount }}</span>
          </button>
          <button
            class="qcm-tab"
            :class="{ active: activeTab === 'server' }"
            @click="activeTab = 'server'"
          >
            Server-specific
            <span class="tab-count">{{ serverCount }}</span>
          </button>
        </div>

        <div class="qcm-add-row">
          <button class="qcm-add-btn" @click="openForm(null)">
            + Add Quick Command
          </button>
        </div>

        <div class="qcm-list">
          <div
            v-for="cmd in filteredCommands"
            :key="cmd.id"
            class="qcm-item"
            :class="{ system: cmd.isSystem }"
            draggable="true"
            @dragstart="onDragStart($event, cmd)"
            @dragover.prevent="onDragOver($event, cmd)"
            @drop="onDrop($event, cmd)"
            @dragend="onDragEnd"
          >
            <span class="drag-handle" title="Drag to reorder">⠿</span>

            <div class="cmd-icon-wrap">
              <span class="cmd-icon">{{ cmd.icon || "⚡" }}</span>
              <span
                class="cmd-scope-dot"
                :class="cmd.scope === 'server' ? 'dot-server' : 'dot-all'"
                :title="
                  cmd.scope === 'all'
                    ? 'All servers'
                    : cmd.server?.name || 'Specific server'
                "
              ></span>
            </div>

            <div class="cmd-info">
              <div class="cmd-label">{{ cmd.label }}</div>
              <div class="cmd-command">{{ cmd.command }}</div>
            </div>

            <span
              class="scope-badge"
              :class="cmd.scope === 'all' ? 'scope-all' : 'scope-srv'"
            >
              {{
                cmd.scope === "all"
                  ? "all servers"
                  : cmd.server?.name || "specific"
              }}
            </span>

            <span v-if="cmd.isSystem" class="system-badge">system</span>

            <div class="cmd-actions">
              <button
                class="cmd-action-btn edit"
                title="Edit"
                @click="openForm(cmd)"
              >
                ✎
              </button>
              <button
                class="cmd-action-btn delete"
                :disabled="cmd.isSystem"
                :title="
                  cmd.isSystem ? 'System commands cannot be deleted' : 'Delete'
                "
                @click="handleDelete(cmd)"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            v-if="!qcStore.loading && filteredCommands.length === 0"
            class="qcm-empty"
          >
            No commands yet.
            <button class="link-btn" @click="openForm(null)">
              Add your first one -&gt;
            </button>
          </div>
        </div>

        <div class="qcm-footer-note">
          <span class="system-dot"></span>
          System defaults cannot be deleted but can be edited. Drag rows to
          reorder.
        </div>
      </div>
    </div>
  </Teleport>

  <QuickCommandForm
    v-if="formOpen"
    :command="editingCommand"
    :servers="servers"
    @save="handleSave"
    @cancel="closeForm"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useServersStore } from "../../stores/servers";
import { useQuickCommandsStore } from "../../stores/quickCommands";
import QuickCommandForm from "./QuickCommandForm.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const qcStore = useQuickCommandsStore();
const serversStore = useServersStore();

const activeTab = ref("all");
const formOpen = ref(false);
const editingCommand = ref(null);

const commands = computed(() => qcStore.commands);
const servers = computed(() => serversStore.servers);
const globalCount = computed(
  () => commands.value.filter((c) => c.scope === "all").length,
);
const serverCount = computed(
  () => commands.value.filter((c) => c.scope === "server").length,
);

const filteredCommands = computed(() => {
  if (activeTab.value === "global") {
    return commands.value.filter((cmd) => cmd.scope === "all");
  }

  if (activeTab.value === "server") {
    return commands.value.filter((cmd) => cmd.scope === "server");
  }

  return commands.value;
});

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await qcStore.fetchAll();
    }
  },
);

function openForm(cmd) {
  editingCommand.value = cmd;
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  editingCommand.value = null;
}

async function handleSave(dto) {
  try {
    if (editingCommand.value) {
      await qcStore.update(editingCommand.value.id, dto);
    } else {
      await qcStore.create(dto);
    }

    closeForm();
  } catch (err) {
    window.alert(
      err?.response?.data?.message || "Failed to save quick command.",
    );
  }
}

async function handleDelete(cmd) {
  if (cmd.isSystem) {
    return;
  }

  if (window.confirm(`Delete "${cmd.label}"?`)) {
    await qcStore.remove(cmd.id);
  }
}

const draggedId = ref(null);
const dragOverId = ref(null);

function onDragStart(event, cmd) {
  draggedId.value = cmd.id;
  event.dataTransfer.effectAllowed = "move";
}

function onDragOver(_event, cmd) {
  dragOverId.value = cmd.id;
}

async function onDrop(_event, targetCmd) {
  if (!draggedId.value || draggedId.value === targetCmd.id) {
    return;
  }

  const allIds = commands.value.map((cmd) => cmd.id);
  const fromIdx = allIds.indexOf(draggedId.value);
  const toIdx = allIds.indexOf(targetCmd.id);

  if (fromIdx === -1 || toIdx === -1) {
    return;
  }

  allIds.splice(fromIdx, 1);
  allIds.splice(toIdx, 0, draggedId.value);
  await qcStore.reorder(allIds);

  draggedId.value = null;
  dragOverId.value = null;
}

function onDragEnd() {
  draggedId.value = null;
  dragOverId.value = null;
}
</script>

<style scoped>
.qcm-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  backdrop-filter: blur(3px);
}

.qcm-overlay.open {
  display: block;
}

.qcm-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(460px, 94vw);
  background: var(--bg2);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 301;
}

.qcm-drawer.open {
  transform: translateX(0);
}

.qcm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.qcm-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qcm-close {
  font-size: 14px;
  color: var(--text3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
}

.qcm-close:hover {
  color: var(--text);
  background: var(--bg3);
}

.qcm-tabs {
  display: flex;
  gap: 4px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.qcm-tab {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: var(--radius);
  border: 1px solid transparent;
  background: none;
  color: var(--text3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.12s;
}

.qcm-tab.active {
  background: var(--bg4);
  border-color: var(--border2);
  color: var(--text);
}

.tab-count {
  font-size: 9px;
  background: var(--bg3);
  padding: 1px 6px;
  border-radius: 99px;
  color: var(--text3);
}

.qcm-add-row {
  padding: 10px 16px;
  flex-shrink: 0;
}

.qcm-add-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  width: 100%;
  padding: 8px;
  border-radius: var(--radius);
  border: 1px dashed var(--border2);
  background: none;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.12s;
}

.qcm-add-btn:hover {
  background: var(--bg3);
  border-style: solid;
}

.qcm-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.qcm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg3);
  margin-bottom: 6px;
  cursor: grab;
  transition:
    border-color 0.12s,
    background 0.12s;
}

.qcm-item:hover {
  border-color: var(--border2);
}

.qcm-item.system {
  border-style: dashed;
}

.qcm-item:active {
  cursor: grabbing;
}

.drag-handle {
  color: var(--text3);
  font-size: 14px;
  cursor: grab;
  flex-shrink: 0;
  user-select: none;
}

.cmd-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.cmd-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cmd-scope-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid var(--bg3);
}

.cmd-scope-dot.dot-all {
  background: var(--text3);
}

.cmd-scope-dot.dot-server {
  background: var(--accent);
}

.cmd-info {
  flex: 1;
  min-width: 0;
}

.cmd-label {
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmd-command {
  font-size: 10px;
  color: var(--text3);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.scope-badge {
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 99px;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  flex-shrink: 0;
  white-space: nowrap;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scope-all {
  background: var(--bg4);
  color: var(--text3);
  border: 1px solid var(--border);
}

.scope-srv {
  background: #0d1a2b;
  color: var(--accent);
  border: 1px solid var(--accent2);
}

.system-badge {
  font-size: 9px;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--bg4);
  color: var(--text3);
  border: 1px dashed var(--border2);
  flex-shrink: 0;
}

.cmd-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.cmd-action-btn {
  font-size: 12px;
  width: 26px;
  height: 26px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg4);
  color: var(--text3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
}

.cmd-action-btn.edit:hover {
  border-color: var(--yellow);
  color: var(--yellow);
  background: var(--yellow-bg);
}

.cmd-action-btn.delete:hover:not(:disabled) {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

.cmd-action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qcm-empty {
  border: 1px dashed var(--border2);
  border-radius: var(--radius);
  padding: 14px;
  font-size: 12px;
  color: var(--text3);
}

.qcm-footer-note {
  padding: 10px 16px;
  font-size: 10px;
  color: var(--text3);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.system-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px dashed var(--border2);
  flex-shrink: 0;
}

.link-btn {
  margin-left: 6px;
  border: none;
  background: none;
  color: var(--accent);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
}

@media (min-width: 768px) {
  .cmd-scope-dot {
    display: none;
  }

  .scope-badge,
  .system-badge {
    display: inline-flex;
  }
}

@media (max-width: 767px) {
  .qcm-overlay {
    align-items: flex-end;
  }

  .qcm-overlay.open {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .qcm-drawer {
    width: 100% !important;
    max-width: 100%;
    border-left: none;
    border-top: 1px solid var(--border);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    height: 85vh;
    transform: translateY(100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .qcm-drawer.open {
    transform: translateY(0);
  }

  .qcm-drawer::before {
    content: "";
    display: block;
    width: 36px;
    height: 4px;
    background: var(--border2);
    border-radius: 2px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }

  .qcm-header {
    padding: 14px 16px;
  }

  .qcm-title {
    font-size: 14px;
  }

  .qcm-tabs {
    padding: 8px 12px;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }

  .qcm-tabs::-webkit-scrollbar {
    display: none;
  }

  .qcm-tab {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 10px;
    padding: 5px 10px;
  }

  .tab-count {
    font-size: 9px;
  }

  .qcm-add-btn {
    font-size: 12px;
    padding: 10px;
  }

  .qcm-list {
    padding: 6px 12px;
    -webkit-overflow-scrolling: touch;
  }

  .qcm-item {
    padding: 10px 10px;
    gap: 8px;
  }

  .drag-handle {
    font-size: 12px;
    color: var(--text3);
  }

  .cmd-info {
    flex: 1;
    min-width: 0;
  }

  .cmd-label {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .cmd-command {
    font-size: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .scope-badge,
  .system-badge {
    display: none;
  }

  .cmd-actions {
    gap: 6px;
    flex-shrink: 0;
  }

  .cmd-action-btn {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }

  .qcm-footer-note {
    font-size: 9px;
    padding: 8px 12px;
  }
}
</style>
