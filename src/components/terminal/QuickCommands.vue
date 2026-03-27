<template>
  <div>
    <div class="section-header">
      <span class="section-title">quick commands</span>
      <span class="section-line"></span>
    </div>
    <div class="quick-cmds">
      <button
        v-for="quickCmd in termStore.QUICK_CMDS"
        :key="quickCmd.cmd"
        class="card-btn"
        @click="injectCommand(quickCmd.cmd)"
      >
        {{ quickCmd.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useTerminalStore } from '../../stores/terminal'

const termStore = useTerminalStore()

function injectCommand(cmd) {
  const input = document.querySelector('.term-input')
  if (input) {
    input.value = cmd
    input.focus()
  }
}
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 8px 0;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.quick-cmds {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg4);
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
</style>
