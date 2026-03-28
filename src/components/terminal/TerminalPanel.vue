<template>
  <div class="terminal-panel">
    <div class="terminal-bar">
      <div class="term-dots">
        <div class="term-dot td-red"></div>
        <div class="term-dot td-yellow"></div>
        <div class="term-dot td-green"></div>
      </div>
      <div class="term-title">{{ terminalTitle }}</div>
      <button class="card-btn" @click="handleClear" style="margin-left: auto; font-size: 10px">clear</button>
    </div>

    <div class="term-body" ref="termBodyRef">
      <div v-for="(line, index) in termStore.lines" :key="index" class="term-line">
        <template v-if="line.type === 'prompt'">
          <span class="prompt">{{ line.content }}</span>
        </template>
        <template v-else-if="line.type === 'output'">
          <span class="out">{{ line.content }}</span>
        </template>
        <template v-else-if="line.type === 'info'">
          <span class="info">{{ line.content }}</span>
        </template>
        <template v-else-if="line.type === 'error'">
          <span class="err">{{ line.content }}</span>
        </template>
        <template v-else-if="line.type === 'success'">
          <span class="ok">{{ line.content }}</span>
        </template>
      </div>
    </div>

    <div class="term-input-row">
      <span class="term-prompt-label">{{ promptLabel }}</span>
      <input
        ref="inputRef"
        v-model="inputValue"
        class="term-input"
        placeholder="type command or pick below…"
        @keydown="handleKeyDown"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="term-run-btn" @click="handleRun">run ↵</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useTerminalStore } from '../../stores/terminal'
import { useServersStore } from '../../stores/servers'

const props = defineProps({
  serverId: {
    type: Number,
    default: null,
  },
})

const termStore = useTerminalStore()
const serversStore = useServersStore()
const inputRef = ref(null)
const termBodyRef = ref(null)
const inputValue = ref('')

const currentServer = computed(() => {
  if (props.serverId) {
    return serversStore.getServerById(props.serverId)
  }
  return null
})

const terminalTitle = computed(() => {
  if (currentServer.value) {
    return `${currentServer.value.user}@${currentServer.value.name} — ${currentServer.value.host}:${currentServer.value.port}`
  }
  return 'select a server'
})

const promptLabel = computed(() => {
  if (currentServer.value) {
    return `${currentServer.value.user}@${currentServer.value.name}:~$`
  }
  return '$'
})

watch(
  () => termStore.lines.length,
  () => {
    nextTick(() => {
      if (termBodyRef.value) {
        termBodyRef.value.scrollTop = termBodyRef.value.scrollHeight
      }
    })
  },
)

watch(
  () => currentServer.value?.id,
  (serverId) => {
    if (!serverId) {
      return
    }

    termStore.connect(serverId)
  },
  { immediate: true },
)

function handleRun() {
  if (!inputValue.value.trim()) return
  if (!currentServer.value) return

  termStore.executeCommand(
    inputValue.value.trim(),
    currentServer.value.user,
    currentServer.value.name,
  )

  inputValue.value = ''
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    handleRun()
  } else if (e.key === 'ArrowUp') {
    inputValue.value = termStore.getPrevHistory()
    e.preventDefault()
  } else if (e.key === 'ArrowDown') {
    inputValue.value = termStore.getNextHistory()
    e.preventDefault()
  }
}

function handleClear() {
  termStore.clear()
}

onBeforeUnmount(() => {
  termStore.disconnect()
})
</script>

<style scoped>
.terminal-panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
  overflow: hidden;
}

.terminal-bar {
  background: var(--bg3);
  border-bottom: 1px solid var(--border);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.term-dots {
  display: flex;
  gap: 5px;
}

.term-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.td-red {
  background: #f25f5c;
}

.td-yellow {
  background: #f5a623;
}

.td-green {
  background: #3ecf8e;
}

.term-title {
  font-size: 11px;
  color: var(--text2);
  flex: 1;
  text-align: center;
}

.term-body {
  background: #0a0c10;
  padding: 16px;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
}

.term-line {
  font-size: 12px;
  line-height: 1.8;
}

.term-line .prompt {
  color: var(--accent);
}

.term-line .cmd {
  color: var(--text);
}

.term-line .out {
  color: var(--text2);
}

.term-line .ok {
  color: var(--green);
}

.term-line .err {
  color: var(--red);
}

.term-line .info {
  color: var(--yellow);
}

.term-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding: 10px 16px;
  background: #0a0c10;
}

.term-prompt-label {
  font-size: 12px;
  color: var(--accent);
  flex-shrink: 0;
  animation: cursor-blink 1s infinite;
}

.term-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  caret-color: var(--accent);
}

.term-run-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
}

.term-run-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
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
}

.card-btn:hover {
  color: var(--text);
  border-color: var(--border2);
}

@keyframes cursor-blink {
  0%, 49%, 100% {
    opacity: 1;
  }
  50%, 99% {
    opacity: 0.3;
  }
}
</style>
