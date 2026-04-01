<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Add Database Connection</h3>
          <button class="modal-close" @click="$emit('update:modelValue', false)">&times;</button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <label class="form-label">CONNECTION NAME</label>
          <input v-model="form.name" class="form-input" placeholder="Production MySQL" required />

          <label class="form-label">DATABASE TYPE</label>
          <select v-model="form.type" class="form-input form-select" required>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>

          <div class="form-row">
            <div class="form-col">
              <label class="form-label">HOST</label>
              <input v-model="form.host" class="form-input" placeholder="127.0.0.1" required />
            </div>
            <div class="form-col-sm">
              <label class="form-label">PORT</label>
              <input v-model.number="form.port" class="form-input" type="number" required />
            </div>
          </div>

          <label class="form-label">DATABASE NAME</label>
          <input v-model="form.databaseName" class="form-input" placeholder="myapp_db" />

          <div class="form-row">
            <div class="form-col">
              <label class="form-label">USERNAME</label>
              <input v-model="form.username" class="form-input" placeholder="root" required />
            </div>
            <div class="form-col">
              <label class="form-label">PASSWORD</label>
              <input v-model="form.password" class="form-input" type="password" placeholder="password" required />
            </div>
          </div>

          <div class="tunnel-toggle">
            <label class="toggle-row">
              <input v-model="form.useSSHTunnel" type="checkbox" class="toggle-check" />
              <span>Connect via SSH tunnel</span>
            </label>
          </div>

          <div v-if="form.useSSHTunnel" class="tunnel-config">
            <label class="form-label">SSH SERVER</label>
            <select v-model.number="form.serverId" class="form-input form-select" required>
              <option :value="null" disabled>Select a server</option>
              <option v-for="s in servers" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.host }})
              </option>
            </select>
          </div>

          <div v-if="testResult" class="test-result" :class="testResult.ok ? 'success' : 'failure'">
            {{ testResult.ok ? `Connected (${testResult.latencyMs}ms)` : testResult.error }}
          </div>

          <div class="modal-actions">
            <button type="button" class="modal-btn" @click="handleTest" :disabled="testing">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button type="submit" class="modal-btn primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Connection' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useDatabaseStore } from '../../stores/database'
import { useServersStore } from '../../stores/servers'
import { useToastStore } from '../../stores/toast'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const dbStore = useDatabaseStore()
const serversStore = useServersStore()
const toastStore = useToastStore()

const servers = ref([])
const saving = ref(false)
const testing = ref(false)
const testResult = ref(null)

const form = reactive({
  name: '',
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  databaseName: '',
  username: 'root',
  password: '',
  useSSHTunnel: false,
  serverId: null,
})

watch(() => form.type, (type) => {
  if (type === 'mysql') form.port = 3306
  else if (type === 'postgresql') form.port = 5432
  else if (type === 'mongodb') form.port = 27017
})

watch(() => props.modelValue, async (open) => {
  if (open) {
    testResult.value = null
    servers.value = serversStore.servers || []
    if (servers.value.length === 0) {
      await serversStore.fetchServers?.()
      servers.value = serversStore.servers || []
    }
  }
})

async function handleSubmit() {
  saving.value = true
  try {
    await dbStore.createConnection(form)
    toastStore.showToast('Connection saved', 'success')
    emit('update:modelValue', false)
    resetForm()
  } catch (err) {
    toastStore.showToast(err?.response?.data?.message || 'Failed to save', 'error')
  } finally {
    saving.value = false
  }
}

async function handleTest() {
  testing.value = true
  testResult.value = null
  try {
    // Save first, then test
    const conn = await dbStore.createConnection(form)
    const result = await dbStore.testConnection(conn.id)
    testResult.value = result
    if (!result.ok) {
      await dbStore.deleteConnection(conn.id)
    }
  } catch (err) {
    testResult.value = { ok: false, error: err?.response?.data?.message || 'Test failed' }
  } finally {
    testing.value = false
  }
}

function resetForm() {
  form.name = ''
  form.type = 'mysql'
  form.host = '127.0.0.1'
  form.port = 3306
  form.databaseName = ''
  form.username = 'root'
  form.password = ''
  form.useSSHTunnel = false
  form.serverId = null
  testResult.value = null
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  width: min(480px, calc(100% - 32px));
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: var(--font-display);
  font-size: 15px;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text3);
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-label {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text3);
  margin: 12px 0 6px;
  font-family: var(--font-mono);
}

.form-label:first-child {
  margin-top: 0;
}

.form-input {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-select {
  appearance: auto;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-col {
  flex: 1;
  min-width: 0;
}

.form-col-sm {
  width: 100px;
  flex-shrink: 0;
}

.tunnel-toggle {
  margin-top: 14px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text2);
  cursor: pointer;
}

.toggle-check {
  accent-color: var(--accent);
}

.tunnel-config {
  margin-top: 4px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(79, 142, 247, 0.04);
}

.test-result {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 11px;
  font-family: var(--font-mono);
}

.test-result.success {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid rgba(62, 207, 142, 0.2);
}

.test-result.failure {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid rgba(242, 95, 92, 0.2);
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 9px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.modal-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.modal-btn.primary:hover {
  background: var(--accent2);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
