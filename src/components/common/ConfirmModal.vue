<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-overlay">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <span class="danger-icon">⚠</span>
        </div>

        <div class="confirm-title">{{ title }}</div>
        <div class="confirm-body">{{ message }}</div>

        <div v-if="serverName" class="confirm-server-name">
          "{{ serverName }}"
        </div>

        <div class="confirm-actions">
          <button
            class="confirm-btn cancel"
            @click="$emit('update:modelValue', false)"
          >
            Cancel
          </button>
          <button
            class="confirm-btn danger"
            :disabled="loading"
            @click="handleConfirm"
          >
            {{ loading ? "Deleting..." : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: "Are you sure?" },
  message: { type: String, default: "This action cannot be undone." },
  serverName: { type: String, default: "" },
  confirmLabel: { type: String, default: "Delete" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

function handleConfirm() {
  emit("confirm");
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  animation: confirmIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes confirmIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.danger-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 12px;
  color: var(--red);
}

.confirm-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.confirm-body {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 8px;
}

.confirm-server-name {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--red);
  background: var(--red-bg);
  border: 1px solid #4a1515;
  border-radius: var(--radius);
  padding: 6px 12px;
  margin-bottom: 20px;
  display: inline-block;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.confirm-btn {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 20px;
  border-radius: var(--radius);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.12s;
  flex: 1;
}

.confirm-btn.cancel {
  background: var(--bg3);
  border-color: var(--border2);
  color: var(--text2);
}

.confirm-btn.cancel:hover {
  color: var(--text);
  border-color: var(--border2);
}

.confirm-btn.danger {
  background: var(--red-bg);
  border-color: #4a1515;
  color: var(--red);
}

.confirm-btn.danger:hover:not(:disabled) {
  background: #3a0e0e;
}

.confirm-btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
