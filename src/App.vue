<template>
  <div>
    <NetworkModeBanner />
    <div v-if="showDashboardLayout" class="layout">
      <div
        class="sidebar-backdrop"
        :class="{ visible: sidebarOpen && isMobile }"
        @click="sidebarOpen = false"
      ></div>

      <AppSidebar
        class="sidebar"
        :class="{ 'mobile-open': sidebarOpen && isMobile }"
      />

      <div class="main">
        <AppTopbar
          :is-mobile="isMobile"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
        <div class="content">
          <RouterView />
        </div>
      </div>
    </div>
    <RouterView v-else />
    <AppToast />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterView, useRoute } from "vue-router";
import NetworkModeBanner from "./components/NetworkModeBanner.vue";
import AppSidebar from "./components/layout/AppSidebar.vue";
import AppTopbar from "./components/layout/AppTopbar.vue";
import AppToast from "./components/AppToast.vue";

const route = useRoute();
const isMobile = ref(window.innerWidth < 768);
const sidebarOpen = ref(false);

const showDashboardLayout = computed(() => Boolean(route.meta.requiresAuth));

function handleResize() {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 767px) {
  .layout {
    display: block;
    position: relative;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 200;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
  }

  .sidebar-backdrop.visible {
    display: block;
  }

  .main {
    width: 100%;
    min-height: 100vh;
  }
}
</style>
