<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div :class="['stat-value', colorClass]">{{ value }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  color: {
    type: String,
    default: null, // null, 'green', 'red', 'yellow'
  },
})

const colorClass = props.color ? props.color : ''
</script>

<style scoped>
.stat-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}

.stat-label {
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.stat-value.green {
  color: var(--green);
}

.stat-value.red {
  color: var(--red);
}

.stat-value.yellow {
  color: var(--yellow);
}
</style>
