<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h2>Manage Tags</h2>
          <button class="x-btn" @click="close">x</button>
        </header>

        <section class="tag-list">
          <div v-if="tagsStore.loading" class="empty-state">Loading...</div>
          <div v-else-if="tagsStore.tags.length === 0" class="empty-state">
            No tags yet. Create one below.
          </div>

          <div
            v-for="tag in tagsStore.tags"
            :key="tag.id"
            class="tag-row"
          >
            <span
              class="tag-color-dot"
              :style="{ background: tag.color }"
            ></span>

            <template v-if="editingId === tag.id">
              <input
                ref="editInput"
                v-model="editName"
                class="tag-edit-input"
                @keydown.enter="saveEdit(tag.id)"
                @keydown.escape="cancelEdit"
              />
              <button class="row-btn save" @click="saveEdit(tag.id)">Save</button>
              <button class="row-btn" @click="cancelEdit">Cancel</button>
            </template>

            <template v-else>
              <span
                class="tag-name"
                :style="{ color: tag.color }"
                @click="startEdit(tag)"
              >
                {{ tag.name }}
              </span>
              <span class="tag-count">
                {{ tag._count?.assignments || 0 }} server{{ (tag._count?.assignments || 0) !== 1 ? 's' : '' }}
              </span>
              <div class="row-actions">
                <button class="row-btn assign-btn" @click="openAssignPanel(tag)">+ Assign</button>
                <button class="row-btn" @click="startEdit(tag)">Edit</button>
                <button class="row-btn danger" @click="handleDelete(tag)">Delete</button>
              </div>
            </template>
          </div>
        </section>

        <section v-if="assigningTag" class="assign-section">
          <div class="assign-header">
            <h3>Assign servers to "{{ assigningTag.name }}"</h3>
            <button class="row-btn" @click="assigningTag = null">Close</button>
          </div>
          <div class="server-checklist">
            <label
              v-for="server in serversStore.servers"
              :key="server.id"
              class="server-check-item"
            >
              <input
                type="checkbox"
                :checked="assignSelectedIds.has(server.id)"
                @change="toggleAssignServer(server.id)"
              />
              <span class="check-dot" :class="server.status"></span>
              <span class="check-name">{{ server.name }}</span>
              <span class="check-host">{{ server.host }}</span>
            </label>
          </div>
          <button
            class="btn primary"
            :disabled="!assignHasChanges"
            @click="confirmAssign"
          >
            Save changes
          </button>
        </section>

        <section class="create-section">
          <h3>Create tag</h3>
          <div class="create-form">
            <input
              v-model="newName"
              class="create-input"
              placeholder="Tag name"
              @keydown.enter="handleCreate"
            />
            <div class="color-picker">
              <button
                v-for="c in presetColors"
                :key="c"
                class="color-swatch"
                :class="{ active: newColor === c }"
                :style="{ background: c }"
                @click="newColor = c"
              ></button>
            </div>
            <button class="btn primary" :disabled="!newName.trim()" @click="handleCreate">
              Create
            </button>
          </div>
        </section>
      </div>
    </div>
  </Teleport>

  <ConfirmModal
    v-model="showDeleteConfirm"
    title="Delete tag?"
    :message="`This will remove the tag '${pendingDeleteTag?.name || ''}' from all servers.`"
    confirm-label="Delete Tag"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useServerTagsStore } from '../../stores/serverTags'
import { useServersStore } from '../../stores/servers'
import { useToastStore } from '../../stores/toast'
import ConfirmModal from '../common/ConfirmModal.vue'
import type { ServerTag } from '../../stores/serverTags'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const tagsStore = useServerTagsStore()
const serversStore = useServersStore()
const toastStore = useToastStore()

const presetColors = [
  '#4f8ef7',
  '#3ecf8e',
  '#f5a623',
  '#f25f5c',
  '#a78bfa',
  '#f472b6',
  '#38bdf8',
  '#fb923c',
]

const newName = ref('')
const newColor = ref(presetColors[0])
const editingId = ref<number | null>(null)
const editName = ref('')
const editInput = ref<HTMLInputElement | null>(null)

const showDeleteConfirm = ref(false)
const pendingDeleteTag = ref<ServerTag | null>(null)
const deleting = ref(false)

const assigningTag = ref<ServerTag | null>(null)
const assignSelectedIds = ref<Set<number>>(new Set())

// True when the current selection differs from the tag's existing assignments
const assignHasChanges = computed(() => {
  if (!assigningTag.value) return false
  const prevIds = new Set(assigningTag.value.serverIds ?? [])
  const nextIds = assignSelectedIds.value
  if (prevIds.size !== nextIds.size) return true
  for (const id of nextIds) {
    if (!prevIds.has(id)) return true
  }
  return false
})

function openAssignPanel(tag: ServerTag) {
  assigningTag.value = tag
  // Pre-populate with servers already assigned to this tag
  assignSelectedIds.value = new Set(tag.serverIds ?? [])
}

function toggleAssignServer(serverId: number) {
  const set = new Set(assignSelectedIds.value)
  if (set.has(serverId)) {
    set.delete(serverId)
  } else {
    set.add(serverId)
  }
  assignSelectedIds.value = set
}

