<template>
  <div
    class="terminal-pane-split"
    :class="{ active: active }"
    @click="$emit('focus')"
  >
    <div class="pane-header">
      <div class="pane-dot" :class="pane.connected ? 'online' : 'offline'"></div>
      <span class="pane-name">{{ pane.serverName }}</span>
      <span v-if="!pane.connected" class="pane-status">disconnected</span>
      <button class="pane-close-btn" @click.stop="handleClose" title="Close pane">
        &times;
      </button>
    </div>

    <div class="pane-output" ref="outputRef">
      <div
        v-for="(line, index) in pane.lines"
        :key="index"
        class="pane-line"
      >
        <span :class="lineClass(line.type)">{{ line.content }}</span>
      </div>
    </div>

    <div class="pane-input-row" v-if="!broadcastMode">
      <span class="pane-prompt">$</span>
      <input
        ref="inputRef"
        v-model="inputValue"
        class="pane-input"
        placeholder="command..."
        @keydown.enter="handleRun"
        autocomplete="off"
        spellcheck="false"
        :disabled="!pane.connected"
      />
      <button
        class="pane-run-btn"
        @click="handleRun"
        :disabled="!pane.connected"
      >
        run
      </button>
    </div>
    <div class="pane-input-row broadcast-indicator" v-else>
      <span class="broadcast-label">broadcast mode active</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useMultiTerminalStore } from '../../stores/multiTerminal'

const props = defineProps({
  pane: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  broadcastMode: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['focus'])

const store = useMultiTerminalStore()
const inputRef = ref(null)
const outputRef = ref(null)
const inputValue = ref('')

function lineClass(type) {
  const map = {
    prompt: 'lc-prompt',
    output: 'lc-output',
    error: 'lc-error',
    success: 'lc-success',
    info: 'lc-info',
  }
  return map[type] || 'lc-output'
}

function handleRun() {
  const cmd = inputValue.value.trim()
  if (!cmd) return
  store.executeInPane(props.pane.id, cmd)
  inputValue.value = ''
}

function handleClose() {
  store.removePane(props.pane.id)
}

watch(
  () => props.pane.lines.length,
  () => {
    nextTick(() => {
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    })
  },
)
</script>

<style scoped>
.terminal-pane-split {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  overflow: hidden;
}

.terminal-pane-split.active {
  border-color: var(--accent);
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.pane-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pane-dot.online {
  background: var(--green);
}

.pane-dot.offline {
  background: var(--red);
}

.pane-name {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pane-status {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--red);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pane-close-btn {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1;
  padding: 0 4px;
  border: none;
  background: none;
  color: var(--text3);
  cursor: pointer;
  transition: color 0.12s ease;
  flex-shrink: 0;
}

.pane-close-btn:hover {
  color: var(--red);
}

.pane-output {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
  background: #0a0c10;
  min-height: 0;
}

.pane-line {
  white-space: pre-wrap;
  word-break: break-all;
}

.lc-prompt {
  color: var(--accent);
}

.lc-output {
  color: var(--text2);
}

.lc-error {
  color: var(--red);
}

.lc-success {
  color: var(--green);
}

.lc-info {
  color: var(--yellow);
}

.pane-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-top: 1px solid var(--border);
  background: #0a0c10;
  flex-shrink: 0;
}

.pane-prompt {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent);
  flex-shrink: 0;
}

.pane-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  caret-color: var(--accent);
}

.pane-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pane-run-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 3px 8px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.pane-run-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.pane-run-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.broadcast-indicator {
  justify-content: center;
}

.broadcast-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 767px) {
  .pane-output {
    font-size: 11px;
  }

  .pane-input {
    font-size: 11px;
  }
}
</style>
