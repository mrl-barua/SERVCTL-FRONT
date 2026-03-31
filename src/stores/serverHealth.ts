import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/http'
import { useToastStore } from './toast'

export interface HealthSnapshot {
  id: number
  serverId: number
  cpuPercent: number
  memPercent: number
  diskPercent: number
  memTotalMb: number
  memUsedMb: number
  diskTotalGb: number
  diskUsedGb: number
  loadAvg1?: number
  loadAvg5?: number
  loadAvg15?: number
  createdAt: string
}

interface AlertRule {
  id: number
  metric: string
  threshold: number
  direction: 'above' | 'below'
  serverId?: number
  createdAt: string
}

export const useServerHealthStore = defineStore('serverHealth', () => {
  const toastStore = useToastStore()

  const snapshots = ref<Record<number, HealthSnapshot[]>>({})
  const currentHealth = ref<Record<number, HealthSnapshot>>({})
  const alerts = ref<AlertRule[]>([])
  const subscribedServers = ref<Set<number>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCurrentHealth(serverId: number) {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get(`/server-health/${serverId}/current`)
      currentHealth.value[serverId] = data
      return data as HealthSnapshot
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      // 404 means no data yet — not a real error worth toasting
      if (err?.response?.status !== 404) {
        toastStore.showToast('Failed to fetch server health', 'error')
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchHealthHistory(serverId: number, limit = 60) {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get(`/server-health/${serverId}/history`, {
        params: { limit },
      })
      snapshots.value[serverId] = data
      return data as HealthSnapshot[]
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      toastStore.showToast('Failed to fetch health history', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function triggerCollect(serverId: number) {
    error.value = null
    try {
      const { data } = await apiClient.post(`/server-health/${serverId}/collect`)
      // Backend returns { snapshot, triggeredAlerts } — extract the snapshot
      const snapshot: HealthSnapshot = data.snapshot ?? data
      currentHealth.value[serverId] = snapshot
      toastStore.showToast('Health data collected', 'success')
      return snapshot
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      toastStore.showToast('Failed to collect health data', 'error')
      throw err
    }
  }

  async function fetchAlerts() {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get('/server-health/alerts')
      alerts.value = data
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      toastStore.showToast('Failed to fetch alerts', 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAlert(dto: { metric: string; threshold: number; direction: string; serverId?: number }) {
    error.value = null
    try {
      const { data } = await apiClient.post('/server-health/alerts', dto)
      alerts.value.push(data)
      toastStore.showToast('Alert rule created', 'success')
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      toastStore.showToast('Failed to create alert', 'error')
      throw err
    }
  }

  async function deleteAlert(id: number) {
    error.value = null
    try {
      await apiClient.delete(`/server-health/alerts/${id}`)
      const index = alerts.value.findIndex((a) => a.id === id)
      if (index > -1) {
        alerts.value.splice(index, 1)
      }
      toastStore.showToast('Alert rule deleted', 'success')
    } catch (err: any) {
      error.value = err?.response?.data?.message || err.message
      toastStore.showToast('Failed to delete alert', 'error')
      throw err
    }
  }

  return {
    snapshots,
    currentHealth,
    alerts,
    subscribedServers,
    loading,
    error,
    fetchCurrentHealth,
    fetchHealthHistory,
    triggerCollect,
    fetchAlerts,
    createAlert,
    deleteAlert,
  }
})
