<template>
  <div class="terminal-panel" :class="{ 'focus-mode': isFocusMode }">
    <div class="terminal-bar">
      <div class="term-dots">
        <div class="term-dot td-red"></div>
        <div class="term-dot td-yellow"></div>
        <div class="term-dot td-green"></div>
      </div>
      <div class="term-title">{{ terminalTitle }}</div>
      <button
        class="card-btn focus-btn"
        :title="isFocusMode ? 'Exit focus mode (Esc)' : 'Focus mode'"
        @click="toggleFocusMode"
      >
        {{ isFocusMode ? "exit focus" : "focus" }}
      </button>
      <button
        class="card-btn"
        style="margin-left: 0; font-size: 10px"
        @click="handleClear"
      >
        clear
      </button>
    </div>

    <div class="term-body" ref="termBodyRef">
      <div
        v-for="(line, index) in termStore.lines"
        :key="index"
        class="term-line"
      >
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

    <div v-if="completions.length > 0" class="tab-completions">
      <span class="tab-completions-label">tab</span>
      <button
        v-for="(c, i) in completions"
        :key="c"
        class="tab-chip"
        :class="{ active: i === completionIndex }"
        @mousedown.prevent="selectCompletion(i)"
      >{{ c }}</button>
    </div>

    <div class="term-input-row">
      <span class="term-prompt-label">{{ promptLabel }}</span>
      <input
        ref="inputRef"
        v-model="inputValue"
        class="term-input"
        placeholder="type command or pick below…"
        @keydown="handleKeyDown"
        @input="onInput"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="term-run-btn" @click="handleRun">run ↵</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useTerminalStore } from "../../stores/terminal";
import { useServersStore } from "../../stores/servers";

const COMMON_COMMANDS = [
  "apt", "apt-get", "awk", "cat", "cd", "chmod", "chown", "cp", "crontab",
  "curl", "date", "df", "diff", "dmesg", "docker", "docker-compose", "du",
  "echo", "env", "export", "find", "free", "gcc", "git", "grep", "gunzip",
  "gzip", "head", "helm", "history", "htop", "ifconfig", "ip", "iostat",
  "iotop", "java", "javac", "journalctl", "kill", "killall", "kubectl",
  "last", "less", "ln", "lsof", "make", "man", "mkdir", "mongo", "more",
  "mount", "mv", "mysql", "nano", "netstat", "nginx", "nmap", "node",
  "nohup", "npm", "ping", "pip", "pip3", "ps", "pwd", "python", "python3",
  "redis-cli", "rm", "rmdir", "route", "rsync", "scp", "screen", "sed",
  "service", "sort", "source", "ss", "ssh", "strace", "sudo", "systemctl",
  "tail", "tar", "tmux", "top", "touch", "traceroute", "uname", "uniq",
  "unzip", "uptime", "vi", "vim", "vmstat", "w", "wc", "wget", "which",
  "whereis", "who", "whoami", "xargs", "yum", "zip", "dnf",
];

const props = defineProps({
  serverId: {
    type: Number,
    default: null,
  },
});

const termStore = useTerminalStore();
const serversStore = useServersStore();
const inputRef = ref(null);
const termBodyRef = ref(null);
const inputValue = ref("");
const isFocusMode = ref(false);

// Tab completion state
const completions = ref([]);
const completionIndex = ref(-1);
const completionBase = ref("");

const currentServer = computed(() => {
  if (props.serverId) {
    return serversStore.getServerById(props.serverId);
  }
  return null;
});

const terminalTitle = computed(() => {
  if (currentServer.value) {
    return `${currentServer.value.user}@${currentServer.value.name} — ${currentServer.value.host}:${currentServer.value.port}`;
  }
  return "select a server";
});

const promptLabel = computed(() => {
  if (currentServer.value) {
    return `${currentServer.value.user}@${currentServer.value.name}:~$`;
  }
  return "$";
});

watch(
  () => termStore.lines.length,
  () => {
    nextTick(() => {
      if (termBodyRef.value) {
        termBodyRef.value.scrollTop = termBodyRef.value.scrollHeight;
      }
    });
  },
);

watch(
  () => currentServer.value?.id,
  (serverId) => {
    if (!serverId) return;
    termStore.connect(serverId);
  },
  { immediate: true },
);

