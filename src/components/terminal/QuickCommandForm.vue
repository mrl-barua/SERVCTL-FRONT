<template>
  <div class="modal-overlay open" @click.self="$emit('cancel')">
    <div class="modal qcf-modal">
      <h2 class="modal-title">
        {{ isEdit ? "Edit Quick Command" : "New Quick Command" }}
      </h2>

      <div class="form-row-2">
        <div>
          <label class="form-label">icon (emoji)</label>
          <input
            v-model="form.icon"
            class="form-input icon-input"
            placeholder="⚡"
            maxlength="4"
          />
        </div>
        <div class="label-col">
          <label class="form-label">label</label>
          <input
            v-model="form.label"
            class="form-input"
            placeholder="disk usage"
            maxlength="40"
          />
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">command</label>
        <input
          v-model="form.command"
          class="form-input"
          placeholder="df -h"
          :disabled="isEdit && command?.isSystem"
          maxlength="500"
        />
        <span v-if="isEdit && command?.isSystem" class="form-hint">
          System command text cannot be modified.
        </span>
      </div>

      <div class="form-row">
        <label class="form-label">applies to</label>

        <div class="scope-toggle">
          <button
            type="button"
            class="scope-opt"
            :class="{ active: form.scope === 'all' }"
            @click="setAllScope"
          >
            <span class="scope-opt-icon">🌐</span>
            <div>
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
            <div>
              <div class="scope-opt-title">Specific Server</div>
              <div class="scope-opt-sub">
                Only appears when that server is selected
              </div>
            </div>
          </button>
        </div>
      </div>

      <div v-if="form.scope === 'server'" class="form-row">
        <label class="form-label">server</label>
        <select v-model.number="form.serverId" class="form-select">
          <option :value="0" disabled>- select a server -</option>
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

        <div v-if="selectedServer" class="server-preview">
          <span class="s-dot" :class="selectedServer.status"></span>
          {{ selectedServer.name }}
          <span class="env-badge" :class="`badge-${selectedServer.env}`">
            {{ selectedServer.env }}
          </span>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">preview</label>
        <div class="cmd-preview">
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
        <div class="cmd-preview-code">$ {{ form.command || "echo hello" }}</div>
      </div>

      <div v-if="error" class="form-error">✗ {{ error }}</div>

      <div class="modal-actions">
        <button class="modal-btn" @click="$emit('cancel')">Cancel</button>
        <button
          class="modal-btn primary"
          :disabled="saving"
          @click="handleSubmit"
        >
          {{ saving ? "Saving..." : isEdit ? "Save Changes" : "Add Command" }}
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
.qcf-modal {
  width: min(700px, 90vw);
}

.form-row-2 {
  display: flex;
  gap: 10px;
}

.label-col {
  flex: 3;
}

.icon-input {
  width: 90px;
}

.scope-toggle {
  display: flex;
  gap: 8px;
}

.scope-opt {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
  font-family: var(--font-mono);
}

.scope-opt.active {
  border-color: var(--accent);
  background: #0d1a2b;
  color: var(--text);
}

.scope-opt-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.scope-opt-title {
  font-size: 12px;
  font-weight: 500;
}

.scope-opt-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
}

.server-preview {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text2);
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 3px 12px;
}

.s-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text3);
}

.s-dot.online {
  background: var(--green);
}

.s-dot.offline {
  background: var(--red);
}

.s-dot.unknown {
  background: var(--yellow);
}

.cmd-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: 12px;
}

.preview-icon {
  font-size: 15px;
}

.preview-label {
  color: var(--text);
  font-weight: 500;
}

.preview-scope {
  margin-left: auto;
  font-size: 10px;
  color: var(--text3);
}

.cmd-preview-code {
  margin-top: 6px;
  font-size: 11px;
  color: var(--green);
  font-family: var(--font-mono);
  padding: 6px 12px;
  background: #0a0c10;
  border-radius: var(--radius);
}

.form-error {
  font-size: 11px;
  color: var(--red);
  background: var(--red-bg);
  border: 1px solid #4a1515;
  border-radius: var(--radius);
  padding: 8px 12px;
  margin-top: 4px;
}

.form-hint {
  font-size: 10px;
  color: var(--text3);
  margin-top: 4px;
  display: block;
}

@media (max-width: 767px) {
  .qcf-modal {
    width: calc(100% - 24px);
    max-width: 100%;
    margin: 12px;
    padding: 18px 16px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .scope-toggle {
    flex-direction: column;
    gap: 8px;
  }

  .scope-opt {
    flex-direction: row;
    align-items: center;
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
  }

  .cmd-preview {
    flex-wrap: wrap;
    gap: 6px;
  }

  .preview-scope {
    margin-left: 0;
    width: 100%;
    font-size: 9px;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .modal-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
