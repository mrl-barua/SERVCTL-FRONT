<template>
  <div class="health-view">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Server Health</h1>
      <p class="page-subtitle">Monitor CPU, memory, and disk usage across your servers</p>
    </div>

    <!-- Server selector -->
    <div class="form-row">
      <label class="form-label">active server</label>
      <select
        v-model.number="selectedServerId"
        class="form-select"
      >
        <option value="0">select a server</option>
        <option
          v-for="server in serversStore.servers"
          :key="server.id"
          :value="server.id"
        >
          {{ server.name }} ({{ server.host }})
        </option>
      </select>
    </div>

    <!-- Health Dashboard -->
    <HealthDashboard v-if="selectedServerId" :server-id="selectedServerId" />
    <div v-else class="no-server-msg">
      Select a server above to view health metrics.
    </div>

    <!-- Alerts section -->
    <div class="alerts-section">
      <div class="alerts-header">
        <h2 class="section-title">Alert Rules</h2>
      </div>

      <!-- Alert list -->
      <div v-if="healthStore.alerts.length > 0" class="alerts-list">
        <div
          v-for="alert in healthStore.alerts"
          :key="alert.id"
          class="alert-row"
        >
          <div class="alert-info">
            <span class="alert-metric">{{ alert.metric }}</span>
            <span class="alert-condition">{{ alert.direction }} {{ alert.threshold }}%</span>
          </div>
          <button class="alert-delete-btn" @click="removeAlert(alert.id)">
            Delete
          </button>
        </div>
      </div>
      <div v-else class="alerts-empty">
        No alert rules configured.
      </div>

      <!-- Create alert form -->
      <div class="alert-form">
        <div class="alert-form-title">Create Alert Rule</div>
        <div class="alert-form-row">
          <div class="alert-field">
            <label class="form-label">metric</label>
            <select v-model="newAlert.metric" class="form-select">
              <option value="cpu">CPU</option>
              <option value="memory">Memory</option>
              <option value="disk">Disk</option>
            </select>
          </div>
          <div class="alert-field">
            <label class="form-label">threshold</label>
            <div class="threshold-input-row">
              <input
                v-model.number="newAlert.threshold"
                type="range"
                min="0"
                max="100"
                step="1"
                class="threshold-slider"
              />
              <span class="threshold-value">{{ newAlert.threshold }}%</span>
            </div>
          </div>
          <div class="alert-field">
            <label class="form-label">direction</label>
            <div class="direction-toggle">
              <button
                class="toggle-btn"
                :class="{ active: newAlert.direction === 'above' }"
                @click="newAlert.direction = 'above'"
              >
                Above
              </button>
              <button
                class="toggle-btn"
                :class="{ active: newAlert.direction === 'below' }"
                @click="newAlert.direction = 'below'"
              >
                Below
              </button>
            </div>
          </div>
          <div class="alert-field alert-field-btn">
            <button class="create-alert-btn" @click="addAlert">Create</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useServersStore } from '../stores/servers'
import { useServerHealthStore } from '../stores/serverHealth'
import HealthDashboard from '../components/health/HealthDashboard.vue'

const serversStore = useServersStore()
const healthStore = useServerHealthStore()

const selectedServerId = ref(0)

const newAlert = reactive({
  metric: 'cpu',
  threshold: 80,
  direction: 'above' as 'above' | 'below',
})

// Default to first server if available
watch(
  () => serversStore.servers,
  (servers) => {
    if (!selectedServerId.value && servers.length > 0) {
      selectedServerId.value = servers[0].id
    }
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  if (serversStore.servers.length === 0) {
    try {
      await serversStore.fetchServers()
    } catch {
      // handled in store
    }
  }

  try {
    await healthStore.fetchAlerts()
  } catch {
    // handled in store
  }
})

async function addAlert() {
  try {
    await healthStore.createAlert({
      metric: newAlert.metric,
      threshold: newAlert.threshold,
      direction: newAlert.direction,
      ...(selectedServerId.value ? { serverId: selectedServerId.value } : {}),
    })
  } catch {
    // handled in store
  }
}

async function removeAlert(id: number) {
  try {
    await healthStore.deleteAlert(id)
  } catch {
    // handled in store
  }
}
</script>

<style scoped>
.health-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  margin-bottom: 4px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--text);
  margin: 0 0 4px 0;
  font-weight: 700;
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text3);
  margin: 0;
}

.form-row {
  margin-bottom: 0;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 5px;
}

.form-select {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 5px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  max-width: 320px;
  width: 100%;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.no-server-msg {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text3);
  text-align: center;
  padding: 40px 0;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

/* Alerts section */
.alerts-section {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.alerts-header {
  margin-bottom: 14px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--text);
  margin: 0;
  font-weight: 600;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.alert-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-metric {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  font-weight: 600;
}

.alert-condition {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
}

.alert-delete-btn {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 3px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--red);
  background: transparent;
  color: var(--red);
  cursor: pointer;
  transition: all 0.12s ease;
}

.alert-delete-btn:hover {
  background: var(--red-bg);
}

.alerts-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
  padding: 12px 0;
  margin-bottom: 16px;
}

/* Alert form */
.alert-form {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.alert-form-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.alert-form-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.alert-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.alert-field-btn {
  justify-content: flex-end;
}

.threshold-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.threshold-slider {
  width: 120px;
  accent-color: var(--accent);
}

.threshold-value {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text);
  min-width: 36px;
}

.direction-toggle {
  display: flex;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  overflow: hidden;
}

.toggle-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 12px;
  border: none;
  background: var(--bg3);
  color: var(--text3);
  cursor: pointer;
  transition: all 0.12s ease;
}

.toggle-btn.active {
  background: var(--accent2);
  color: var(--text);
}

.toggle-btn:hover:not(.active) {
  color: var(--text2);
}

.create-alert-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 6px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--accent2);
  background: var(--accent2);
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s ease;
}

.create-alert-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
}

@media (max-width: 767px) {
  .alert-form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .threshold-slider {
    width: 100%;
  }

  .form-select {
    max-width: 100%;
  }
}
</style>
