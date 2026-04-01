<template>
  <div class="editor-wrap">
    <div class="editor-toolbar">
      <span class="editor-label">QUERY</span>
      <div class="editor-actions">
        <select v-if="queryHistory.length" class="history-select" @change="loadFromHistory">
          <option value="">History ({{ queryHistory.length }})</option>
          <option v-for="(h, i) in queryHistory" :key="i" :value="i">
            {{ h.query.substring(0, 60) }}{{ h.query.length > 60 ? '...' : '' }}
          </option>
        </select>
        <button class="editor-btn" @click="$emit('clear')" title="Clear">Clear</button>
        <button class="editor-btn" @click="$emit('toggle-focus')" title="Focus mode (F11)">⛶</button>
        <button
          class="editor-btn run"
          @click="$emit('execute')"
          :disabled="!canExecute || loading"
          title="Run (Ctrl+Enter)"
        >
          {{ loading ? 'Running...' : '▶ Run' }}
        </button>
      </div>
    </div>
    <div class="editor-body" ref="editorBodyRef">
      <textarea
        ref="editorRef"
        :value="modelValue"
        @input="handleInput"
        @keydown="handleKeydown"
        class="query-textarea"
        :placeholder="placeholder"
        spellcheck="false"
      ></textarea>
      <!-- Autocomplete popup -->
      <div
        v-if="showSuggestions && filteredSuggestions.length"
        class="autocomplete-popup"
        :style="popupStyle"
      >
        <div
          v-for="(s, i) in filteredSuggestions"
          :key="s.value"
          class="ac-item"
          :class="{ active: i === selectedIndex }"
          @mousedown.prevent="acceptSuggestion(i)"
        >
          <span class="ac-icon" :class="s.kind">{{ s.icon }}</span>
          <span class="ac-text" v-html="highlightMatch(s.value)"></span>
          <span class="ac-kind">{{ s.kind }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  loading: Boolean,
  canExecute: Boolean,
  dbType: { type: String, default: 'mysql' },
  queryHistory: { type: Array, default: () => [] },
  schemaTables: { type: Array, default: () => [] },
  schemaColumns: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'execute', 'clear', 'toggle-focus'])

const editorRef = ref(null)
const editorBodyRef = ref(null)
const showSuggestions = ref(false)
const selectedIndex = ref(0)
const currentWord = ref('')
const popupStyle = ref({})

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW',
  'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING',
  'LIMIT', 'OFFSET', 'DISTINCT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'COALESCE', 'CAST',
  'UNION', 'ALL', 'EXISTS', 'TRUE', 'FALSE',
]

const allSuggestions = computed(() => {
  const items = []
  for (const kw of SQL_KEYWORDS) {
    items.push({ value: kw, kind: 'keyword', icon: 'K' })
  }
  for (const t of props.schemaTables) {
    items.push({ value: t, kind: 'table', icon: 'T' })
  }
  for (const c of props.schemaColumns) {
    items.push({ value: c, kind: 'column', icon: 'C' })
  }
  return items
})

const filteredSuggestions = computed(() => {
  const word = currentWord.value.toLowerCase()
  if (!word || word.length < 2) return []
  return allSuggestions.value
    .filter((s) => s.value.toLowerCase().startsWith(word))
    .slice(0, 10)
})

const placeholder = computed(() => {
  if (props.dbType === 'mongodb') {
    return 'db.collection.find({})  or  db.collection.countDocuments({})'
  }
  return 'SELECT * FROM table_name LIMIT 100;'
})

function handleInput(e) {
  emit('update:modelValue', e.target.value)
  nextTick(() => updateAutocomplete())
}

function handleKeydown(e) {
  if (e.key === 'F11') {
    e.preventDefault()
    emit('toggle-focus')
    return
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    emit('execute')
    closeSuggestions()
    return
  }

  if (!showSuggestions.value || filteredSuggestions.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % filteredSuggestions.value.length
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length
    return
  }
  if (e.key === 'Tab' || e.key === 'Enter') {
    if (showSuggestions.value && filteredSuggestions.value.length > 0) {
      e.preventDefault()
      acceptSuggestion(selectedIndex.value)
      return
    }
  }
  if (e.key === 'Escape') {
    closeSuggestions()
    return
  }
}

