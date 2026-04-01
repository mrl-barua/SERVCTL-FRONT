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
      <div v-for="db in databases" :key="db" class="tree-node">
        <button class="tree-trigger" @click="toggleDb(db)">
          <span class="tree-arrow" :class="{ open: expandedDbs.has(db) }">▸</span>
          <span class="tree-icon db-icon">⊟</span>
          <span class="tree-label">{{ db }}</span>
        </button>

        <div v-if="expandedDbs.has(db)" class="tree-children">
          <!-- TABLES category -->
          <div class="tree-node">
            <button class="tree-trigger category" @click="toggleCategory(db, 'tables')">
              <span class="tree-arrow" :class="{ open: expandedCategories.has(`${db}:tables`) }">▸</span>
              <span class="tree-icon table-icon">⊞</span>
              <span class="tree-label">Tables</span>
              <span v-if="tablesByDb[db]" class="tree-count">{{ tablesByDb[db].length }}</span>
            </button>
            <div v-if="expandedCategories.has(`${db}:tables`)" class="tree-children">
              <div v-if="loadingTables === db" class="tree-loading">loading...</div>
              <div v-for="table in tablesByDb[db] || []" :key="table" class="tree-node">
                <button class="tree-trigger" @click="toggleTable(db, table)">
                  <span class="tree-arrow" :class="{ open: expandedTables.has(`${db}.${table}`) }">▸</span>
                  <span class="tree-label">{{ table }}</span>
                </button>
                <button
                  class="tree-action"
                  @click="$emit('browse-table', { database: db, table })"
                  title="Browse data"
                >⏵</button>
                <div v-if="expandedTables.has(`${db}.${table}`)" class="tree-children">
                  <div v-if="loadingColumns === `${db}.${table}`" class="tree-loading">loading...</div>
                  <div v-for="col in columnsByTable[`${db}.${table}`] || []" :key="col.name" class="tree-leaf">
                    <span class="col-name">{{ col.name }}</span>
                    <span class="col-type">{{ col.type }}</span>
                  </div>
                  <!-- Indexes under table -->
                  <div v-if="indexesByTable[`${db}.${table}`]" class="tree-node">
                    <div v-for="idx in indexesByTable[`${db}.${table}`]" :key="idx.name" class="tree-leaf index-leaf">
                      <span class="idx-icon">⚡</span>
                      <span class="col-name">{{ idx.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- VIEWS category -->
          <div class="tree-node">
            <button class="tree-trigger category" @click="toggleCategory(db, 'views')">
              <span class="tree-arrow" :class="{ open: expandedCategories.has(`${db}:views`) }">▸</span>
              <span class="tree-icon view-icon">◎</span>
              <span class="tree-label">Views</span>
              <span v-if="viewsByDb[db]" class="tree-count">{{ viewsByDb[db].length }}</span>
            </button>
            <div v-if="expandedCategories.has(`${db}:views`)" class="tree-children">
              <div v-if="loadingViews === db" class="tree-loading">loading...</div>
              <div v-if="viewsByDb[db]?.length === 0" class="tree-loading">none</div>
              <div v-for="view in viewsByDb[db] || []" :key="view" class="tree-node">
                <button class="tree-trigger" @click="$emit('browse-table', { database: db, table: view })">
                  <span class="tree-label">{{ view }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- TYPES category (PostgreSQL only) -->
          <div v-if="dbType === 'postgresql'" class="tree-node">
            <button class="tree-trigger category" @click="toggleCategory(db, 'types')">
              <span class="tree-arrow" :class="{ open: expandedCategories.has(`${db}:types`) }">▸</span>
              <span class="tree-icon type-icon">◆</span>
              <span class="tree-label">Types</span>
              <span v-if="typesByDb[db]" class="tree-count">{{ typesByDb[db].length }}</span>
            </button>
            <div v-if="expandedCategories.has(`${db}:types`)" class="tree-children">
              <div v-if="loadingTypes === db" class="tree-loading">loading...</div>
              <div v-if="typesByDb[db]?.length === 0" class="tree-loading">none</div>
              <div v-for="t in typesByDb[db] || []" :key="t" class="tree-leaf">
                <span class="col-name">{{ t }}</span>
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
const expandedCategories = reactive(new Set())
const expandedTables = reactive(new Set())
const tablesByDb = reactive({})
const viewsByDb = reactive({})
const typesByDb = reactive({})
const columnsByTable = reactive({})
const indexesByTable = reactive({})
const loadingTables = ref(null)
const loadingViews = ref(null)
const loadingTypes = ref(null)
const loadingColumns = ref(null)

dbStore.$onAction(({ name, after, args }) => {
  after(() => {
    if (name === 'fetchTables') {
      tablesByDb[args[0]] = [...dbStore.tables]
      loadingTables.value = null
    }
    if (name === 'fetchColumns') {
      columnsByTable[`${args[0]}.${args[1]}`] = [...dbStore.columns]
      loadingColumns.value = null
    }
    if (name === 'fetchViews') {
      viewsByDb[args[0]] = [...dbStore.views]
      loadingViews.value = null
    }
    if (name === 'fetchTypes') {
      typesByDb[args[0]] = [...dbStore.types]
      loadingTypes.value = null
    }
    if (name === 'fetchIndexes') {
      indexesByTable[`${args[0]}.${args[1]}`] = [...dbStore.indexes]
    }
  })
})

function toggleDb(db) {
  if (expandedDbs.has(db)) {
    expandedDbs.delete(db)
  } else {
    expandedDbs.add(db)
  }
}

function toggleCategory(db, category) {
  const key = `${db}:${category}`
  if (expandedCategories.has(key)) {
    expandedCategories.delete(key)
  } else {
    expandedCategories.add(key)
    if (category === 'tables' && !tablesByDb[db]) {
      loadingTables.value = db
      dbStore.fetchTables(db)
    }
    if (category === 'views' && !viewsByDb[db]) {
      loadingViews.value = db
      dbStore.fetchViews(db)
    }
    if (category === 'types' && !typesByDb[db]) {
      loadingTypes.value = db
      dbStore.fetchTypes(db)
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
      dbStore.fetchIndexes(db, table)
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
  background: var(--bg2);
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

.tree-trigger.category {
  color: var(--text2);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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

.db-icon { color: var(--accent); }
.table-icon { color: var(--yellow); }
.view-icon { color: var(--green); }
.type-icon { color: #b48ead; }

.tree-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-count {
  margin-left: auto;
  font-size: 9px;
  color: var(--text3);
  background: var(--bg4);
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
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

.tree-node:hover > .tree-action {
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

.index-leaf {
  padding-left: 16px;
}

.idx-icon {
  font-size: 8px;
  color: var(--yellow);
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
