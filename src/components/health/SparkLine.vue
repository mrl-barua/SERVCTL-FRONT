<template>
  <div class="sparkline-wrap">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="sparkline-svg"
      preserveAspectRatio="none"
    >
      <!-- Fill area -->
      <polygon
        v-if="points.length > 1"
        :points="fillPoints"
        :fill="color"
        fill-opacity="0.1"
      />
      <!-- Line -->
      <polyline
        v-if="points.length > 1"
        :points="linePoints"
        :stroke="color"
        fill="none"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- Threshold line -->
      <line
        v-if="thresholdLine !== null && thresholdLine !== undefined"
        :x1="0"
        :y1="thresholdY"
        :x2="width"
        :y2="thresholdY"
        stroke="var(--red)"
        stroke-opacity="0.5"
        stroke-width="1"
        stroke-dasharray="4 2"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: number[]
    color?: string
    width?: number
    height?: number
    thresholdLine?: number | null
  }>(),
  {
    color: 'var(--accent)',
    width: 200,
    height: 40,
    thresholdLine: null,
  },
)

const padding = 2

const points = computed(() => {
  if (!props.data || props.data.length === 0) return []

  const len = props.data.length
  const maxVal = Math.max(...props.data, 1)
  const minVal = Math.min(...props.data, 0)
  const range = maxVal - minVal || 1

  return props.data.map((val, i) => {
    const x = len === 1 ? props.width / 2 : (i / (len - 1)) * (props.width - padding * 2) + padding
    const y = props.height - padding - ((val - minVal) / range) * (props.height - padding * 2)
    return { x, y }
  })
})

const linePoints = computed(() => {
  return points.value.map((p) => `${p.x},${p.y}`).join(' ')
})

const fillPoints = computed(() => {
  if (points.value.length === 0) return ''
  const line = points.value.map((p) => `${p.x},${p.y}`).join(' ')
  const lastX = points.value[points.value.length - 1].x
  const firstX = points.value[0].x
  return `${line} ${lastX},${props.height} ${firstX},${props.height}`
})

const thresholdY = computed(() => {
  if (props.thresholdLine === null || props.thresholdLine === undefined) return 0
  const maxVal = Math.max(...(props.data || []), 1)
  const minVal = Math.min(...(props.data || []), 0)
  const range = maxVal - minVal || 1
  return props.height - padding - ((props.thresholdLine - minVal) / range) * (props.height - padding * 2)
})
</script>

<style scoped>
.sparkline-wrap {
  display: block;
  width: 100%;
}

.sparkline-svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>
