<template>
  <div class="multi-terminal-view">
    <div class="multi-terminal-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-label">layout</span>
        <button
          v-for="opt in layoutOptions"
          :key="opt.value"
          class="layout-btn"
          :class="{ active: store.layout === opt.value }"
          @click="store.setLayout(opt.value)"
          :title="opt.label"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="toolbar-right">
        <button
          class="toolbar-btn"
          :class="{ active: store.broadcastMode }"
          @click="store.toggleBroadcastMode()"
        >
          {{ store.broadcastMode ? 'broadcast on' : 'broadcast' }}
        </button>
        <span class="pane-count">{{ store.paneCount }}/6 panes</span>
      </div>
    </div>

    <div
      class="panes-container"
      :class="[`layout-${store.layout}`]"
      :style="gridStyle"
    >
      <template v-for="(pane, index) in store.panes" :key="pane.id">
        <TerminalPaneSplit
          :pane="pane"
          :active="pane.id === store.activePaneId"
          :broadcast-mode="store.broadcastMode"
          @focus="store.setActivePaneId(pane.id)"
        />
        <PaneResizeHandle
          v-if="index < store.panes.length - 1 && store.layout !== 'grid'"
          :direction="store.layout === 'horizontal' ? 'horizontal' : 'vertical'"
        />
      </template>
    </div>

    <BroadcastInputBar v-if="store.broadcastMode" />

    <div v-if="store.paneCount === 0" class="empty-state">
      <span class="empty-label">no terminal panes open</span>
      <span class="empty-hint">select servers to add terminal panes</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMultiTerminalStore } from '../../stores/multiTerminal'
import TerminalPaneSplit from './TerminalPaneSplit.vue'
import PaneResizeHandle from './PaneResizeHandle.vue'
import BroadcastInputBar from './BroadcastInputBar.vue'

const store = useMultiTerminalStore()

const layoutOptions = [
  { value: 'horizontal', label: 'horizontal' },
  { value: 'vertical', label: 'vertical' },
  { value: 'grid', label: 'grid' },
]

const gridStyle = computed(() => {
  if (store.layout !== 'grid') return {}
  const cols = Math.ceil(Math.sqrt(store.paneCount))
  return {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
  }
})
</script>

<style scoped>
.multi-terminal-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.multi-terminal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  flex-shrink: 0;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 4px;
}

.layout-btn,
.toolbar-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s ease;
}

.layout-btn:hover,
.toolbar-btn:hover {
  color: var(--text);
  border-color: var(--border2);
}

.layout-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(79, 142, 247, 0.08);
}

.toolbar-btn.active {
  border-color: var(--green);
  color: var(--green);
  background: var(--green-bg);
}

.pane-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
}

/* Panes container layouts */
.panes-container {
  flex: 1;
  display: flex;
  min-height: 0;
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius) var(--radius);
  overflow: hidden;
}

.panes-container.layout-horizontal {
  flex-direction: row;
}

.panes-container.layout-vertical {
  flex-direction: column;
}

.panes-container.layout-grid {
  display: grid;
  gap: 1px;
  background: var(--border);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 8px;
}

.empty-label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text2);
}

.empty-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
}

@media (max-width: 767px) {
  .panes-container.layout-horizontal {
    flex-direction: column;
  }

  .multi-terminal-toolbar {
    flex-wrap: wrap;
  }
}
</style>
