<template>
  <div class="bulk-bar">
    <span class="bulk-count">{{ selectedCount }} selected</span>

    <button class="bulk-btn ping" @click="$emit('ping')">
      Ping Selected
    </button>

    <button class="bulk-btn delete" @click="$emit('delete')">
      Delete Selected
    </button>

    <button class="bulk-btn clear" @click="$emit('clear-selection')">
      Clear
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
  selectedIds: number[]
}>()

defineEmits<{
  ping: []
  delete: []
  'clear-selection': []
}>()
</script>

<style scoped>
.bulk-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
}

.bulk-count {
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
  margin-right: auto;
}

.bulk-btn {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg4);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.bulk-btn:hover {
  color: var(--text);
}

.bulk-btn.ping {
  border-color: var(--accent2);
  color: var(--accent);
}

.bulk-btn.ping:hover {
  background: #0d1a2b;
}

.bulk-btn.delete {
  border-color: #4a1515;
  color: var(--red);
}

.bulk-btn.delete:hover {
  background: var(--red-bg);
}

.bulk-btn.clear {
  border-color: var(--border2);
  color: var(--text3);
}

.bulk-btn.clear:hover {
  color: var(--text2);
}

@media (max-width: 767px) {
  .bulk-bar {
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 10px;
  }

  .bulk-count {
    width: 100%;
    font-size: 11px;
  }

  .bulk-btn {
    font-size: 10px;
    padding: 4px 10px;
  }
}
</style>
