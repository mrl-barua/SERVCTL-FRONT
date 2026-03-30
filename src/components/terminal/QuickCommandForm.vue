<template>
  <div class="modal-overlay open" @click.self="$emit('cancel')">
    <div class="modal qcf-modal">
      <div class="qcf-header">
        <h2 class="modal-title">
          {{ isEdit ? "Edit Quick Command" : "New Quick Command" }}
        </h2>
        <button class="qcf-close" @click="$emit('cancel')">✕</button>
      </div>

      <div class="form-row-2">
        <div class="form-col-icon">
          <label class="form-label">Icon (Emoji)</label>
          <input
            class="form-input icon-input"
            v-model="form.icon"
            placeholder="⚡"
            maxlength="4"
          />
        </div>
        <div class="form-col-label">
          <label class="form-label">Label</label>
          <input
            class="form-input"
            v-model="form.label"
            placeholder="disk usage"
            maxlength="40"
          />
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">Command</label>
        <input
          class="form-input"
          v-model="form.command"
          placeholder="df -h"
          :disabled="isEdit && command?.isSystem"
          maxlength="500"
        />
        <span v-if="isEdit && command?.isSystem" class="form-hint">
          System command text cannot be modified.
        </span>
      </div>

      <div class="form-row">
        <label class="form-label">Applies To</label>

        <div class="scope-toggle">
          <button
            type="button"
            class="scope-opt"
            :class="{ active: form.scope === 'all' }"
            @click="setAllScope"
          >
            <span class="scope-opt-icon">🌐</span>
            <div class="scope-opt-text">
              <div class="scope-opt-title">All Servers</div>
              <div class="scope-opt-sub">
                Appears in terminal for every server
              </div>
            </div>
          </button>

          <button
            type="button"
            class="scope-opt"
            :class="{ active: form.scope === 'server' }"
            @click="setServerScope"
          >
            <span class="scope-opt-icon">🖥</span>
            <div class="scope-opt-text">
              <div class="scope-opt-title">Specific Server</div>
              <div class="scope-opt-sub">
                Only appears when that server is selected
              </div>
            </div>
          </button>
        </div>
      </div>

      <div v-if="form.scope === 'server'" class="form-row">
        <label class="form-label">Server</label>
        <select v-model.number="form.serverId" class="form-select">
          <option :value="0" disabled>— select a server —</option>
          <optgroup
            v-for="group in envGroups"
            :key="group.label"
            :label="group.label"
          >
            <option v-for="srv in group.servers" :key="srv.id" :value="srv.id">
              {{ srv.name }} ({{ srv.host }})
            </option>
          </optgroup>
        </select>

        <div v-if="selectedServer" class="server-preview-pill">
          <span class="s-dot" :class="selectedServer.status"></span>
          {{ selectedServer.name }}
          <span class="env-pill" :class="`badge-${selectedServer.env}`">
            {{ selectedServer.env }}
          </span>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">Preview</label>
        <div class="cmd-preview-card">
          <div class="cmd-preview-top">
            <span class="preview-icon">{{ form.icon || "⚡" }}</span>
            <span class="preview-label">{{ form.label || "my command" }}</span>
            <span class="preview-scope">
              {{
                form.scope === "all"
                  ? "all servers"
                  : selectedServer?.name || "no server selected"
              }}
            </span>
          </div>
          <div class="cmd-preview-code">
            <span class="preview-prompt">$</span>
            {{ form.command || "echo hello" }}
          </div>
        </div>
      </div>

      <div v-if="error" class="form-error">✗ {{ error }}</div>

      <div class="modal-actions">
        <button type="button" class="modal-btn" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="button"
          class="modal-btn primary"
          @click="handleSubmit"
          :disabled="saving"
        >
          {{ saving ? "Saving..." : isEdit ? "Save Changes" : "Add Command →" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  command: {
    type: Object,
    default: null,
  },
  servers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["save", "cancel"]);

const isEdit = computed(() => !!props.command);
const saving = ref(false);
const error = ref(null);

const form = ref({
  label: props.command?.label ?? "",
  command: props.command?.command ?? "",
  icon: props.command?.icon ?? "",
  scope: props.command?.scope ?? "all",
  serverId: props.command?.serverId ?? 0,
});

const envGroups = computed(() => {
  const order = ["prod", "live", "qa", "test"];
  const labels = {
    prod: "Production",
    live: "Live",
    qa: "QA",
    test: "Testing",
  };

  return order
    .map((env) => ({
      label: labels[env],
      servers: props.servers.filter((server) => server.env === env),
    }))
    .filter((group) => group.servers.length > 0);
});

const selectedServer = computed(
  () =>
    props.servers.find((server) => server.id === form.value.serverId) ?? null,
);

function setAllScope() {
  form.value.scope = "all";
  form.value.serverId = 0;
}

function setServerScope() {
  form.value.scope = "server";
  if (!form.value.serverId && props.servers.length > 0) {
    form.value.serverId = props.servers[0].id;
  }
}

function validate() {
  if (!form.value.label.trim()) {
    return "Label is required";
  }

  if (!form.value.command.trim()) {
    return "Command is required";
  }

  if (form.value.scope === "server" && !form.value.serverId) {
    return "Please select a server for this command";
  }

  return null;
}

async function handleSubmit() {
  error.value = validate();
  if (error.value) {
    return;
  }

  saving.value = true;
  emit("save", {
    ...form.value,
    serverId: form.value.scope === "all" ? null : form.value.serverId,
  });
  saving.value = false;
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Modal card */
.qcf-modal {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 0;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.qcf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.qcf-close {
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text3);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  flex-shrink: 0;
}

.qcf-close:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

/* Form rows */
.form-row {
  padding: 14px 24px 0;
}

.form-row:last-of-type {
  padding-bottom: 4px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  padding: 16px 24px 0;
}

.form-col-icon,
.form-col-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 5px;
}

/* Inputs */
.form-input,
.form-select {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 8px 12px;
  border-radius: var(--radius);
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(79, 142, 247, 0.12);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--text3);
}

