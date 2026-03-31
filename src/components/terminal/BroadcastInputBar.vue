<template>
  <div class="broadcast-input-bar">
    <span class="broadcast-badge">broadcasting to {{ store.paneCount }} servers</span>
    <div class="broadcast-input-wrap">
      <span class="broadcast-prompt">$</span>
      <input
        ref="inputRef"
        v-model="inputValue"
        class="broadcast-input"
        placeholder="command to all panes..."
        @keydown.enter="handleRun"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="broadcast-run-btn" @click="handleRun">broadcast</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMultiTerminalStore } from '../../stores/multiTerminal'

const store = useMultiTerminalStore()
const inputRef = ref(null)
const inputValue = ref('')

function handleRun() {
  const cmd = inputValue.value.trim()
  if (!cmd) return
  store.broadcastCommand(cmd)
  inputValue.value = ''
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
.broadcast-input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.broadcast-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--green);
  background: var(--green-bg);
  padding: 3px 8px;
  border-radius: var(--radius);
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.broadcast-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.broadcast-prompt {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--green);
  flex-shrink: 0;
}

.broadcast-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  caret-color: var(--green);
}

.broadcast-run-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--green);
  background: var(--green-bg);
  color: var(--green);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.broadcast-run-btn:hover {
  background: rgba(62, 207, 142, 0.15);
}

@media (max-width: 767px) {
  .broadcast-input-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .broadcast-badge {
    text-align: center;
  }
}
</style>
