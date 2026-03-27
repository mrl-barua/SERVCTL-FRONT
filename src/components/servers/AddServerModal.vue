<template>
  <div class="modal-overlay open" @click="handleBackdropClick">
    <div class="modal">
      <h2>Add Server</h2>

      <div class="form-row">
        <label class="form-label">server name</label>
        <input v-model="form.name" class="form-input" placeholder="web-prod-01" />
      </div>

      <div class="form-row-2">
        <div>
          <label class="form-label">host / IP</label>
          <input v-model="form.host" class="form-input" placeholder="10.0.1.10" />
        </div>
        <div>
          <label class="form-label">port</label>
          <input v-model.number="form.port" class="form-input" placeholder="22" />
        </div>
      </div>

      <div class="form-row-2">
        <div>
          <label class="form-label">user</label>
          <input v-model="form.user" class="form-input" placeholder="ubuntu" />
        </div>
        <div>
          <label class="form-label">environment</label>
          <select v-model="form.env" class="form-select">
            <option value="prod">Production</option>
            <option value="live">Live</option>
            <option value="qa">QA</option>
            <option value="test">Testing</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">notes / role</label>
        <input v-model="form.notes" class="form-input" placeholder="nginx, API, PostgreSQL…" />
      </div>

      <div class="form-row">
        <label class="form-label">deploy script (optional)</label>
        <input v-model="form.deploy" class="form-input" placeholder="./deploy.sh" />
      </div>

      <div class="form-row">
        <label class="form-label">log path (optional)</label>
        <input v-model="form.logpath" class="form-input" placeholder="/var/log/app/app.log" />
      </div>

      <div class="modal-actions">
        <button class="modal-btn" @click="emit('close')">cancel</button>
        <button class="modal-btn primary" @click="handleSubmit">add server</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'add'])

const form = ref({
  name: '',
  host: '',
  port: 22,
  user: 'ubuntu',
  env: 'prod',
  notes: '',
  deploy: '',
  logpath: '',
})

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function handleSubmit() {
  if (!form.value.name.trim() || !form.value.host.trim()) {
    alert('Server name and host are required.')
    return
  }

  emit('add', {
    name: form.value.name.trim(),
    host: form.value.host.trim(),
    port: form.value.port || 22,
    user: form.value.user.trim() || 'ubuntu',
    env: form.value.env,
    notes: form.value.notes.trim(),
    deploy: form.value.deploy.trim(),
    logpath: form.value.logpath.trim(),
  })

  form.value = {
    name: '',
    host: '',
    port: 22,
    user: 'ubuntu',
    env: 'prod',
    notes: '',
    deploy: '',
    logpath: '',
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 380px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-slide-in 0.3s ease-out;
}

.modal h2 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
  color: var(--text);
}

.form-row {
  margin-bottom: 12px;
}

.form-label {
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 5px;
}

.form-input,
.form-select {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 7px 12px;
  border-radius: var(--radius);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.modal-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 7px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
}

.modal-btn:hover {
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

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
