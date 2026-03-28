<template>
  <div v-if="visible" :class="['network-banner', modeClass]">
    <template v-if="appStore.deployMode === 'cloud'">
      <div class="banner-text">
        <span class="banner-title"
          >You are using SERVCTL Cloud · Public servers only</span
        >
        <span class="banner-subtitle">
          Private networks (192.168.x.x, 10.x.x.x) require a local install.
        </span>
      </div>
      <div class="banner-actions">
        <RouterLink to="/install" class="banner-link"
          >How to self-host -></RouterLink
        >
        <button class="dismiss-btn" @click="dismissCloud">x</button>
      </div>
    </template>

    <template v-else>
      <div class="banner-title">
        Running in local mode · Private networks supported
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAppStore } from "../stores/app";

const CLOUD_DISMISS_KEY = "servctl_cloud_banner_dismissed";
const appStore = useAppStore();
const visible = ref(false);

const modeClass = computed(() =>
  appStore.deployMode === "cloud" ? "cloud" : "local",
);

function dismissCloud() {
  visible.value = false;
  sessionStorage.setItem(CLOUD_DISMISS_KEY, "1");
}

onMounted(() => {
  if (appStore.deployMode === "cloud") {
    visible.value = sessionStorage.getItem(CLOUD_DISMISS_KEY) !== "1";
    return;
  }

  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, 4000);
});

watch(
  () => appStore.deployMode,
  (mode) => {
    if (mode === "cloud") {
      visible.value = sessionStorage.getItem(CLOUD_DISMISS_KEY) !== "1";
      return;
    }

    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 4000);
  },
);
</script>

<style scoped>
.network-banner {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid;
  z-index: 40;
}

.network-banner.cloud {
  background: #0d1a2b;
  border-bottom-color: var(--accent2);
  color: var(--text2);
}

.network-banner.local {
  background: var(--green-bg);
  border-bottom-color: #0d4030;
  color: var(--green);
}

.banner-text {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.banner-title {
  color: inherit;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.banner-subtitle {
  color: var(--text3);
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-link {
  color: var(--accent);
  text-decoration: none;
}

.banner-link:hover {
  text-decoration: underline;
}

.dismiss-btn {
  border: none;
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1;
}

.dismiss-btn:hover {
  color: var(--text2);
}
</style>
