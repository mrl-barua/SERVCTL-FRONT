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
        :class="{
          'mobile-open': sidebarOpen && isMobile,
          collapsed: sidebarCollapsed && !isMobile,
        }"
        :style="sidebarStyle"
        :collapsed="sidebarCollapsed && !isMobile"
        @toggle-collapse="toggleCollapse"
      />

      <div
        v-if="!isMobile && !sidebarCollapsed"
        class="sidebar-resize-handle"
        :class="{ active: resizing }"
        @mousedown="startResize"
      ></div>

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
const resizing = ref(false);

const sidebarCollapsed = ref(
  localStorage.getItem("servctl_sidebar_collapsed") === "true",
);
const sidebarWidth = ref(
  Math.min(
    400,
    Math.max(180, parseInt(localStorage.getItem("servctl_sidebar_width") || "220", 10)),
  ),
);

const showDashboardLayout = computed(() => Boolean(route.meta.requiresAuth));

const sidebarStyle = computed(() => {
  if (isMobile.value) return {};
  if (sidebarCollapsed.value) return { width: "48px" };
  return { width: sidebarWidth.value + "px" };
});

function toggleCollapse() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem(
    "servctl_sidebar_collapsed",
    String(sidebarCollapsed.value),
  );
}

function startResize(e) {
  e.preventDefault();
  resizing.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  function onMouseMove(ev) {
    const newWidth = Math.min(400, Math.max(180, ev.clientX));
    sidebarWidth.value = newWidth;
  }

  function onMouseUp() {
    resizing.value = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    localStorage.setItem("servctl_sidebar_width", String(sidebarWidth.value));
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

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
  min-width: 0;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.sidebar {
  transition: width 0.2s ease;
}

.sidebar-resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.15s;
  flex-shrink: 0;
}

.sidebar-resize-handle:hover,
.sidebar-resize-handle.active {
  background: var(--accent);
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
    width: 260px !important;
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