.icon-input {
  text-align: center;
  font-size: 16px;
  padding: 8px 6px;
}

.form-hint {
  display: block;
  font-size: 10px;
  color: var(--text3);
  margin-top: 5px;
  font-family: var(--font-mono);
}

/* Scope toggle */
.scope-toggle {
  display: flex;
  gap: 8px;
}

.scope-opt {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
  font-family: var(--font-mono);
}

.scope-opt:hover {
  border-color: var(--border2);
  background: var(--bg4);
}

.scope-opt.active {
  border-color: var(--accent);
  background: rgba(79, 142, 247, 0.06);
  color: var(--text);
}

.scope-opt-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.scope-opt-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.scope-opt-title {
  font-size: 12px;
  font-weight: 500;
  color: inherit;
  font-family: var(--font-mono);
}

.scope-opt.active .scope-opt-title {
  color: var(--accent);
}

.scope-opt-sub {
  font-size: 10px;
  color: var(--text3);
  line-height: 1.4;
}

/* Server preview pill */
.server-preview-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text2);
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 4px 12px;
  font-family: var(--font-mono);
}

.s-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.s-dot.online {
  background: var(--green);
}

.s-dot.offline {
  background: var(--red);
}

.s-dot.unknown {
  background: var(--text3);
}

.env-pill {
  font-size: 9px;
  padding: 1px 7px;
  border-radius: 99px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.badge-prod {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid #4a1515;
}

.badge-live {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid #0d4030;
}

.badge-qa {
  background: var(--yellow-bg);
  color: var(--yellow);
  border: 1px solid #3a2a0a;
}

.badge-test {
  background: #0d1a2b;
  color: var(--accent);
  border: 1px solid var(--accent2);
}

/* Preview card */
.cmd-preview-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.cmd-preview-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.preview-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.preview-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  font-family: var(--font-mono);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-scope {
  font-size: 9px;
  color: var(--text3);
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.cmd-preview-code {
  padding: 8px 14px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text2);
  background: #0a0c10;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-prompt {
  color: var(--accent);
  flex-shrink: 0;
}

/* Error */
.form-error {
  margin: 10px 24px 0;
  font-size: 11px;
  color: var(--red);
  background: var(--red-bg);
  border: 1px solid #4a1515;
  border-radius: var(--radius);
  padding: 8px 12px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border);
  margin-top: 16px;
  flex-shrink: 0;
}

.modal-btn {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s;
}

.modal-btn:hover {
  border-color: var(--border2);
  color: var(--text);
  background: var(--bg4);
}

.modal-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.modal-btn.primary:hover {
  background: var(--accent2);
  border-color: var(--accent2);
}

.modal-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile */
@media (max-width: 767px) {
  .qcf-modal {
    max-width: 100%;
    margin: 0;
    max-height: 92vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .form-row-2 {
    grid-template-columns: 80px 1fr;
  }

  .scope-toggle {
    flex-direction: column;
  }

  .scope-opt {
    flex-direction: row;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .modal-btn {
    width: 100%;
    text-align: center;
    padding: 10px;
  }

  .preview-scope {
    text-align: right;
  }
}
</style>
