<template>
  <div class="results-wrap">
    <div class="results-toolbar">
      <span class="results-label">RESULTS</span>
      <div v-if="results" class="results-meta">
        <span>{{ results.rowCount }} row{{ results.rowCount !== 1 ? 's' : '' }}</span>
        <span class="meta-sep">·</span>
        <span>{{ results.executionTime }}ms</span>
        <button class="export-btn" @click="exportCsv" title="Export CSV">CSV ↓</button>
      </div>
    </div>

    <div v-if="error" class="results-error">
      <span class="error-icon">✗</span> {{ error }}
    </div>

    <div v-else-if="!results" class="results-empty">
      Run a query to see results here.
    </div>

    <div v-else-if="results.rows.length === 0" class="results-empty">
      Query returned 0 rows.
    </div>

    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="row-num">#</th>
            <th v-for="col in results.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in results.rows" :key="ri">
            <td class="row-num">{{ ri + 1 }}</td>
            <td v-for="(cell, ci) in row" :key="ci" :title="String(cell)">
              <span v-if="cell === null" class="null-val">NULL</span>
              <span v-else>{{ formatCell(cell) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  results: { type: Object, default: null },
  error: { type: String, default: null },
})

function formatCell(val) {
  if (typeof val === 'object') return JSON.stringify(val)
  const str = String(val)
  return str.length > 200 ? str.substring(0, 200) + '...' : str
}

function exportCsv() {
  if (!props.results) return
  const { columns, rows } = props.results
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    columns.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'query-results.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.results-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.results-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text3);
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--text3);
}

.meta-sep {
  color: var(--border2);
}

.export-btn {
  margin-left: 6px;
  padding: 3px 8px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text3);
  font-family: var(--font-mono);
  font-size: 9px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.export-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.results-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  font-size: 11px;
}

.results-error {
  padding: 12px 16px;
  background: var(--red-bg);
  color: var(--red);
  font-size: 11px;
  font-family: var(--font-mono);
}

.error-icon {
  font-weight: 700;
}

.table-scroll {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 11px;
}

.data-table th,
.data-table td {
  padding: 6px 10px;
  text-align: left;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  position: sticky;
  top: 0;
  background: var(--bg3);
  color: var(--text2);
  font-weight: 500;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  z-index: 1;
}

.data-table tbody tr:hover {
  background: rgba(79, 142, 247, 0.04);
}

.data-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.01);
}

.row-num {
  color: var(--text3);
  font-size: 9px;
  width: 36px;
  text-align: center;
}

.null-val {
  color: var(--text3);
  font-style: italic;
  font-size: 10px;
}
</style>
