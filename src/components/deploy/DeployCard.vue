<template>
  <div class="deploy-card">
    <div class="deploy-header">
      <div>
        <div class="deploy-name">{{ server.name }}</div>
        <div style="font-size: 10px; color: var(--text3); margin-top: 2px; font-family: var(--font-mono)">{{ server.deploy }}</div>
      </div>
      <span :class="['deploy-status-badge', `dsb-${deployState.status}`]">{{ deployState.status }}</span>
    </div>

    <div class="progress-bar">
      <div :class="['progress-fill', deployState.status === 'running' ? 'running' : '']" :style="{ width: deployState.progress + '%' }"></div>
    </div>

    <div class="deploy-commands">
      <div v-for="(step, index) in deployStore.DEPLOY_STEPS" :key="index" class="cmd-item">
        <div
          :class="[
            'cmd-check',
            index < deployState.step ? 'done' : index === deployState.step ? 'running' : '',
          ]"
        >
          {{ index < deployState.step ? '✓' : index === deployState.step ? '…' : '' }}
        </div>
        <div
          :class="[
            'cmd-text',
            index < deployState.step ? 'done' : index === deployState.step ? 'running' : '',
          ]"
        >
          {{ step }}
        </div>
      </div>
    </div>

    <div class="deploy-actions">
      <button
        v-show="deployState.status !== 'running'"
        class="deploy-btn run"
        @click="handleStartDeploy"
      >
        ▶ run deploy
      </button>
      <button v-show="deployState.status === 'running'" class="deploy-btn stop" @click="handleStopDeploy">
        ■ stop
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDeployStore } from '../../stores/deploy'

const props = defineProps({
  server: {
    type: Object,
    required: true,
  },
})

const deployStore = useDeployStore()

const deployState = computed(() => {
  return deployStore.getDeployState(props.server.id)
})

function handleStartDeploy() {
  deployStore.startDeploy(props.server.id)
}

function handleStopDeploy() {
  deployStore.stopDeploy(props.server.id)
}
</script>

<style scoped>
.deploy-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.deploy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.deploy-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.deploy-status-badge {
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 99px;
}

.dsb-idle {
  background: var(--bg4);
  color: var(--text3);
  border: 1px solid var(--border);
}

.dsb-running {
  background: #0d1a2b;
  color: var(--accent);
  border: 1px solid var(--accent2);
  animation: pulse-border 1.2s infinite;
}

.dsb-done {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid #0d4030;
}

.dsb-failed {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid #4a1515;
}

.deploy-commands {
  margin-bottom: 12px;
}

.cmd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
}

.cmd-item:last-child {
  border-bottom: none;
}

.cmd-check {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--border2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}

.cmd-check.done {
  background: var(--green-bg);
  border-color: var(--green);
  color: var(--green);
}

.cmd-check.running {
  background: #0d1a2b;
  border-color: var(--accent);
  color: var(--accent);
}

.cmd-text {
  font-size: 11px;
  color: var(--text2);
  font-family: var(--font-mono);
}

.cmd-text.done {
  color: var(--green);
}

.cmd-text.running {
  color: var(--accent);
}

.deploy-actions {
  display: flex;
  gap: 8px;
}

.deploy-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 14px;
  border-radius: var(--radius);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.12s;
  flex: 1;
  text-align: center;
}

.deploy-btn.run {
  border-color: var(--accent2);
  background: #0d1a2b;
  color: var(--accent);
}

.deploy-btn.run:hover {
  background: #0f2040;
}

.deploy-btn.stop {
  border-color: #4a1515;
  background: var(--red-bg);
  color: var(--red);
}

.deploy-btn.stop:hover {
  background: #3a0e0e;
}

.progress-bar {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-bottom: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-fill.running {
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 50%, var(--accent) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
</style>
