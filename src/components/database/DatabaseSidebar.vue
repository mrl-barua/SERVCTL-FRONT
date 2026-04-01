<template>
  <div class="db-sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">Schema</span>
      <button class="refresh-btn" @click="$emit('refresh')" title="Refresh">↻</button>
    </div>

    <div v-if="!connected" class="sidebar-empty">
      Connect to a database to browse schema.
    </div>

    <div v-else class="tree">
      <div
        v-for="db in databases"
        :key="db"
        class="tree-node"
      >
        <button class="tree-trigger" @click="toggleDb(db)">
          <span class="tree-arrow" :class="{ open: expandedDbs.has(db) }">▸</span>
          <span class="tree-icon db-icon">⊟</span>
          <span class="tree-label">{{ db }}</span>
        </button>

        <div v-if="expandedDbs.has(db)" class="tree-children">
          <div v-if="loadingTables === db" class="tree-loading">loading...</div>
          <div
            v-for="table in tablesByDb[db] || []"
            :key="table"
            class="tree-node"
          >
            <button class="tree-trigger" @click="toggleTable(db, table)">
              <span class="tree-arrow" :class="{ open: expandedTables.has(`${db}.${table}`) }">▸</span>
              <span class="tree-icon table-icon">{{ dbType === 'mongodb' ? '{ }' : '⊞' }}</span>
              <span class="tree-label">{{ table }}</span>
            </button>

            <button
              class="tree-action"
              @click="$emit('browse-table', { database: db, table })"
              title="Browse data"
            >⏵</button>

            <div v-if="expandedTables.has(`${db}.${table}`)" class="tree-children">
              <div v-if="loadingColumns === `${db}.${table}`" class="tree-loading">loading...</div>
              <div
                v-for="col in columnsByTable[`${db}.${table}`] || []"
                :key="col.name"
                class="tree-leaf"
              >
                <span class="col-name">{{ col.name }}</span>
                <span class="col-type">{{ col.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useDatabaseStore } from '../../stores/database'

defineProps({
  connected: Boolean,
  databases: { type: Array, default: () => [] },
  dbType: { type: String, default: 'mysql' },
})

defineEmits(['refresh', 'browse-table'])

const dbStore = useDatabaseStore()

const expandedDbs = reactive(new Set())
const expandedTables = reactive(new Set())
const tablesByDb = reactive({})
const columnsByTable = reactive({})
const loadingTables = ref(null)
const loadingColumns = ref(null)

// Listen for store updates
dbStore.$onAction(({ name, after, args }) => {
  after(() => {
    if (name === 'fetchTables') {
      const db = args[0]
      tablesByDb[db] = [...dbStore.tables]
      loadingTables.value = null
    }
    if (name === 'fetchColumns') {
      const [db, table] = args
      columnsByTable[`${db}.${table}`] = [...dbStore.columns]
      loadingColumns.value = null
    }
  })
})

function toggleDb(db) {
  if (expandedDbs.has(db)) {
    expandedDbs.delete(db)
  } else {
    expandedDbs.add(db)
    if (!tablesByDb[db]) {
      loadingTables.value = db
      dbStore.fetchTables(db)
    }
  }
}

function toggleTable(db, table) {
  const key = `${db}.${table}`
  if (expandedTables.has(key)) {
    expandedTables.delete(key)
  } else {
    expandedTables.add(key)
    if (!columnsByTable[key]) {
      loadingColumns.value = key
      dbStore.fetchColumns(db, table)
    }
  }
}
</script>

<style scoped>
.db-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text3);
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text3);
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
}

.refresh-btn:hover {
  color: var(--accent);
}

.sidebar-empty {
  padding: 16px 12px;
  color: var(--text3);
  font-size: 11px;
  text-align: center;
}

.tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.tree-node {
  position: relative;
}

.tree-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 4px 10px;
  background: none;
  border: none;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.tree-trigger:hover {
  background: var(--bg3);
}

.tree-arrow {
  font-size: 9px;
  color: var(--text3);
  width: 12px;
  text-align: center;
  transition: transform 0.15s;
  flex-shrink: 0;
}

.tree-arrow.open {
  transform: rotate(90deg);
}

.tree-icon {
  font-size: 10px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.db-icon {
  color: var(--accent);
}

.table-icon {
  color: var(--yellow);
}

.tree-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-action {
  position: absolute;
  right: 8px;
  top: 4px;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s;
}

.tree-node:hover .tree-action {
  opacity: 1;
}

.tree-action:hover {
  color: var(--green);
}

.tree-children {
  padding-left: 16px;
}

.tree-leaf {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 10px 3px 26px;
  font-size: 10px;
}

.col-name {
  color: var(--text2);
}

.col-type {
  color: var(--text3);
  font-size: 9px;
  background: var(--bg4);
  padding: 1px 5px;
  border-radius: 3px;
}

.tree-loading {
  padding: 4px 10px 4px 26px;
  color: var(--text3);
  font-size: 10px;
  font-style: italic;
}
</style>
