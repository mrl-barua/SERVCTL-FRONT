<template>
  <div class="gauge-card">
    <svg viewBox="0 0 120 120" class="gauge-svg">
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        :stroke="'var(--bg4)'"
        stroke-width="8"
      />
      <!-- Foreground arc -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        :stroke="gaugeColor"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
        class="gauge-arc"
      />
      <!-- Center value -->
      <text
        x="60"
        y="58"
        text-anchor="middle"
        dominant-baseline="middle"
        class="gauge-value"
        :fill="'var(--text)'"
      >
        {{ Math.round(value) }}%
      </text>
    </svg>
    <div class="gauge-label">{{ label }}</div>
    <div v-if="subLabel" class="gauge-sub-label">{{ subLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    label: string
    color?: string
    thresholdWarn?: number
    thresholdCrit?: number
    subLabel?: string
  }>(),
  {
    thresholdWarn: 70,
    thresholdCrit: 90,
  },
)

const circumference = 2 * Math.PI * 50 // ~314.16

const dashOffset = computed(() => {
  const clamped = Math.max(0, Math.min(100, props.value))
  return circumference * (1 - clamped / 100)
})

const gaugeColor = computed(() => {
  if (props.color) return props.color
  if (props.value >= props.thresholdCrit) return 'var(--red)'
  if (props.value >= props.thresholdWarn) return 'var(--yellow)'
  return 'var(--green)'
})
</script>

<style scoped>
.gauge-card {
  display: inline-block;
  text-align: center;
  min-width: 100px;
}

.gauge-svg {
  width: 100px;
  height: 100px;
}

.gauge-arc {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    stroke 0.3s ease;
}

.gauge-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 600;
}

.gauge-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 4px;
}

.gauge-sub-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
}
</style>
