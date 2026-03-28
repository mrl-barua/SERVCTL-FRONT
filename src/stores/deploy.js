import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/http'
import { createAuthenticatedSocket } from '../services/socket'
import { useAuthStore } from './auth'

const DEPLOY_STEPS = [
  'pulling latest code',
  'installing dependencies',
  'running migrations',
  'building assets',
  'restarting services',
]

export const useDeployStore = defineStore('deploy', () => {
  const authStore = useAuthStore()
  const deployStates = ref({})
  const deployHistory = ref({})
  const socketConnected = ref(false)
  let socket = null

  function initServer(serverId) {
    if (!deployStates.value[serverId]) {
      deployStates.value[serverId] = {
        status: 'idle',
        progress: 0,
        step: -1,
        updatedAt: null,
      }
    }

    if (!deployHistory.value[serverId]) {
      deployHistory.value[serverId] = []
    }
  }

  function getDeployState(serverId) {
    if (!deployStates.value[serverId]) {
      initServer(serverId)
    }
    return deployStates.value[serverId]
  }

  async function withAuthRetry(operation) {
    try {
      return await operation()
    } catch (error) {
      if (error?.response?.status === 401) {
        await authStore.refreshSession()
        return operation()
      }
      throw error
    }
  }

  function connectSocket() {
    if (socket) {
      return socket
    }

    socket = createAuthenticatedSocket('deploy')

    socket.on('connect', () => {
      socketConnected.value = true
    })

    socket.on('disconnect', () => {
      socketConnected.value = false
    })

    socket.on('deploy:progress', (payload) => {
      const state = getDeployState(payload.serverId)
      state.status = payload.status
      state.progress = payload.progress
      state.step = payload.step
      state.updatedAt = payload.updatedAt
    })

    return socket
  }

  function subscribe(serverId) {
    const activeSocket = connectSocket()
    activeSocket.emit('deploy:subscribe', { serverId })
  }

  async function refreshStatus(serverId) {
    const { data } = await withAuthRetry(() =>
      apiClient.get(`/deploy/${serverId}/status`),
    )

    const state = getDeployState(serverId)
    state.status = data.status
    state.progress = data.progress
    state.step = data.step
    state.updatedAt = data.updatedAt

    return state
  }

  async function loadHistory(serverId) {
    const { data } = await withAuthRetry(() =>
      apiClient.get(`/deploy/${serverId}/history`),
    )

    deployHistory.value[serverId] = data
    return data
  }

  async function startDeploy(serverId) {
    initServer(serverId)
    subscribe(serverId)

    const { data } = await withAuthRetry(() =>
      apiClient.post(`/deploy/${serverId}/start`),
    )

    const state = getDeployState(serverId)
    state.status = data.status
    state.progress = data.progress
    state.step = data.step
    state.updatedAt = data.updatedAt

    await loadHistory(serverId)
    return state
  }

  async function stopDeploy(serverId) {
    const { data } = await withAuthRetry(() =>
      apiClient.post(`/deploy/${serverId}/stop`),
    )

    const state = getDeployState(serverId)
    state.status = data.status
    state.progress = data.progress
    state.step = data.step
    state.updatedAt = data.updatedAt

    await loadHistory(serverId)
    return state
  }

  function resetDeploy(serverId) {
    const state = getDeployState(serverId)
    state.status = 'idle'
    state.progress = 0
    state.step = -1
    state.updatedAt = null
  }

  function disconnectSocket() {
    if (!socket) {
      return
    }

    socket.disconnect()
    socket = null
    socketConnected.value = false
  }

  return {
    deployStates,
    deployHistory,
    socketConnected,
    DEPLOY_STEPS,
    initServer,
    getDeployState,
    refreshStatus,
    loadHistory,
    startDeploy,
    stopDeploy,
    resetDeploy,
    subscribe,
    disconnectSocket,
  }
})