function updateAutocomplete() {
  const textarea = editorRef.value
  if (!textarea) return

  const text = textarea.value
  const pos = textarea.selectionStart
  const beforeCursor = text.substring(0, pos)

  // Extract the current word being typed
  const wordMatch = beforeCursor.match(/[\w.]+$/)
  if (!wordMatch) {
    closeSuggestions()
    return
  }

  currentWord.value = wordMatch[0]
  selectedIndex.value = 0

  if (currentWord.value.length < 2) {
    closeSuggestions()
    return
  }

  // Calculate popup position using a mirror technique
  const rect = textarea.getBoundingClientRect()
  const bodyRect = editorBodyRef.value?.getBoundingClientRect() || rect

  // Approximate cursor position
  const lines = beforeCursor.split('\n')
  const lineIndex = lines.length - 1
  const colIndex = lines[lineIndex].length
  const lineHeight = 20.4 // 12px * 1.7 line-height
  const charWidth = 7.2 // approximate monospace char width at 12px

  const top = Math.min(
    (lineIndex + 1) * lineHeight + 12, // 12px padding
    rect.height - 200,
  )
  const left = Math.min(
    colIndex * charWidth + 14, // 14px padding
    rect.width - 250,
  )

  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }

  showSuggestions.value = true
}

function acceptSuggestion(index) {
  const suggestion = filteredSuggestions.value[index]
  if (!suggestion) return

  const textarea = editorRef.value
  const text = textarea.value
  const pos = textarea.selectionStart
  const beforeCursor = text.substring(0, pos)
  const afterCursor = text.substring(pos)
  const wordMatch = beforeCursor.match(/[\w.]+$/)
  const wordStart = wordMatch ? pos - wordMatch[0].length : pos

  const newText = text.substring(0, wordStart) + suggestion.value + ' ' + afterCursor
  emit('update:modelValue', newText)

  closeSuggestions()

  nextTick(() => {
    const newPos = wordStart + suggestion.value.length + 1
    textarea.setSelectionRange(newPos, newPos)
    textarea.focus()
  })
}

function closeSuggestions() {
  showSuggestions.value = false
  selectedIndex.value = 0
}

function highlightMatch(text) {
  const word = currentWord.value
  if (!word) return text
  const idx = text.toLowerCase().indexOf(word.toLowerCase())
  if (idx === -1) return text
  return (
    text.substring(0, idx) +
    `<span class="ac-match">${text.substring(idx, idx + word.length)}</span>` +
    text.substring(idx + word.length)
  )
}

function loadFromHistory(e) {
  const idx = parseInt(e.target.value, 10)
  if (!isNaN(idx) && props.queryHistory[idx]) {
    emit('update:modelValue', props.queryHistory[idx].query)
  }
  e.target.value = ''
}

function focus() {
  editorRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.editor-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.editor-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text3);
}

.editor-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.history-select {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text3);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 6px;
  max-width: 180px;
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

.editor-body {
  flex: 1;
  position: relative;
  min-height: 0;
}

.query-textarea {
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  background: #0a0c10;
  border: none;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
  resize: none;
  outline: none;
}

.query-textarea::placeholder {
  color: var(--text3);
}

/* ── Autocomplete ── */
.autocomplete-popup {
  position: absolute;
  z-index: 50;
  min-width: 220px;
  max-width: 360px;
  max-height: 220px;
  overflow-y: auto;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.ac-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text);
  transition: background 0.08s;
}

.ac-item:hover,
.ac-item.active {
  background: rgba(79, 142, 247, 0.12);
}

.ac-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  flex-shrink: 0;
}

.ac-icon.keyword {
  background: rgba(79, 142, 247, 0.15);
  color: var(--accent);
}

.ac-icon.table {
  background: rgba(245, 166, 35, 0.15);
  color: var(--yellow);
}

.ac-icon.column {
  background: rgba(62, 207, 142, 0.15);
  color: var(--green);
}

.ac-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ac-text :deep(.ac-match) {
  color: var(--accent);
  font-weight: 600;
}

.ac-kind {
  font-size: 9px;
  color: var(--text3);
  flex-shrink: 0;
}
</style>
