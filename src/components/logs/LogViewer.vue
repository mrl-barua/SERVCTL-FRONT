<template>
  <div>
    <div class="log-toolbar">
      <select
        v-model="selectedServer"
        class="log-server-select"
        @change="applyFilters"
      >
        <option value="all">all servers</option>
        <option
          v-for="server in serversStore.servers"
          :key="server.id"
          :value="String(server.id)"
        >
          {{ server.name }}
        </option>
      </select>

      <select
        v-model="selectedLevel"
        class="log-level-select"
        @change="applyFilters"
      >
        <option value="all">all levels</option>
        <option value="INFO">INFO</option>
        <option value="WARN">WARN</option>
        <option value="ERROR">ERROR</option>
        <option value="DEBUG">DEBUG</option>
        <option value="OK">OK</option>
      </select>

      <input
        v-model="searchText"
        class="log-search"
        placeholder="search logs…"
        @input="applyFilters"
      />

      <button class="tb-btn" @click="handleRefresh">refresh</button>
      <button
        :class="['tb-btn', { active: logsStore.tailMode }]"
        @click="toggleTailMode"
      >
        {{ logsStore.tailMode ? "tail: on" : "tail: off" }}
      </button>
    </div>

    <div class="log-container" ref="containerRef">
      <div v-if="filteredEntries.length === 0" class="empty-state">
        No logs found
      </div>
      <div v-for="entry in filteredEntries" :key="entry.id" class="log-entry">
        <span class="log-ts">{{ formatTimestamp(entry.timestamp) }}</span>
        <span :class="['log-level', entry.level]">{{ entry.level }}</span>
        <span class="log-msg"
          >[{{ entry.serverName }}] {{ entry.message }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
  onMounted,
} from "vue";
import { useLogsStore } from "../../stores/logs";
import { useServersStore } from "../../stores/servers";

const logsStore = useLogsStore();
const serversStore = useServersStore();

const selectedServer = ref("all");
const selectedLevel = ref("all");
const searchText = ref("");
const containerRef = ref(null);

onMounted(async () => {
  if (serversStore.servers.length > 0) {
    const defaultServerId = Number(
      selectedServer.value === "all"
        ? serversStore.servers[0].id
        : selectedServer.value,
    );
    selectedServer.value = String(defaultServerId);
    await logsStore.fetchLogs(defaultServerId);
  }
});

watch(
  () => serversStore.servers,
  async (servers) => {
    if (selectedServer.value === "all" && servers.length > 0) {
      selectedServer.value = String(servers[0].id);
      await logsStore.fetchLogs(servers[0].id);
    }
  },
  { deep: true, immediate: true },
);

const filteredEntries = computed(() => {
  return logsStore.entries.filter((entry) => {
    const matchServer =
      selectedServer.value === "all" ||
      entry.serverId === parseInt(selectedServer.value);
    const matchLevel =
      selectedLevel.value === "all" || entry.level === selectedLevel.value;
    const matchSearch =
      !searchText.value ||
      entry.message.toLowerCase().includes(searchText.value.toLowerCase()) ||
      entry.serverName.toLowerCase().includes(searchText.value.toLowerCase());
    return matchServer && matchLevel && matchSearch;
  });
});

watch(
  () => filteredEntries.value.length,
  () => {
    nextTick(() => {
      if (containerRef.value && logsStore.tailMode) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
      }
    });
  },
);

function formatTimestamp(date) {
  return new Date(date).toISOString().replace("T", " ").slice(0, 19);
}

function applyFilters() {
  // Filters are applied reactively via computed property
}

function handleRefresh() {
  if (selectedServer.value === "all") {
    return;
  }

  logsStore.fetchLogs(parseInt(selectedServer.value, 10), {
    level: selectedLevel.value,
    search: searchText.value,
  });
}

function toggleTailMode() {
  if (selectedServer.value === "all") {
    return;
  }

  const serverId = parseInt(selectedServer.value, 10);

  if (logsStore.tailMode) {
    logsStore.stopTail();
  } else {
    logsStore.startTail(serverId);
  }
}

watch(
  () => selectedServer.value,
  async (value) => {
    if (value === "all") {
      logsStore.stopTail();
      return;
    }

    const serverId = parseInt(value, 10);
    await logsStore.fetchLogs(serverId, {
      level: selectedLevel.value,
      search: searchText.value,
    });

    if (logsStore.tailMode) {
      logsStore.startTail(serverId);
    }
  },
);

onBeforeUnmount(() => {
  logsStore.stopTail();
  logsStore.disconnectSocket();
});
</script>

<style scoped>
.log-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.log-server-select,
.log-level-select {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 5px 10px;
  border-radius: var(--radius);
  cursor: pointer;
}

.log-search {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg2);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 5px 12px;
  border-radius: var(--radius);
  min-width: 140px;
}

.log-search:focus {
  outline: none;
  border-color: var(--accent);
}

.tb-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.1s;
}

.tb-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tb-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.log-container {
  background: #0a0c10;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  max-height: 480px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.9;
}

.log-entry {
  display: flex;
  gap: 12px;
}

.log-ts {
  color: var(--text3);
  flex-shrink: 0;
  min-width: 140px;
}

.log-level {
  flex-shrink: 0;
  min-width: 52px;
  font-weight: 500;
}

.log-level.INFO {
  color: var(--accent);
}

.log-level.WARN {
  color: var(--yellow);
}

.log-level.ERROR {
  color: var(--red);
}

.log-level.DEBUG {
  color: var(--text3);
}

.log-level.OK {
  color: var(--green);
}

.log-msg {
  color: var(--text2);
  flex: 1;
}

.log-entry:hover .log-msg {
  color: var(--text);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text3);
  font-size: 12px;
}
</style>
