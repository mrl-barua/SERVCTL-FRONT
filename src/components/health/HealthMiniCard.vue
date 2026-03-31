<template>
  <div class="health-mini">
    <div class="mini-bar-row">
      <span class="mini-label">C</span>
      <div class="mini-track">
        <div class="mini-fill" :style="barStyle(cpu)"></div>
      </div>
      <span class="mini-value">{{ Math.round(cpu) }}%</span>
    </div>
    <div class="mini-bar-row">
      <span class="mini-label">M</span>
      <div class="mini-track">
        <div class="mini-fill" :style="barStyle(mem)"></div>
      </div>
      <span class="mini-value">{{ Math.round(mem) }}%</span>
    </div>
    <div class="mini-bar-row">
      <span class="mini-label">D</span>
      <div class="mini-track">
        <div class="mini-fill" :style="barStyle(disk)"></div>
      </div>
      <span class="mini-value">{{ Math.round(disk) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cpu: number
  mem: number
  disk: number
}>()

function barColor(value: number): string {
  if (value >= 90) return 'var(--red)'
  if (value >= 70) return 'var(--yellow)'
  return 'var(--green)'
}

function barStyle(value: number) {
  const clamped = Math.max(0, Math.min(100, value))
  return {
    width: `${clamped}%`,
    background: barColor(clamped),
  }
}
</script>

<style scoped>
.health-mini {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-family: var(--font-mono);
}

.mini-bar-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-label {
  font-size: 9px;
  color: var(--text3);
  width: 10px;
  text-align: right;
  flex-shrink: 0;
}

.mini-track {
  flex: 1;
  height: 4px;
  background: var(--bg4);
  border-radius: 2px;
  overflow: hidden;
  min-width: 0;
}

.mini-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.mini-value {
  font-size: 9px;
  color: var(--text3);
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}
</style>