async function confirmAssign() {
  if (!assigningTag.value || !assignHasChanges.value) return

  const tagId = assigningTag.value.id
  const tagName = assigningTag.value.name
  const prevIds = new Set(assigningTag.value.serverIds ?? [])
  const nextIds = assignSelectedIds.value

  const toAdd = Array.from(nextIds).filter((id) => !prevIds.has(id))
  const toRemove = Array.from(prevIds).filter((id) => !nextIds.has(id))

  try {
    // Remove unchecked servers first (updates local state immediately)
    for (const serverId of toRemove) {
      await tagsStore.unassignTag(tagId, serverId)
    }
    // Add newly checked servers (calls fetchTags internally for full refresh)
    if (toAdd.length > 0) {
      await tagsStore.assignTag(tagId, toAdd)
    } else {
      // Only removals — refetch once to sync counts
      await tagsStore.fetchTags()
    }

    const parts: string[] = []
    if (toAdd.length > 0) parts.push(`${toAdd.length} added`)
    if (toRemove.length > 0) parts.push(`${toRemove.length} removed`)
    toastStore.showToast(`"${tagName}": ${parts.join(', ')}`, 'success')
    assigningTag.value = null
    assignSelectedIds.value = new Set()
  } catch (err: any) {
    toastStore.showToast(
      err?.response?.data?.message || 'Failed to update assignments',
      'error',
    )
  }
}

function close() {
  emit('update:modelValue', false)
}

async function handleCreate() {
  const name = newName.value.trim()
  if (!name) return

  try {
    await tagsStore.createTag(name, newColor.value)
    newName.value = ''
    newColor.value = presetColors[0]
    toastStore.showToast(`Tag "${name}" created`, 'success')
  } catch (err: any) {
    toastStore.showToast(
      err?.response?.data?.message || 'Failed to create tag',
      'error',
    )
  }
}

function startEdit(tag: ServerTag) {
  editingId.value = tag.id
  editName.value = tag.name
  nextTick(() => {
    if (editInput.value) {
      const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
      el?.focus()
    }
  })
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(id: number) {
  const name = editName.value.trim()
  if (!name) return

  try {
    await tagsStore.updateTag(id, { name })
    toastStore.showToast('Tag updated', 'success')
  } catch (err: any) {
    toastStore.showToast(
      err?.response?.data?.message || 'Failed to update tag',
      'error',
    )
  }

  cancelEdit()
}

function handleDelete(tag: ServerTag) {
  pendingDeleteTag.value = tag
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!pendingDeleteTag.value) return

  deleting.value = true
  try {
    await tagsStore.deleteTag(pendingDeleteTag.value.id)
    showDeleteConfirm.value = false
    toastStore.showToast(
      `Tag "${pendingDeleteTag.value.name}" deleted`,
      'success',
    )
  } catch (err: any) {
    toastStore.showToast(
      err?.response?.data?.message || 'Failed to delete tag',
      'error',
    )
  } finally {
    deleting.value = false
    pendingDeleteTag.value = null
  }
}

onMounted(() => {
  if (tagsStore.tags.length === 0) {
    tagsStore.fetchTags()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal {
  width: min(520px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: grid;
  gap: 14px;
  animation: modalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--text);
}

.x-btn {
  border: none;
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 14px;
}

.tag-list {
  display: grid;
  gap: 4px;
}

.empty-state {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
  text-align: center;
  padding: 20px 0;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius);
  transition: background 0.12s;
}

.tag-row:hover {
  background: var(--bg3);
}

.tag-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  flex-shrink: 0;
}

.tag-edit-input {
  flex: 1;
  min-width: 0;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.row-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.12s;
}

.tag-row:hover .row-actions {
  opacity: 1;
}

.row-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 3px 8px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg4);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.12s;
}

.row-btn:hover {
  color: var(--text);
}

.row-btn.save {
  border-color: var(--accent2);
  color: var(--accent);
}

.row-btn.danger {
  border-color: #4a1515;
  color: var(--red);
}

.row-btn.danger:hover {
  background: var(--red-bg);
}

.assign-section {
  border: 1px solid var(--accent2);
  border-radius: var(--radius);
  padding: 12px;
  display: grid;
  gap: 10px;
  background: var(--bg3);
}

.assign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assign-header h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
}

.server-checklist {
  display: grid;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.server-check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
  cursor: pointer;
  transition: background 0.1s;
}

.server-check-item:hover {
  background: var(--bg4);
}

.server-check-item input[type="checkbox"] {
  accent-color: var(--accent);
}

.check-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.check-dot.online {
  background: var(--green);
}

.check-dot.offline {
  background: var(--red);
}

.check-dot.unknown {
  background: var(--yellow);
}

.check-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-host {
  color: var(--text3);
  font-size: 10px;
  flex-shrink: 0;
}

.assign-btn {
  border-color: var(--accent2) !important;
  color: var(--accent) !important;
}

.create-section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  display: grid;
  gap: 10px;
}

.create-section h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text2);
}

.create-form {
  display: grid;
  gap: 8px;
}

.create-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: var(--radius);
  padding: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.12s;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--bg2), 0 0 0 4px currentColor;
}

.btn {
  font-family: var(--font-mono);
  font-size: 11px;
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  border-radius: var(--radius);
  padding: 7px 12px;
  cursor: pointer;
  transition: all 0.12s;
}

.btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.btn.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .modal {
    width: 100%;
    max-height: 90vh;
  }
}
</style>
