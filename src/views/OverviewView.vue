<template>
  <div>
    <div class="stats-row">
      <StatCard
        label="total servers"
        :value="totalCount"
        :sub-label="`across ${environmentCount} environments`"
      />
      <StatCard
        label="online"
        :value="onlineCount"
        color="green"
        :sub-label="`${onlinePercent}% of fleet`"
        :progress="onlinePercent"
      />
      <StatCard
        label="offline"
        :value="offlineCount"
        color="red"
        :sub-label="
          offlineCount === 0 ? 'all clear' : `${offlineCount} need attention`
        "
        :progress="offlineProgress"
        :progress-color="offlineCount === 0 ? 'green' : 'red'"
      />
      <StatCard
        label="unknown"
        :value="unknownCount"
        color="yellow"
        :sub-label="unknownCount === 0 ? 'all resolved' : 'ping to resolve'"
        :progress="unknownPercent"
      />
    </div>

    <div class="overview-toolbar">
      <button class="toolbar-btn" @click="showTagManager = true">
        🏷 Manage Tags
      </button>
      <button class="toolbar-btn" @click="showGroupManager = true">
        📂 Manage Groups
      </button>
    </div>

    <ServerGrid />

    <TagManager v-model="showTagManager" />
    <GroupManager v-model="showGroupManager" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useServersStore } from "../stores/servers";
import StatCard from "../components/servers/StatCard.vue";
import ServerGrid from "../components/servers/ServerGrid.vue";
import TagManager from "../components/servers/TagManager.vue";
import GroupManager from "../components/servers/GroupManager.vue";

const showTagManager = ref(false);
const showGroupManager = ref(false);

const serversStore = useServersStore();

const totalCount = computed(() => Number(serversStore.totalServers) || 0);
const onlineCount = computed(() => Number(serversStore.onlineServers) || 0);
const offlineCount = computed(() => Number(serversStore.offlineServers) || 0);
const unknownCount = computed(() => Number(serversStore.unknownServers) || 0);

const environmentCount = computed(
  () => new Set(serversStore.servers.map((server) => server.env)).size,
);

const percentOf = (count, total) => {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
};

const onlinePercent = computed(() =>
  percentOf(onlineCount.value, totalCount.value),
);
const offlinePercent = computed(() =>
  percentOf(offlineCount.value, totalCount.value),
);
const unknownPercent = computed(() =>
  percentOf(unknownCount.value, totalCount.value),
);
const offlineProgress = computed(() =>
  offlineCount.value === 0 ? 100 : offlinePercent.value,
);

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

.overview-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.toolbar-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 5px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toolbar-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
