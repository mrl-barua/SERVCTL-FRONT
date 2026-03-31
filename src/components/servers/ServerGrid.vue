<template>
  <div v-for="env in envOrder" :key="env">
    <template v-if="orderedServersInEnv[env].length > 0">
      <div class="section-header">
        <span class="section-title">{{ envLabels[env] }}</span>
        <span class="section-line"></span>
      </div>
      <div class="server-grid">
        <div
          v-for="(server, index) in orderedServersInEnv[env]"
          :key="server.id"
          class="card-drop-wrapper"
          :class="{
            'drop-before': dragOverEnv === env && dragOverIndex === index && dropPosition === 'before',
            'drop-after': dragOverEnv === env && dragOverIndex === index && dropPosition === 'after',
          }"
          @dragover.prevent="onDragOver($event, env, index)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, env, index)"
        >
          <ServerCard
            :server="server"
            :selectable="selectable"
            :selected="selectedServerIds.has(server.id)"
            @dragstart="onCardDragStart($event, env)"
            @dragend="onCardDragEnd"
            @toggle-select="onToggleSelect"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useServersStore } from '../../stores/servers'
import { useDisplayOrderStore } from '../../stores/displayOrder'
import ServerCard from './ServerCard.vue'

const serversStore = useServersStore()
const displayOrderStore = useDisplayOrderStore()

const envOrder = ['prod', 'live', 'qa', 'test']
const envLabels = {
  prod: 'Production',
  live: 'Live',
  qa: 'QA',
  test: 'Testing',
}

// Drag state
const dragSourceEnv = ref(null)
const dragOverEnv = ref(null)
const dragOverIndex = ref(-1)
const dropPosition = ref(null) // 'before' | 'after'

// Selection state
const selectable = ref(false)
const selectedServerIds = ref(new Set())

// Sort servers by display order before grouping by env
const orderedServers = computed(() => {
  return displayOrderStore.applyOrder(serversStore.servers, 'grid')
})

const orderedServersInEnv = computed(() => {
  const grouped = {}
  envOrder.forEach(env => {
    grouped[env] = orderedServers.value.filter(s => s.env === env)
  })
  return grouped
})

onMounted(() => {
  displayOrderStore.fetchOrder('grid')
})

function onCardDragStart(serverId, env) {
  dragSourceEnv.value = env
}

function onCardDragEnd() {
  dragSourceEnv.value = null
  dragOverEnv.value = null
  dragOverIndex.value = -1
  dropPosition.value = null
}

function onDragOver(e, env, index) {
  e.dataTransfer.dropEffect = 'move'
  dragOverEnv.value = env
  dragOverIndex.value = index

  // Determine if dropping before or after based on cursor position
  const rect = e.currentTarget.getBoundingClientRect()
  const midX = rect.left + rect.width / 2
  dropPosition.value = e.clientX < midX ? 'before' : 'after'
}

function onDragLeave() {
  dragOverEnv.value = null
  dragOverIndex.value = -1
  dropPosition.value = null
}

function onDrop(e, targetEnv, targetIndex) {
  const draggedId = parseInt(e.dataTransfer.getData('text/plain'), 10)
  if (isNaN(draggedId)) return

  // Build the new full order across all environments
  const allOrdered = []
  envOrder.forEach(env => {
    const envServers = orderedServersInEnv.value[env]
    envServers.forEach((server, idx) => {
      if (server.id === draggedId) return // skip dragged item in original position

      // Insert before or after the target
      if (env === targetEnv && idx === targetIndex) {
        if (dropPosition.value === 'before') {
          allOrdered.push(draggedId)
          allOrdered.push(server.id)
        } else {
          allOrdered.push(server.id)
          allOrdered.push(draggedId)
        }
      } else {
        allOrdered.push(server.id)
      }
    })

    // If env has no servers but is target, add dragged item
    if (env === targetEnv && envServers.length === 0) {
      allOrdered.push(draggedId)
    }
  })

  // Deduplicate (in case dragged item was already added)
  const seen = new Set()
  const deduped = []
  for (const id of allOrdered) {
    if (!seen.has(id)) {
      seen.add(id)
      deduped.push(id)
    }
  }

  displayOrderStore.saveOrder('grid', deduped)

  // Reset drag state
  onCardDragEnd()
}

function onToggleSelect(serverId) {
  const next = new Set(selectedServerIds.value)
  if (next.has(serverId)) {
    next.delete(serverId)
  } else {
    next.add(serverId)
  }
  selectedServerIds.value = next
}
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 4px;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.server-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.card-drop-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  transition: none;
}

.card-drop-wrapper.drop-before::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent);
  border-radius: 1px;
  z-index: 3;
  pointer-events: none;
}

.card-drop-wrapper.drop-after::after {
  content: "";
  position: absolute;
  right: -6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent);
  border-radius: 1px;
  z-index: 3;
  pointer-events: none;
}
</style>
