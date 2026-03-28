<template>
  <div>
    <div v-if="deployableServers.length === 0" class="empty-state-card">
      <div class="es-icon">↑</div>
      <div class="es-title">No deploy scripts configured</div>
      <div class="es-body">
        Add a deploy command to a server to enable one-click deployments with
        real-time step tracking.
      </div>

      <div class="es-hint">
        When adding or editing a server, fill in the
        <strong>Deploy script</strong> field:
        <code>./deploy.sh production</code>
        <code>make deploy</code>
        <code>npm run deploy</code>
      </div>

      <button class="btn-secondary es-cta" @click="$router.push('/')">
        ← Go to Overview
      </button>
    </div>

    <div v-else class="deploy-grid">
      <DeployCard
        v-for="server in deployableServers"
        :key="server.id"
        :server="server"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from "vue";
import { useServersStore } from "../stores/servers";
import { useDeployStore } from "../stores/deploy";
import DeployCard from "../components/deploy/DeployCard.vue";

const serversStore = useServersStore();
const deployStore = useDeployStore();

const deployableServers = computed(() => {
  return serversStore.servers.filter((s) => s.deploy);
});

watch(
  () => deployableServers.value,
  async (servers) => {
    for (const server of servers) {
      await deployStore.refreshStatus(server.id);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  deployStore.disconnectSocket();
});
</script>

<style scoped>
.deploy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.empty-state-card {
  max-width: 520px;
  margin: 40px auto;
  text-align: center;
  padding: 32px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.es-icon {
  font-size: 36px;
  margin-bottom: 14px;
}

.es-title {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--text);
  margin-bottom: 8px;
}

.es-body {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.7;
  margin-bottom: 24px;
}

.es-hint {
  font-size: 11px;
  color: var(--text2);
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  text-align: left;
  margin-bottom: 20px;
  line-height: 1.8;
}

.es-hint strong {
  color: var(--text);
}

.es-hint code {
  display: block;
  color: var(--green);
  font-size: 11px;
  margin-top: 4px;
}

.es-cta {
  margin-top: 4px;
}
</style>
