<template>
  <div class="db-ide" :class="{ 'focus-mode': focusMode }">
    <!-- Focus mode floating bar -->
    <div v-if="focusMode" class="focus-bar">
      <span class="focus-info">
        <span class="focus-conn">{{ activeConnectionName }}</span>
        <span v-if="selectedDatabase" class="focus-db">/ {{ selectedDatabase }}</span>
      </span>
      <div class="focus-actions">
        <button
          class="editor-btn run"
          @click="runQuery"
          :disabled="!dbStore.connected || dbStore.queryLoading"
        >
          {{ dbStore.queryLoading ? 'Running...' : '▶ Run' }}
        </button>
        <button class="editor-btn" @click="focusMode = false" title="Exit focus (Esc)">Exit Focus</button>
      </div>
    </div>

    <div v-show="!focusMode" class="ide-toolbar">
      <div class="toolbar-left">
        <select
          v-model.number="selectedConnectionId"
          class="form-select"
          @change="handleConnectionChange"
        >
          <option :value="0">Select connection</option>
          <option v-for="c in dbStore.connections" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.type }})
          </option>
        </select>

        <select
          v-if="dbStore.connected && dbStore.databases.length"
          v-model="selectedDatabase"
          class="form-select db-select"
          @change="handleDatabaseChange"
        >
          <option value="">Select database</option>
          <option v-for="db in dbStore.databases" :key="db" :value="db">
            {{ db }}
          </option>
        </select>

        <span v-if="dbStore.connected" class="status-badge online">connected</span>
        <span v-else-if="connecting" class="status-badge connecting">connecting...</span>
      </div>

      <div class="toolbar-right">
        <button class="toolbar-btn" @click="showConnectionModal = true">
          + Add Connection
        </button>
        <button
          v-if="selectedConnectionId"
          class="toolbar-btn danger"
          @click="handleDeleteConnection"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="ide-body">
      <aside v-show="!focusMode" class="ide-sidebar">
        <DatabaseSidebar
          :connected="dbStore.connected"
          :databases="dbStore.databases"
          :db-type="dbStore.activeDbType"
          @refresh="refreshSchema"
          @browse-table="browseTable"
        />
      </aside>

      <div class="ide-main">
        <div class="editor-pane">
          <QueryEditor
            v-model="queryText"
            :loading="dbStore.queryLoading"
            :can-execute="dbStore.connected"
            :db-type="dbStore.activeDbType"
            :query-history="dbStore.queryHistory"
            :schema-tables="schemaTables"
            :schema-columns="schemaColumns"
            @execute="runQuery"
            @clear="queryText = ''"
            @toggle-focus="toggleFocus"
          />
        </div>
        <div class="resize-handle" @mousedown="startResize"></div>
        <div class="results-pane" :style="{ height: resultsHeight + 'px' }">
          <ResultsTable
            :results="dbStore.results"
            :error="dbStore.queryError"
          />
        </div>
      </div>
    </div>

    <ConnectionModal v-model="showConnectionModal" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDatabaseStore } from '../stores/database'
import { useToastStore } from '../stores/toast'
import DatabaseSidebar from '../components/database/DatabaseSidebar.vue'
import QueryEditor from '../components/database/QueryEditor.vue'
import ResultsTable from '../components/database/ResultsTable.vue'
import ConnectionModal from '../components/database/ConnectionModal.vue'

const dbStore = useDatabaseStore()
const toastStore = useToastStore()

const selectedConnectionId = ref(0)
const selectedDatabase = ref('')
const queryText = ref('')
const showConnectionModal = ref(false)
const connecting = ref(false)
const resultsHeight = ref(300)
const focusMode = ref(false)

const activeConnectionName = computed(() => {
  const conn = dbStore.connections.find((c) => c.id === dbStore.activeConnectionId)
  return conn ? conn.name : ''
})

const schemaTables = computed(() => dbStore.tables || [])
const schemaColumns = computed(() => (dbStore.columns || []).map((c) => c.name))

onMounted(async () => {
  await dbStore.fetchConnections()
  window.addEventListener('keydown', handleGlobalKey)
})

onBeforeUnmount(() => {
  dbStore.disconnect()
  window.removeEventListener('keydown', handleGlobalKey)
})

