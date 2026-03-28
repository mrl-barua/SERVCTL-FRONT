<template>
  <section class="keys-page">
    <header class="keys-header">
      <div>
        <h1>SSH Key Vault</h1>
        <p>Encrypted SSH keys stored securely for reuse across servers.</p>
      </div>
      <button class="primary-btn" @click="openUpload">+ Add Key</button>
    </header>

    <div class="security-banner">
      Private keys are encrypted with AES-256-CBC before storage. Fingerprints are shown for
      verification. Keys are never returned via the API and are only used server-side for SSH.
    </div>

    <div v-if="loading" class="muted">Loading keys...</div>
    <div v-else-if="keys.length === 0" class="muted">No keys in vault yet.</div>

    <div v-else class="keys-grid">
      <article v-for="key in keys" :key="key.id" class="key-card">
        <h3>{{ key.label }}</h3>
        <p class="fingerprint">{{ truncateFingerprint(key.fingerprint) }}</p>
        <p class="public-key">{{ key.publicKey.slice(0, 30) }}...</p>
        <p class="meta">
          Created {{ formatDate(key.createdAt) }} · Used by {{ key.usedByServers }} servers
        </p>
        <div class="actions">
          <button class="btn" @click="openVerify(key)">Test Connection</button>
          <button class="btn danger" @click="confirmDelete(key)">Delete</button>
        </div>
      </article>
    </div>

    <div v-if="showUpload" class="modal-overlay" @click.self="closeUpload">
      <div class="modal">
        <h2>Upload SSH Key</h2>
        <label>Label</label>
        <input v-model="uploadForm.label" placeholder="my-prod-key" />
        <label>Private key (PEM)</label>
        <textarea
          v-model="uploadForm.privateKey"
          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          rows="8"
        />
        <label>Passphrase (optional)</label>
        <input v-model="uploadForm.passphrase" type="password" placeholder="optional" />
        <div class="actions">
          <button class="btn" @click="closeUpload">Cancel</button>
          <button class="btn primary" @click="uploadKey">Upload & Save</button>
        </div>
        <p v-if="uploadFingerprint" class="fingerprint">Fingerprint: {{ uploadFingerprint }}</p>
      </div>
    </div>

    <div v-if="verifyState.visible" class="modal-overlay" @click.self="closeVerify">
      <div class="modal">
        <h2>Verify {{ verifyState.key?.label }}</h2>
        <label>Host</label>
        <input v-model="verifyState.host" placeholder="203.0.113.10" />
        <label>User</label>
        <input v-model="verifyState.user" placeholder="ubuntu" />
        <label>Port</label>
        <input v-model.number="verifyState.port" type="number" placeholder="22" />
        <div class="actions">
          <button class="btn" @click="closeVerify">Cancel</button>
          <button class="btn primary" @click="verifyKey">Run Handshake Test</button>
        </div>
        <p v-if="verifyState.message" class="muted">{{ verifyState.message }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import apiClient from '../services/http'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
const keys = ref([])
const loading = ref(false)
const showUpload = ref(false)
const uploadFingerprint = ref('')

const uploadForm = reactive({
  label: '',
  privateKey: '',
  passphrase: '',
})

const verifyState = reactive({
  visible: false,
  key: null,
  host: '',
  user: 'ubuntu',
  port: 22,
  message: '',
})

async function fetchKeys() {
  loading.value = true
  try {
    const { data } = await apiClient.get('/keys')
    keys.value = data
  } catch (error) {
    toastStore.showToast(error?.response?.data?.message || 'Failed to load keys', 'error')
  } finally {
    loading.value = false
  }
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function truncateFingerprint(value) {
  if (!value) return '-'
  return value.length > 24 ? `${value.slice(0, 20)}...` : value
}

function openUpload() {
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
  uploadFingerprint.value = ''
  uploadForm.label = ''
  uploadForm.privateKey = ''
  uploadForm.passphrase = ''
}

async function uploadKey() {
  if (!uploadForm.label.trim() || !uploadForm.privateKey.trim()) {
    toastStore.showToast('Label and private key are required', 'error')
    return
  }

  try {
    const { data } = await apiClient.post('/keys', {
      label: uploadForm.label.trim(),
      privateKey: uploadForm.privateKey,
      passphrase: uploadForm.passphrase || undefined,
    })

    uploadFingerprint.value = data.fingerprint
    toastStore.showToast('SSH key uploaded successfully', 'success')
    await fetchKeys()
  } catch (error) {
    toastStore.showToast(error?.response?.data?.message || 'Upload failed', 'error')
  }
}

function openVerify(key) {
  verifyState.visible = true
  verifyState.key = key
  verifyState.host = ''
  verifyState.user = 'ubuntu'
  verifyState.port = 22
  verifyState.message = ''
}

function closeVerify() {
  verifyState.visible = false
  verifyState.key = null
  verifyState.message = ''
}

async function verifyKey() {
  if (!verifyState.key) return
  if (!verifyState.host.trim() || !verifyState.user.trim()) {
    toastStore.showToast('Host and user are required for verification', 'error')
    return
  }

  verifyState.message = 'Verifying...'
  try {
    const { data } = await apiClient.post(`/keys/${verifyState.key.id}/verify`, {
      host: verifyState.host.trim(),
      user: verifyState.user.trim(),
      port: Number(verifyState.port) || 22,
    })
    verifyState.message = data.message
    toastStore.showToast('SSH verification successful', 'success')
  } catch (error) {
    verifyState.message = error?.response?.data?.message || 'Verification failed'
    toastStore.showToast(verifyState.message, 'error')
  }
}

async function confirmDelete(key) {
  const ok = window.confirm(
    `${key.usedByServers} servers use this key. Are you sure you want to delete ${key.label}?`,
  )
  if (!ok) return

  try {
    await apiClient.delete(`/keys/${key.id}`)
    toastStore.showToast('Key deleted', 'success')
    await fetchKeys()
  } catch (error) {
    toastStore.showToast(error?.response?.data?.message || 'Delete failed', 'error')
  }
}

onMounted(fetchKeys)
</script>

<style scoped>
.keys-page {
  display: grid;
  gap: 14px;
}

.keys-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.keys-header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
}

.keys-header p {
  margin: 4px 0 0;
  color: var(--text2);
}

.security-banner {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
}

.keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.key-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px;
}

.key-card h3 {
  margin: 0;
  font-size: 13px;
}

.fingerprint,
.public-key,
.meta,
.muted {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn,
.primary-btn {
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 6px 10px;
  cursor: pointer;
}

.primary-btn,
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.btn.danger {
  border-color: #582121;
  color: var(--red);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  display: grid;
  place-items: center;
  z-index: 200;
}

.modal {
  width: min(520px, 92vw);
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: grid;
  gap: 8px;
}

.modal input,
.modal textarea {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: var(--radius);
  padding: 8px;
  font-family: var(--font-mono);
}
</style>
