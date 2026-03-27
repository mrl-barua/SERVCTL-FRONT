<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div v-for="toast in toastStore.toasts" :key="toast.id" :class="['app-toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 500;
  pointer-events: none;
}

.app-toast {
  background: var(--bg2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 8px;
  font-size: 11px;
  font-family: var(--font-mono);
  pointer-events: auto;
  animation: toast-slide-in 0.3s ease-out;
}

.app-toast.toast-success {
  background: var(--green-bg);
  border-color: #0d4030;
  color: var(--green);
}

.app-toast.toast-error {
  background: var(--red-bg);
  border-color: #4a1515;
  color: var(--red);
}

.app-toast.toast-warning {
  background: var(--yellow-bg);
  border-color: #3a2a0a;
  color: var(--yellow);
}

.app-toast.toast-info {
  background: var(--test-bg);
  border-color: var(--accent2);
  color: var(--accent);
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(400px) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(400px) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>
