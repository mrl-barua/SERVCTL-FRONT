<template>
  <div class="modal-overlay" @click="handleBackdropClick">
    <div class="modal">
      <header class="modal-header">
        <h2>{{ mode === 'edit' ? 'Edit Server' : 'Add Server' }}</h2>
        <button class="x-btn" @click="emit('close')">x</button>
      </header>

      <section class="section">
        <h3>Step 1 - Basic Info</h3>
        <div class="grid-2">
          <label>
            Server name
            <input v-model="form.name" placeholder="web-prod-01" />
          </label>
          <label>
            Host / IP
            <input
              v-model="form.host"
              placeholder="10.0.1.10"
              @blur="checkNetworkWarning"
              @input="queueNetworkWarning"
            />
          </label>
        </div>

        <div v-if="networkWarning" :class="['warning-box', networkWarning.level]">
          <p class="warning-title">
            {{ networkWarning.level === 'error' ? 'X' : 'i' }} {{ networkWarning.title }}
          </p>
          <p>{{ networkWarning.message }}</p>
          <p>{{ networkWarning.suggestion }}</p>
          <RouterLink v-if="networkWarning.showInstallGuide" class="warning-link" to="/install">
            Self-host Guide
          </RouterLink>
        </div>

        <div class="grid-3">
          <label>
            Port
            <input v-model.number="form.port" type="number" placeholder="22" />
          </label>
          <label>
            Username
            <input v-model="form.user" placeholder="ubuntu" />
          </label>
          <label>
            Environment
            <select v-model="form.env">
              <option value="prod">prod</option>
              <option value="live">live</option>
              <option value="qa">qa</option>
              <option value="test">test</option>
            </select>
          </label>
        </div>

        <label>
          Notes / role
          <input v-model="form.notes" placeholder="api, nginx, database" />
        </label>
      </section>

      <section class="section">
        <h3>Step 2 - Authentication Method</h3>
        <div class="tabs">
          <button
            v-for="tab in authTabs"
            :key="tab.value"
            :disabled="tab.disabled"
            :title="tab.tooltip"
            :class="['tab-btn', { active: form.authMethod === tab.value, disabled: tab.disabled }]"
            @click="selectTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="form.authMethod === 'password'" class="auth-panel">
          <label>
            Password
            <div class="input-with-btn">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter SSH password"
              />
              <button class="tiny-btn" @click="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>
          <p class="pill">Passwords are encrypted with AES-256 before storage.</p>
        </div>

        <div v-else-if="form.authMethod === 'key-stored'" class="auth-panel">
          <label>
            Key name
            <input v-model="form.sshKeyLabel" placeholder="prod-key" />
          </label>
          <label>
            Paste private key (PEM format)
            <textarea
              v-model="form.sshKey"
              class="key-textarea"
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
              rows="8"
            />
          </label>
          <label>
            Passphrase (optional)
            <div class="input-with-btn">
              <input
                v-model="form.passphrase"
                :type="showPassphrase ? 'text' : 'password'"
                placeholder="optional"
              />
              <button class="tiny-btn" @click="showPassphrase = !showPassphrase">
                {{ showPassphrase ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>
          <label class="checkbox-row">
            <input v-model="saveToVault" type="checkbox" /> Save to Key Vault for reuse
          </label>
          <p class="pill">
            Key is encrypted before storage. We never transmit your private key to third parties.
          </p>
        </div>

        <div v-else-if="form.authMethod === 'key-path'" class="auth-panel">
          <p v-if="isCloudMode" class="pill warning">
            Key file paths are only available in local mode. Install SERVCTL locally to use this option.
          </p>
          <template v-else>
            <label>
              Key label
              <input v-model="form.sshKeyLabel" placeholder="id_rsa" />
            </label>
            <label>
              Key path
              <input v-model="form.sshKeyPath" :placeholder="keyPathPlaceholder" />
            </label>
            <p class="help">
              Enter the absolute path to your private key on this machine. The file must be readable
              by the SERVCTL backend process.
            </p>
            <div class="verify-row">
              <button class="tiny-btn" @click="verifyKeyPath">Verify Path</button>
              <span v-if="keyPathStatus" :class="['verify-status', keyPathStatus.ok ? 'ok' : 'bad']">
                {{ keyPathStatus.ok ? 'Key file found and readable' : 'File not found or not readable' }}
              </span>
            </div>
          </template>
        </div>

        <div v-else class="auth-panel">
          <div class="vault-header">
            <label>
              Select saved key
              <select v-model="form.vaultKeyId">
                <option disabled value="">Select a key</option>
                <option v-for="item in keyVaultList" :key="item.id" :value="item.id">
                  {{ item.label }} ({{ truncate(item.fingerprint) }})
                </option>
              </select>
            </label>
            <button class="tiny-btn" @click="openVaultUpload">+ Upload New Key</button>
          </div>

          <p v-if="keyVaultList.length === 0" class="help">
            No saved keys yet. Use the SSH Key tab to upload and save your first key.
          </p>
        </div>
      </section>

      <section class="section">
        <button class="collapse-btn" @click="showAdvanced = !showAdvanced">
          Step 4 - Advanced {{ showAdvanced ? '[-]' : '[+]' }}
        </button>

        <div v-if="showAdvanced" class="advanced-panel">
          <label>
            Log type
            <select v-model="form.logType">
              <option value="file">file</option>
              <option value="journalctl">journalctl</option>
              <option value="docker">docker</option>
            </select>
          </label>

          <label v-if="form.logType === 'file'">
            Log path
            <input v-model="form.logPath" placeholder="/var/log/app.log" />
          </label>

          <label v-if="form.logType === 'docker'">
            Docker container name
            <input v-model="form.dockerName" placeholder="app-container" />
          </label>

          <label>
            Deploy script command
            <textarea v-model="form.deploy" rows="3" placeholder="git pull && npm ci && npm run build" />
          </label>
        </div>
      </section>

      <footer class="modal-actions">
        <button class="btn" @click="emit('close')">Cancel</button>
        <button class="btn primary" @click="handleSubmit">
          {{ mode === 'edit' ? 'Update Server' : 'Add Server' }}
        </button>
      </footer>
    </div>

    <div v-if="showVaultUpload" class="modal-overlay nested" @click.self="closeVaultUpload">
      <div class="modal sub-modal">
        <h3>Upload Key to Vault</h3>
        <label>
          Label
          <input v-model="vaultUpload.label" placeholder="my-prod-key" />
        </label>
        <label>
          Private key
          <textarea
            v-model="vaultUpload.privateKey"
            rows="7"
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          />
        </label>
        <label>
          Passphrase (optional)
          <input v-model="vaultUpload.passphrase" type="password" placeholder="optional" />
        </label>
        <div class="modal-actions">
          <button class="btn" @click="closeVaultUpload">Cancel</button>
          <button class="btn primary" @click="uploadVaultKey">Upload & Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import apiClient from '../../services/http'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'

const emit = defineEmits(['close', 'add'])

const appStore = useAppStore()
const toastStore = useToastStore()

const mode = ref('create')
const showPassword = ref(false)
const showPassphrase = ref(false)
const showAdvanced = ref(false)
const saveToVault = ref(false)
const keyVaultList = ref([])
const showVaultUpload = ref(false)
const networkWarning = ref(null)
const keyPathStatus = ref(null)
let networkTimer = null

const form = reactive({
  name: '',
  host: '',
  port: 22,
  user: 'ubuntu',
  env: 'prod',
  notes: '',
  deploy: '',
  logPath: '',
  logType: 'file',
  dockerName: '',
  authMethod: 'password',
  password: '',
  sshKey: '',
  sshKeyLabel: '',
  sshKeyPath: '',
  vaultKeyId: '',
  passphrase: '',
})

const vaultUpload = reactive({
  label: '',
  privateKey: '',
  passphrase: '',
})

const isCloudMode = computed(() => appStore.deployMode === 'cloud')
const keyPathPlaceholder = computed(() => {
  const ua = navigator.userAgent || ''
  return /Windows/i.test(ua)
    ? 'C:\\Users\\user\\.ssh\\id_rsa'
    : '/home/user/.ssh/id_rsa'
})

const authTabs = computed(() => [
  { value: 'password', label: 'Password' },
  { value: 'key-stored', label: 'SSH Key (paste)' },
  {
    value: 'key-path',
    label: 'Key File (path)',
    disabled: isCloudMode.value,
    tooltip: isCloudMode.value
      ? 'Key file paths are only available in local mode.'
      : '',
  },
  { value: 'key-vault', label: 'Key Vault (saved)' },
])

function truncate(value) {
  if (!value) return '-'
  return value.length > 20 ? `${value.slice(0, 20)}...` : value
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function selectTab(tab) {
  if (tab === 'key-path' && isCloudMode.value) {
    toastStore.showToast('Key path authentication is only available in local mode.', 'error')
    return
  }

  form.authMethod = tab
}

async function fetchKeyVault() {
  try {
    const { data } = await apiClient.get('/keys')
    keyVaultList.value = data
  } catch {
    keyVaultList.value = []
  }
}

function queueNetworkWarning() {
  if (networkTimer) clearTimeout(networkTimer)
  networkTimer = setTimeout(checkNetworkWarning, 600)
}

async function checkNetworkWarning() {
  if (!form.host.trim()) {
    networkWarning.value = null
    return
  }

  try {
    const { data } = await apiClient.get('/network/check', {
      params: { host: form.host.trim() },
    })
    networkWarning.value = data.warning
  } catch {
    networkWarning.value = null
  }
}

async function verifyKeyPath() {
  if (!form.sshKeyPath.trim()) {
    toastStore.showToast('Enter a key path first', 'error')
    return
  }

  try {
    const { data } = await apiClient.post('/servers/verify-key-path', {
      path: form.sshKeyPath.trim(),
    })
    keyPathStatus.value = data
  } catch {
    keyPathStatus.value = {
      ok: false,
      message: 'File not found or not readable',
    }
  }
}

function openVaultUpload() {
  showVaultUpload.value = true
}

function closeVaultUpload() {
  showVaultUpload.value = false
  vaultUpload.label = ''
  vaultUpload.privateKey = ''
  vaultUpload.passphrase = ''
}

async function uploadVaultKey() {
  if (!vaultUpload.label.trim() || !vaultUpload.privateKey.trim()) {
    toastStore.showToast('Label and private key are required', 'error')
    return
  }

  try {
    const { data } = await apiClient.post('/keys', {
      label: vaultUpload.label.trim(),
      privateKey: vaultUpload.privateKey,
      passphrase: vaultUpload.passphrase || undefined,
    })
    await fetchKeyVault()
    form.vaultKeyId = data.id
    closeVaultUpload()
    toastStore.showToast('Key uploaded to vault', 'success')
  } catch (error) {
    toastStore.showToast(error?.response?.data?.message || 'Failed to upload key', 'error')
  }
}

async function ensureVaultSaveFromPaste() {
  if (!saveToVault.value || form.authMethod !== 'key-stored') {
    return
  }

  const label = form.sshKeyLabel.trim() || 'uploaded-key'
  const { data } = await apiClient.post('/keys', {
    label,
    privateKey: form.sshKey,
    passphrase: form.passphrase || undefined,
  })

  form.authMethod = 'key-vault'
  form.vaultKeyId = data.id
  await fetchKeyVault()
}

async function handleSubmit() {
  if (!form.name.trim() || !form.host.trim()) {
    toastStore.showToast('Server name and host are required.', 'error')
    return
  }

  if (networkWarning.value?.level === 'error') {
    toastStore.showToast('This host is blocked in cloud mode. Use local mode instead.', 'error')
    return
  }

  try {
    await ensureVaultSaveFromPaste()

    emit('add', {
      name: form.name.trim(),
      host: form.host.trim(),
      port: Number(form.port) || 22,
      user: form.user.trim() || 'ubuntu',
      env: form.env,
      notes: form.notes.trim(),
      deploy: form.deploy.trim() || undefined,
      logPath: form.logPath.trim() || undefined,
      logType: form.logType,
      dockerName: form.dockerName.trim() || undefined,
      authMethod: form.authMethod,
      password: form.authMethod === 'password' ? form.password : undefined,
      sshKey: form.authMethod === 'key-stored' ? form.sshKey : undefined,
      sshKeyLabel: form.sshKeyLabel.trim() || undefined,
      sshKeyPath: form.authMethod === 'key-path' ? form.sshKeyPath.trim() : undefined,
      vaultKeyId: form.authMethod === 'key-vault' ? form.vaultKeyId : undefined,
    })

    emit('close')
  } catch (error) {
    const message = error?.response?.data?.message || 'Failed to prepare key payload'
    toastStore.showToast(Array.isArray(message) ? message.join(', ') : message, 'error')
  }
}

onMounted(async () => {
  await fetchKeyVault()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-overlay.nested {
  z-index: 300;
  background: rgba(2, 6, 23, 0.6);
}

.modal {
  width: min(860px, 95vw);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: grid;
  gap: 12px;
}

.sub-modal {
  width: min(560px, 92vw);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
}

.x-btn {
  border: none;
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  font-family: var(--font-mono);
}

.section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px;
  display: grid;
  gap: 10px;
}

.section h3 {
  margin: 0;
  font-size: 12px;
  font-family: var(--font-mono);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text2);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

label {
  display: grid;
  gap: 5px;
  font-size: 11px;
  color: var(--text2);
  font-family: var(--font-mono);
}

input,
select,
textarea {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: var(--radius);
  padding: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.key-textarea {
  min-height: 140px;
  font-size: 11px;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.tab-btn {
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  border-radius: var(--radius);
  padding: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
}

.tab-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: #0d1a2b;
}

.tab-btn.disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.auth-panel {
  display: grid;
  gap: 8px;
}

.warning-box {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 10px;
  background: var(--bg3);
  display: grid;
  gap: 4px;
}

.warning-box.error {
  background: var(--red-bg);
  border-color: #7b2525;
}

.warning-box.info {
  background: var(--bg3);
}

.warning-title {
  margin: 0;
  font-weight: 600;
}

.warning-link {
  color: var(--accent);
  text-decoration: none;
}

.warning-link:hover {
  text-decoration: underline;
}

.pill {
  margin: 0;
  border: 1px solid var(--border2);
  background: var(--bg3);
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  color: var(--text2);
  display: inline-block;
}

.pill.warning {
  border-color: #7b2525;
  background: var(--red-bg);
  color: var(--red);
}

.help {
  margin: 0;
  font-size: 11px;
  color: var(--text3);
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.tiny-btn {
  border: 1px solid var(--border2);
  background: var(--bg4);
  color: var(--text2);
  border-radius: var(--radius);
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
}

.tiny-btn:hover {
  color: var(--text);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.checkbox-row input {
  width: auto;
}

.verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verify-status {
  font-size: 11px;
  font-family: var(--font-mono);
}

.verify-status.ok {
  color: var(--green);
}

.verify-status.bad {
  color: var(--red);
}

.vault-header {
  display: grid;
  gap: 8px;
}

.collapse-btn {
  border: none;
  background: transparent;
  color: var(--text2);
  font-family: var(--font-mono);
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.advanced-panel {
  display: grid;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  font-family: var(--font-mono);
  font-size: 11px;
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  border-radius: var(--radius);
  padding: 7px 12px;
  cursor: pointer;
}

.btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

@media (max-width: 840px) {
  .grid-2,
  .grid-3,
  .tabs {
    grid-template-columns: 1fr;
  }
}
</style>
