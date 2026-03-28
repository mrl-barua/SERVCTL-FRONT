<template>
  <div>
    <div v-if="deployableServers.length === 0" class="empty-state">
      No servers with deploy scripts. Add one when creating a server.
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
  font-size: 12px;
}
</style>
