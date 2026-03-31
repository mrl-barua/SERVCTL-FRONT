<template>
  <span
    class="tag-badge"
    :style="{
      color: tag.color,
      background: tag.color + '26',
      borderColor: tag.color + '4d',
    }"
  >
    {{ tag.name }}
    <button
      v-if="removable"
      class="tag-remove"
      :style="{ color: tag.color }"
      @click.stop="$emit('remove')"
    >
      x
    </button>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  tag: { name: string; color: string }
  removable?: boolean
}>()

defineEmits<{
  remove: []
}>()
</script>

<style scoped>
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;
}

.tag-remove {
  display: none;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.12s;
}

.tag-badge:hover .tag-remove {
  display: inline;
}

.tag-remove:hover {
  opacity: 1;
}
</style>
