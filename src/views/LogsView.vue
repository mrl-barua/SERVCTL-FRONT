<template>
  <div class="logs-view">
    <LogViewer />
  </div>
</template>

<script setup>
import LogViewer from "../components/logs/LogViewer.vue";
</script>

<style scoped>
.logs-view :deep(.log-entry) {
  padding: 2px 8px;
}

.logs-view :deep(.log-entry:hover) {
  background: var(--bg3);
  border-radius: var(--radius);
}

.logs-view :deep(.log-entry:hover .log-msg) {
  color: var(--text);
}

.logs-view :deep(.log-entry:nth-child(even)) {
  background: rgba(255, 255, 255, 0.015);
}

.logs-view :deep(.log-level) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 1px 7px;
  border-radius: 99px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.logs-view :deep(.log-level.INFO) {
  background: #0d1a2b;
  color: var(--accent);
  border: 1px solid var(--accent2);
}

.logs-view :deep(.log-level.WARN) {
  background: var(--yellow-bg);
  color: var(--yellow);
  border: 1px solid #3a2a0a;
}

.logs-view :deep(.log-level.ERROR) {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid #4a1515;
}

.logs-view :deep(.log-level.DEBUG) {
  background: var(--bg4);
  color: var(--text3);
  border: 1px solid var(--border);
}

.logs-view :deep(.log-level.OK) {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid #0d4030;
}

.logs-view :deep(.log-entry:has(.log-level.ERROR)) {
  border-left: 2px solid var(--red);
  padding-left: 10px;
}

.logs-view :deep(.log-entry:has(.log-level.WARN)) {
  border-left: 2px solid var(--yellow);
  padding-left: 10px;
}

.logs-view :deep(.log-entry:nth-child(10n)) {
  border-bottom: 1px solid var(--border);
  margin-bottom: 2px;
  padding-bottom: 2px;
}
</style>