function getCompletions(input) {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const hasSpace = trimmed.includes(" ");

  if (!hasSpace) {
    // Complete the command name from common list + history first words
    const historyFirstWords = [
      ...new Set(termStore.history.map((c) => c.split(" ")[0])),
    ];
    const candidates = [...new Set([...COMMON_COMMANDS, ...historyFirstWords])];
    return candidates
      .filter((c) => c.startsWith(trimmed) && c !== trimmed)
      .sort();
  } else {
    // Complete from full history (commands starting with the current input)
    return [
      ...new Set(
        termStore.history.filter(
          (c) => c.startsWith(trimmed) && c !== trimmed,
        ),
      ),
    ];
  }
}

function clearCompletions() {
  completions.value = [];
  completionIndex.value = -1;
  completionBase.value = "";
}

function selectCompletion(index) {
  completionIndex.value = index;
  inputValue.value = completions.value[index];
  nextTick(() => inputRef.value?.focus());
}

function onInput() {
  // Any manual typing clears the completion list
  clearCompletions();
}

function handleTab(e) {
  e.preventDefault();

  const input = inputValue.value;

  if (completions.value.length === 0) {
    // First Tab: compute completions
    const found = getCompletions(input);
    if (found.length === 0) return;

    completionBase.value = input;

    if (found.length === 1) {
      // Single match: complete immediately, add trailing space
      inputValue.value = found[0] + " ";
      return;
    }

    // Multiple matches: fill longest common prefix, show chips
    const prefix = longestCommonPrefix(found);
    if (prefix.length > input.trim().length) {
      inputValue.value = prefix;
    }

    completions.value = found;
    completionIndex.value = 0;
  } else {
    // Subsequent Tabs: cycle through matches
    completionIndex.value = (completionIndex.value + 1) % completions.value.length;
    inputValue.value = completions.value[completionIndex.value];
  }
}

function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

function handleRun() {
  if (!inputValue.value.trim()) return;
  if (!currentServer.value) return;

  clearCompletions();
  termStore.executeCommand(
    inputValue.value.trim(),
    currentServer.value.user,
    currentServer.value.name,
  );

  inputValue.value = "";
}

function toggleFocusMode() {
  isFocusMode.value = !isFocusMode.value;
  document.body.style.overflow = isFocusMode.value ? "hidden" : "";
  nextTick(() => inputRef.value?.focus());
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    handleRun();
  } else if (e.key === "Tab") {
    handleTab(e);
  } else if (e.key === "Escape") {
    if (completions.value.length > 0) {
      // First Escape: cancel completion
      inputValue.value = completionBase.value;
      clearCompletions();
    } else if (isFocusMode.value) {
      toggleFocusMode();
    }
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    inputValue.value = termStore.getPrevHistory();
    clearCompletions();
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    inputValue.value = termStore.getNextHistory();
    clearCompletions();
    e.preventDefault();
  } else if (e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") {
    // Any printable key clears completions (onInput handles v-model updates,
    // but keydown fires first so clear here for arrow/modifier safety)
    if (completions.value.length > 0 && e.key.length === 1) {
      clearCompletions();
    }
  }
}

function handleClear() {
  termStore.clear();
}

onBeforeUnmount(() => {
  termStore.disconnect();
  document.body.style.overflow = "";
});
</script>

<style scoped>
.terminal-panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-panel.focus-mode {
  position: fixed;
  inset: 0;
  z-index: 500;
  border-radius: 0;
  margin-bottom: 0;
  border: none;
}

.terminal-bar {
  background: var(--bg3);
  border-bottom: 1px solid var(--border);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
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

.focus-btn {
  margin-left: auto;
}

.focus-mode .focus-btn {
  margin-left: auto;
  border-color: var(--accent);
  color: var(--accent);
}

.term-body {
  background: #0a0c10;
  padding: 16px;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  flex: 1;
}

.focus-mode .term-body {
  min-height: unset;
  max-height: unset;
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

/* Tab completions bar */
.tab-completions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 5px 16px;
  background: #0a0c10;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.tab-completions-label {
  font-size: 9px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  flex-shrink: 0;
}

.tab-chip {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.1s;
}

.tab-chip:hover,
.tab-chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(79, 142, 247, 0.08);
}

.term-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding: 10px 16px;
  background: #0a0c10;
  flex-shrink: 0;
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
  0%,
  49%,
  100% {
    opacity: 1;
  }
  50%,
  99% {
    opacity: 0.3;
  }
}
</style>
