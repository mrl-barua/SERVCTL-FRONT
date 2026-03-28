<template>
  <div>
    <div class="stats-row">
      <StatCard label="total servers" :value="serversStore.totalServers" />
      <StatCard
        label="online"
        :value="serversStore.onlineServers"
        color="green"
      />
      <StatCard
        label="offline"
        :value="serversStore.offlineServers"
        color="red"
      />
      <StatCard
        label="unknown"
        :value="serversStore.unknownServers"
        color="yellow"
      />
    </div>

    <ServerGrid />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useServersStore } from "../stores/servers";
import StatCard from "../components/servers/StatCard.vue";
import ServerGrid from "../components/servers/ServerGrid.vue";

const serversStore = useServersStore();

onMounted(async () => {
  if (serversStore.servers.length === 0) {
    await serversStore.fetchServers();
  }
});
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}
</style>
