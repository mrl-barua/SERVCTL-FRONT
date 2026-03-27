import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEPLOY_STEPS = [
  'pulling latest code',
  'installing dependencies',
  'running migrations',
  'building assets',
  'restarting services',
]

export const useDeployStore = defineStore('deploy', () => {
  const deployStates = ref({})

  function initServer(serverId) {
    if (!deployStates.value[serverId]) {
      deployStates.value[serverId] = {
        status: 'idle',
        progress: 0,
        step: -1,
      }
    }
  }

  function getDeployState(serverId) {
    if (!deployStates.value[serverId]) {
      initServer(serverId)
    }
    return deployStates.value[serverId]
  }

  function startDeploy(serverId) {
    const state = getDeployState(serverId)
    if (state.status === 'running') return

    state.status = 'running'
    state.progress = 0
    state.step = 0
    runNextStep(serverId)
  }

  function runNextStep(serverId) {
    const state = getDeployState(serverId)

    if (!state || state.status !== 'running') return

    if (state.step >= DEPLOY_STEPS.length) {
      state.status = 'done'
      state.progress = 100
      return
    }

    state.progress = Math.round((state.step / DEPLOY_STEPS.length) * 100)

    setTimeout(() => {
      state.step++
      runNextStep(serverId)
    }, 900 + Math.random() * 700)
  }

  function stopDeploy(serverId) {
    const state = getDeployState(serverId)
    state.status = 'failed'
    state.step = -1
  }

  function resetDeploy(serverId) {
    const state = getDeployState(serverId)
    state.status = 'idle'
    state.progress = 0
    state.step = -1
  }

  return {
    deployStates,
    DEPLOY_STEPS,
    initServer,
    getDeployState,
    startDeploy,
    stopDeploy,
    resetDeploy,
  }
})
