<template>
  <div v-for="env in envOrder" :key="env">
    <template v-if="serversInEnv[env].length > 0">
      <div class="section-header">
        <span class="section-title">{{ envLabels[env] }}</span>
        <span class="section-line"></span>
      </div>
      <div class="server-grid">
        <ServerCard v-for="server in serversInEnv[env]" :key="server.id" :server="server" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useServersStore } from '../../stores/servers'
import ServerCard from './ServerCard.vue'

const serversStore = useServersStore()

const envOrder = ['prod', 'live', 'qa', 'test']
const envLabels = {
  prod: 'Production',
  live: 'Live',
  qa: 'QA',
  test: 'Testing',
}

const serversInEnv = computed(() => {
  return {
    prod: serversStore.serversByEnv.prod,
    live: serversStore.serversByEnv.live,
    qa: serversStore.serversByEnv.qa,
    test: serversStore.serversByEnv.test,
  }
})
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 4px;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}
</style>
