<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div :class="['stat-value', color]">{{ value }}</div>
    <div v-if="subLabel" class="stat-sub">{{ subLabel }}</div>
    <div v-if="progress !== null" class="stat-bar">
      <div
        :class="['stat-bar-fill', progressColor || color]"
        :style="{ width: `${safeProgress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const { progress } = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  color: {
    type: String,
    default: "", // 'green' | 'red' | 'yellow' | ''
  },
  subLabel: {
    type: String,
    default: "",
  },
  progress: {
    type: Number,
    default: null,
  },
  progressColor: {
    type: String,
    default: "",
  },
});

const safeProgress = computed(() => {
  if (progress === null || progress === undefined) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(progress) || 0));
});
</script>

<style scoped>
.stat-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}

.stat-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.stat-value::before,
.stat-value::after {
  display: none !important;
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

.stat-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 5px;
  font-family: var(--font-mono);
}

.stat-bar {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.stat-bar-fill.green {
  background: var(--green);
}

.stat-bar-fill.red {
  background: var(--red);
}

.stat-bar-fill.yellow {
  background: var(--yellow);
}

.stat-bar-fill:not(.green):not(.red):not(.yellow) {
  background: var(--text);
}
</style>