function handleGlobalKey(e) {
  if (e.key === 'Escape' && focusMode.value) {
    focusMode.value = false
  }
  if (e.key === 'F11') {
    e.preventDefault()
    toggleFocus()
  }
}

function toggleFocus() {
  focusMode.value = !focusMode.value
}

async function handleConnectionChange() {
  if (!selectedConnectionId.value) {
    dbStore.disconnect()
    return
  }
  connecting.value = true
  selectedDatabase.value = ''
  dbStore.connectToDb(selectedConnectionId.value)

  const checkConnected = setInterval(() => {
    if (dbStore.connected) {
      clearInterval(checkConnected)
      connecting.value = false
      dbStore.fetchDatabases()
    }
    if (dbStore.queryError) {
      clearInterval(checkConnected)
      connecting.value = false
      toastStore.showToast(dbStore.queryError, 'error')
    }
  }, 200)

  setTimeout(() => {
    clearInterval(checkConnected)
    if (!dbStore.connected) {
      connecting.value = false
    }
  }, 15000)
}

function handleDatabaseChange() {
  if (selectedDatabase.value) {
    dbStore.fetchTables(selectedDatabase.value)
  }
}

function runQuery() {
  if (!queryText.value.trim()) return
  dbStore.executeQuery(queryText.value, selectedDatabase.value || undefined)
}

function refreshSchema() {
  if (!dbStore.connected) return
  dbStore.fetchDatabases()
  if (selectedDatabase.value) {
    dbStore.fetchTables(selectedDatabase.value)
  }
}

function browseTable({ database, table }) {
  selectedDatabase.value = database
  if (dbStore.activeDbType === 'mongodb') {
    queryText.value = `db.${table}.find({}).limit(100)`
  } else {
    queryText.value = `SELECT * FROM "${table}" LIMIT 100;`
  }
  runQuery()
}

async function handleDeleteConnection() {
  if (!selectedConnectionId.value) return
  try {
    await dbStore.deleteConnection(selectedConnectionId.value)
    selectedConnectionId.value = 0
    toastStore.showToast('Connection deleted', 'success')
  } catch {
    toastStore.showToast('Failed to delete', 'error')
  }
}

// ── Resize handle ───────────────────────────────────────
function startResize(e) {
  e.preventDefault()
  const startY = e.clientY
  const startH = resultsHeight.value

  function onMove(ev) {
    const delta = startY - ev.clientY
    resultsHeight.value = Math.max(100, Math.min(600, startH + delta))
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<style scoped>
.db-ide {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  margin: -20px;
}

/* ── Focus mode ── */
.focus-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.focus-info {
  font-size: 11px;
  color: var(--text2);
  font-family: var(--font-mono);
}

.focus-conn {
  color: var(--text);
  font-weight: 500;
}

.focus-db {
  color: var(--accent);
}

.focus-actions {
  display: flex;
  gap: 6px;
}

.editor-btn {
  padding: 4px 10px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text2);
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.editor-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.editor-btn.run {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.editor-btn.run:hover {
  background: var(--accent2);
}

.editor-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Toolbar ── */
.ide-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-select {
  padding: 7px 10px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  min-width: 180px;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.db-select {
  min-width: 140px;
}

.status-badge {
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: var(--font-mono);
}

.status-badge.online {
  color: var(--green);
  background: var(--green-bg);
  border: 1px solid rgba(62, 207, 142, 0.2);
}

.status-badge.connecting {
  color: var(--yellow);
  background: var(--yellow-bg);
  border: 1px solid rgba(245, 166, 35, 0.2);
}

.toolbar-btn {
  padding: 7px 12px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text2);
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.toolbar-btn.danger:hover {
  border-color: var(--red);
  color: var(--red);
}

/* ── IDE Body ── */
.ide-body {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.ide-sidebar {
  width: 240px;
  border-right: 1px solid var(--border);
  background: var(--bg2);
  flex-shrink: 0;
  overflow: hidden;
}

.ide-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.editor-pane {
  flex: 1;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.resize-handle {
  height: 4px;
  background: var(--border);
  cursor: row-resize;
  flex-shrink: 0;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: var(--accent);
}

.results-pane {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
}

@media (max-width: 980px) {
  .ide-sidebar {
    display: none;
  }
}

@media (max-width: 680px) {
  .ide-toolbar {
    flex-direction: column;
    gap: 8px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .form-select {
    flex: 1;
    min-width: 0;
  }
}
</style>
