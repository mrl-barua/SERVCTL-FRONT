import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function showToast(message, type = 'info', duration = 3000) {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
    }

    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
  }
})
