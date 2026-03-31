<template>
  <div class="topbar">
    <button
      v-if="isMobile"
      class="menu-toggle"
      @click="$emit('toggle-sidebar')"
    >
      ☰
    </button>

    <div class="topbar-title">{{ routeTitle }}</div>
    <div class="topbar-actions">
      <button class="tb-btn ping-btn" @click="handlePingAll">
        <span>ping all</span>
      </button>
      <button class="tb-btn primary" @click="openAddModal">+ add server</button>
      <button class="tb-btn" @click="handleLogout">logout</button>
    </div>

    <AddServerModal
      v-if="showModal"
      @close="closeAddModal"
      @add="handleAddServer"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServersStore } from "../../stores/servers";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";
import AddServerModal from "../servers/AddServerModal.vue";

defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-sidebar"]);

const route = useRoute();
const router = useRouter();
const serversStore = useServersStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const showModal = ref(false);

const routeTitles = {
  overview: "Overview",
  terminal: "Terminal",
  deploy: "Deploy",
  logs: "Logs",
  keys: "SSH Key Vault",
  health: "Server Health",
};

const routeTitle = computed(() => {
  const name = route.name || "overview";
  return routeTitles[name] || "Overview";
});

async function handlePingAll() {
  try {
    await serversStore.pingAll();
    toastStore.showToast("Status updates completed", "success");
  } catch {
    toastStore.showToast("Failed to update server status", "error");
  }
}

function openAddModal() {
  showModal.value = true;
}

function closeAddModal() {
  showModal.value = false;
}

async function handleAddServer(serverData) {
  try {
    await serversStore.addServer(serverData);
    closeAddModal();
    toastStore.showToast(`Server "${serverData.name}" added`, "success");
  } catch (error) {
    const message = error?.response?.data?.message || "Failed to add server";
    toastStore.showToast(
      Array.isArray(message) ? message.join(", ") : message,
      "error",
    );
  }
}

function handleLogout() {
  authStore.logout();
  router.push({ name: "login" });
}
</script>

<style scoped>
.topbar {
  height: 52px;
  flex-shrink: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.topbar-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.topbar-actions {
  display: flex;
  gap: 8px;
}

.menu-toggle {
  display: none;
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

.tb-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.tb-btn.primary:hover {
  background: var(--accent2);
  border-color: var(--accent2);
}

@media (max-width: 767px) {
  .topbar {
    height: auto;
    min-height: 52px;
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius);
    border: 1px solid var(--border2);
    background: var(--bg3);
    color: var(--text2);
    cursor: pointer;
    flex-shrink: 0;
    font-size: 16px;
  }

  .topbar-title {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .topbar-actions {
    flex-shrink: 0;
    display: flex;
    gap: 6px;
  }

  .tb-btn:not(.primary) {
    padding: 5px 8px;
    font-size: 10px;
  }

  .tb-btn.ping-btn::after {
    content: "⟳";
  }

  .tb-btn.ping-btn span {
    display: none;
  }
}
</style>
