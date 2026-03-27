<template>
  <div class="layout">
    <AppSidebar />
    <div class="main">
      <AppTopbar />
      <div class="content">
        <RouterView />
      </div>
    </div>
    <AppToast />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import AppToast from './components/AppToast.vue'
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
</style>
