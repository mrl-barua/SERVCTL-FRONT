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
    <textarea
      ref="editorRef"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.ctrl.enter.prevent="$emit('execute')"
      @keydown.meta.enter.prevent="$emit('execute')"
      class="query-textarea"
      :placeholder="placeholder"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  loading: Boolean,
  canExecute: Boolean,
  dbType: { type: String, default: 'mysql' },
  queryHistory: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'execute', 'clear'])

const editorRef = ref(null)

const placeholder = computed(() => {
  if (props.dbType === 'mongodb') {
    return 'db.collection.find({})  or  db.collection.countDocuments({})'
  }
  return 'SELECT * FROM table_name LIMIT 100;'
})

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

.query-textarea {
  flex: 1;
  width: 100%;
  min-height: 0;
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
</style>
