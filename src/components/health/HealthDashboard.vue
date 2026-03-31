<template>
  <div class="health-dashboard">
    <!-- Loading state -->
    <div v-if="healthStore.loading && !currentData" class="health-loading">
      <span class="loading-dot"></span>
      <span>Loading health data...</span>
    </div>

    <!-- No data state -->
    <div v-else-if="!currentData" class="health-empty">
      <p>No health data available for this server.</p>
      <button class="collect-btn" @click="collect">Collect Now</button>
    </div>

    <!-- Dashboard content -->
    <template v-else>
      <!-- Gauges row -->
      <div class="gauges-row">
        <GaugeCard
          :value="currentData.cpuPercent ?? 0"
          label="CPU"
          :sub-label="cpuSubLabel"
        />
        <GaugeCard
          :value="currentData.memPercent ?? 0"
          label="Memory"
          :sub-label="memSubLabel"
        />
        <GaugeCard
          :value="currentData.diskPercent ?? 0"
          label="Disk"
          :sub-label="diskSubLabel"
        />
      </div>

      <!-- Sparklines row -->
      <div class="sparklines-row">
        <div class="sparkline-col">
          <div class="sparkline-label">CPU History</div>
          <SparkLine
            :data="cpuHistory"
            color="var(--accent)"
            :width="200"
            :height="40"
            :threshold-line="90"
          />
        </div>
        <div class="sparkline-col">
          <div class="sparkline-label">Memory History</div>
          <SparkLine
            :data="memHistory"
            color="var(--green)"
            :width="200"
            :height="40"
            :threshold-line="90"
          />
        </div>
        <div class="sparkline-col">
          <div class="sparkline-label">Disk History</div>
          <SparkLine
            :data="diskHistory"
            color="var(--yellow)"
            :width="200"
            :height="40"
            :threshold-line="90"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="health-actions">
        <button class="collect-btn" :disabled="collecting" @click="collect">
          {{ collecting ? 'Collecting...' : 'Collect Now' }}
        </button>
        <span v-if="currentData.createdAt" class="last-updated">
          Last updated: {{ formatTime(currentData.createdAt) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useServerHealthStore } from '../../stores/serverHealth'
import GaugeCard from './GaugeCard.vue'
import SparkLine from './SparkLine.vue'

const props = defineProps<{
  serverId: number
}>()

const healthStore = useServerHealthStore()
const collecting = ref(false)

const currentData = computed(() => healthStore.currentHealth[props.serverId])
const historyData = computed(() => healthStore.snapshots[props.serverId] || [])

const cpuHistory = computed(() => historyData.value.map((s: any) => s.cpuPercent ?? 0))
const memHistory = computed(() => historyData.value.map((s: any) => s.memPercent ?? 0))
const diskHistory = computed(() => historyData.value.map((s: any) => s.diskPercent ?? 0))

const cpuSubLabel = computed(() => {
  if (!currentData.value) return ''
  return `${(currentData.value.cpuPercent ?? 0).toFixed(1)}%`
})

const memSubLabel = computed(() => {
  if (!currentData.value) return ''
  const used = currentData.value.memUsedMb ?? 0
  const total = currentData.value.memTotalMb ?? 0
  return `${formatMb(used)} / ${formatMb(total)}`
})

const diskSubLabel = computed(() => {
  if (!currentData.value) return ''
  const used = currentData.value.diskUsedGb ?? 0
  const total = currentData.value.diskTotalGb ?? 0
  return `${formatGb(used)} / ${formatGb(total)}`
})

/** Format a value in megabytes to a human-readable string */
function formatMb(mb: number): string {
  if (mb === 0) return '0 B'
  if (mb < 1024) return `${Math.round(mb)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

/** Format a value in gigabytes to a human-readable string */
function formatGb(gb: number): string {
  if (gb === 0) return '0 B'
  if (gb < 1) return `${Math.round(gb * 1024)} MB`
  return `${gb.toFixed(1)} GB`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

async function loadData() {
  if (!props.serverId) return
  try {
    await Promise.all([
      healthStore.fetchCurrentHealth(props.serverId),
      healthStore.fetchHealthHistory(props.serverId),
    ])
  } catch {
    // errors handled in store
  }
}

async function collect() {
  if (!props.serverId) return
  collecting.value = true
  try {
    await healthStore.triggerCollect(props.serverId)
    await healthStore.fetchHealthHistory(props.serverId)
  } catch {
    // errors handled in store
  } finally {
    collecting.value = false
  }
}

watch(() => props.serverId, loadData)
onMounted(loadData)
</script>

<style scoped>
.health-dashboard {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.health-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 40px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text3);
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.health-empty {
  text-align: center;
  padding: 40px 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text3);
}

.health-empty p {
  margin-bottom: 12px;
}

.gauges-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.sparklines-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.sparkline-col {
  min-width: 0;
}

.sparkline-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.health-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

.collect-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 6px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--accent2);
  background: var(--accent2);
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s ease;
}

.collect-btn:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
}

.collect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.last-updated {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
}

@media (max-width: 767px) {
  .gauges-row {
    gap: 16px;
  }

  .sparklines-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .health-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
