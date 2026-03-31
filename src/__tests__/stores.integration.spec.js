import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTestPinia, factories } from './helpers'

// ── Mock HTTP client ──────────────────────────────────────────────────────────
vi.mock('../services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// ── Mock socket service ───────────────────────────────────────────────────────
vi.mock('../services/socket', () => ({
  createAuthenticatedSocket: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}))

import apiClient from '../services/http'
import { createAuthenticatedSocket } from '../services/socket'
import { useServerGroupsStore } from '../stores/serverGroups'
import { useServerTagsStore } from '../stores/serverTags'
import { useServerHealthStore } from '../stores/serverHealth'
import { useDisplayOrderStore } from '../stores/displayOrder'
import { useMultiTerminalStore } from '../stores/multiTerminal'

// ═══════════════════════════════════════════════════════════════════════════════
// serverGroups store
// ═══════════════════════════════════════════════════════════════════════════════
describe('serverGroups store', () => {
  let store

  beforeEach(() => {
    createTestPinia()
    store = useServerGroupsStore()
  })

  // ── fetchGroups ───────────────────────────────────────────────────────────
  it('fetchGroups populates groups from GET /server-groups', async () => {
    const groups = [
      { id: 1, name: 'Production', color: '#f25f5c', sortOrder: 0, members: [] },
      { id: 2, name: 'Staging', color: '#4f8ef7', sortOrder: 1, members: [] },
    ]
    apiClient.get.mockResolvedValueOnce({ data: groups })

    await store.fetchGroups()

    expect(apiClient.get).toHaveBeenCalledWith('/server-groups')
    expect(store.groups).toEqual(groups)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  // ── createGroup ───────────────────────────────────────────────────────────
  it('createGroup adds new group to state after POST', async () => {
    const newGroup = { id: 3, name: 'Dev', color: '#3ecf8e', sortOrder: 2, members: [] }
    apiClient.post.mockResolvedValueOnce({ data: newGroup })

    const result = await store.createGroup('Dev', '#3ecf8e')

    expect(apiClient.post).toHaveBeenCalledWith('/server-groups', { name: 'Dev', color: '#3ecf8e' })
    expect(store.groups).toContainEqual(newGroup)
    expect(result).toEqual(newGroup)
  })

  // ── updateGroup ───────────────────────────────────────────────────────────
  it('updateGroup replaces matching group in state after PATCH', async () => {
    store.groups = [
      { id: 1, name: 'Old Name', color: '#000', sortOrder: 0, members: [] },
    ]
    const updated = { id: 1, name: 'New Name', color: '#fff', sortOrder: 0, members: [] }
    apiClient.patch.mockResolvedValueOnce({ data: updated })

    const result = await store.updateGroup(1, { name: 'New Name', color: '#fff' })

    expect(apiClient.patch).toHaveBeenCalledWith('/server-groups/1', { name: 'New Name', color: '#fff' })
    expect(store.groups[0]).toEqual(updated)
    expect(result).toEqual(updated)
  })

  // ── deleteGroup ───────────────────────────────────────────────────────────
  it('deleteGroup removes group from state after DELETE', async () => {
    store.groups = [
      { id: 1, name: 'A', color: '#000', sortOrder: 0, members: [] },
      { id: 2, name: 'B', color: '#111', sortOrder: 1, members: [] },
    ]
    apiClient.delete.mockResolvedValueOnce({})

    await store.deleteGroup(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-groups/1')
    expect(store.groups).toHaveLength(1)
    expect(store.groups[0].id).toBe(2)
  })

  // ── addServersToGroup ─────────────────────────────────────────────────────
  it('addServersToGroup posts and refetches groups', async () => {
    store.groups = [
      { id: 5, name: 'Prod', color: '#f25f5c', sortOrder: 0, _count: { members: 0 } },
    ]
    apiClient.post.mockResolvedValueOnce({ data: { message: 'ok' } })
    // Mock the refetch that happens inside addServersToGroup
    apiClient.get.mockResolvedValueOnce({
      data: [{ id: 5, name: 'Prod', color: '#f25f5c', sortOrder: 0, _count: { members: 2 } }],
    })

    await store.addServersToGroup(5, [1, 2])

    expect(apiClient.post).toHaveBeenCalledWith('/server-groups/5/servers', { serverIds: [1, 2] })
    expect(store.groups[0]._count.members).toBe(2)
  })

  // ── removeServerFromGroup ─────────────────────────────────────────────────
  it('removeServerFromGroup deletes and removes server from local serverIds', async () => {
    store.groups = [
      {
        id: 5,
        name: 'Prod',
        color: '#f25f5c',
        sortOrder: 0,
        serverIds: [1, 2],
        _count: { members: 2 },
      },
    ]
    apiClient.delete.mockResolvedValueOnce({})

    await store.removeServerFromGroup(5, 1)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-groups/5/servers/1')
    expect(store.groups[0].serverIds).toHaveLength(1)
    expect(store.groups[0].serverIds[0]).toBe(2)
    expect(store.groups[0]._count.members).toBe(1)
  })

  // ── reorderGroups ─────────────────────────────────────────────────────────
  it('reorderGroups patches and sorts groups by new order', async () => {
    store.groups = [
      { id: 1, name: 'A', color: '#000', sortOrder: 0, members: [] },
      { id: 2, name: 'B', color: '#111', sortOrder: 1, members: [] },
      { id: 3, name: 'C', color: '#222', sortOrder: 2, members: [] },
    ]
    apiClient.patch.mockResolvedValueOnce({})

    await store.reorderGroups([3, 1, 2])

    expect(apiClient.patch).toHaveBeenCalledWith('/server-groups/reorder', { orderedIds: [3, 1, 2] })
    expect(store.groups[0].id).toBe(3)
    expect(store.groups[0].sortOrder).toBe(0)
    expect(store.groups[1].id).toBe(1)
    expect(store.groups[1].sortOrder).toBe(1)
    expect(store.groups[2].id).toBe(2)
    expect(store.groups[2].sortOrder).toBe(2)
  })

  // ── groupsForServer getter ────────────────────────────────────────────────
  it('groupsForServer returns only groups containing the given serverId', () => {
    store.groups = [
      { id: 1, name: 'A', color: '#000', sortOrder: 0, serverIds: [42] },
      { id: 2, name: 'B', color: '#111', sortOrder: 1, serverIds: [99] },
      { id: 3, name: 'C', color: '#222', sortOrder: 2, serverIds: [42] },
    ]

    const result = store.groupsForServer(42)

    expect(result).toHaveLength(2)
    expect(result.map((g) => g.id)).toEqual([1, 3])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// serverTags store
// ═══════════════════════════════════════════════════════════════════════════════
describe('serverTags store', () => {
  let store

  beforeEach(() => {
    createTestPinia()
    store = useServerTagsStore()
  })

  // ── fetchTags ─────────────────────────────────────────────────────────────
  it('fetchTags populates tags from GET /server-tags', async () => {
    const tags = [
      { id: 1, name: 'critical', color: '#f25f5c', servers: [] },
      { id: 2, name: 'monitored', color: '#3ecf8e', servers: [] },
    ]
    apiClient.get.mockResolvedValueOnce({ data: tags })

    await store.fetchTags()

    expect(apiClient.get).toHaveBeenCalledWith('/server-tags')
    expect(store.tags).toEqual(tags)
    expect(store.loading).toBe(false)
  })

  // ── createTag ─────────────────────────────────────────────────────────────
  it('createTag adds new tag to state after POST', async () => {
    const newTag = { id: 3, name: 'backup', color: '#4f8ef7', servers: [] }
    apiClient.post.mockResolvedValueOnce({ data: newTag })

    const result = await store.createTag('backup', '#4f8ef7')

    expect(apiClient.post).toHaveBeenCalledWith('/server-tags', { name: 'backup', color: '#4f8ef7' })
    expect(store.tags).toContainEqual(newTag)
    expect(result).toEqual(newTag)
  })

  // ── updateTag ─────────────────────────────────────────────────────────────
  it('updateTag replaces matching tag in state after PATCH', async () => {
    store.tags = [{ id: 1, name: 'old', color: '#000', servers: [] }]
    const updated = { id: 1, name: 'renamed', color: '#fff', servers: [] }
    apiClient.patch.mockResolvedValueOnce({ data: updated })

    const result = await store.updateTag(1, { name: 'renamed', color: '#fff' })

    expect(apiClient.patch).toHaveBeenCalledWith('/server-tags/1', { name: 'renamed', color: '#fff' })
    expect(store.tags[0]).toEqual(updated)
    expect(result).toEqual(updated)
  })

  // ── deleteTag ─────────────────────────────────────────────────────────────
  it('deleteTag removes tag from state after DELETE', async () => {
    store.tags = [
      { id: 1, name: 'a', color: '#000', servers: [] },
      { id: 2, name: 'b', color: '#111', servers: [] },
    ]
    apiClient.delete.mockResolvedValueOnce({})

    await store.deleteTag(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-tags/1')
    expect(store.tags).toHaveLength(1)
    expect(store.tags[0].id).toBe(2)
  })

  // ── assignTag ─────────────────────────────────────────────────────────────
  it('assignTag posts and refetches tags', async () => {
    store.tags = [{ id: 5, name: 'critical', color: '#f25f5c', _count: { assignments: 0 } }]
    apiClient.post.mockResolvedValueOnce({ data: { message: 'ok' } })
    // Mock the refetch that happens inside assignTag
    apiClient.get.mockResolvedValueOnce({
      data: [{ id: 5, name: 'critical', color: '#f25f5c', _count: { assignments: 2 } }],
    })

    await store.assignTag(5, [1, 2])

    expect(apiClient.post).toHaveBeenCalledWith('/server-tags/5/assign', { serverIds: [1, 2] })
    expect(store.tags[0]._count.assignments).toBe(2)
  })

  // ── unassignTag ───────────────────────────────────────────────────────────
  it('unassignTag deletes and removes server from local serverIds', async () => {
    store.tags = [
      {
        id: 5,
        name: 'critical',
        color: '#f25f5c',
        serverIds: [1, 2],
        _count: { assignments: 2 },
      },
    ]
    apiClient.delete.mockResolvedValueOnce({})

    await store.unassignTag(5, 1)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-tags/5/servers/1')
    expect(store.tags[0].serverIds).toHaveLength(1)
    expect(store.tags[0].serverIds[0]).toBe(2)
    expect(store.tags[0]._count.assignments).toBe(1)
  })

  // ── tagsForServer getter ──────────────────────────────────────────────────
  it('tagsForServer returns only tags assigned to the given serverId', () => {
    store.tags = [
      { id: 1, name: 'critical', color: '#f25f5c', serverIds: [42] },
      { id: 2, name: 'backup', color: '#4f8ef7', serverIds: [99] },
      { id: 3, name: 'monitored', color: '#3ecf8e', serverIds: [42] },
    ]

    const result = store.tagsForServer(42)

    expect(result).toHaveLength(2)
    expect(result.map((t) => t.id)).toEqual([1, 3])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// serverHealth store
// ═══════════════════════════════════════════════════════════════════════════════
describe('serverHealth store', () => {
  let store

  beforeEach(() => {
    createTestPinia()
    store = useServerHealthStore()
  })

  // ── fetchCurrentHealth ────────────────────────────────────────────────────
  it('fetchCurrentHealth sets currentHealth[serverId] from GET /current', async () => {
    const snapshot = factories.healthSnapshot({ serverId: 7 })
    apiClient.get.mockResolvedValueOnce({ data: snapshot })

    const result = await store.fetchCurrentHealth(7)

    expect(apiClient.get).toHaveBeenCalledWith('/server-health/7/current')
    expect(store.currentHealth[7]).toEqual(snapshot)
    expect(result).toEqual(snapshot)
    expect(store.loading).toBe(false)
  })

  // ── fetchHealthHistory ────────────────────────────────────────────────────
  it('fetchHealthHistory populates snapshots[serverId] from GET /history', async () => {
    const history = [
      factories.healthSnapshot({ id: 'snap1', serverId: 7 }),
      factories.healthSnapshot({ id: 'snap2', serverId: 7 }),
    ]
    apiClient.get.mockResolvedValueOnce({ data: history })

    const result = await store.fetchHealthHistory(7)

    expect(apiClient.get).toHaveBeenCalledWith('/server-health/7/history', { params: { limit: 60 } })
    expect(store.snapshots[7]).toEqual(history)
    expect(result).toEqual(history)
  })

  // ── triggerCollect ────────────────────────────────────────────────────────
  it('triggerCollect posts and updates currentHealth from response', async () => {
    const freshSnapshot = factories.healthSnapshot({ serverId: 3, cpuPercent: 80 })
    apiClient.post.mockResolvedValueOnce({ data: freshSnapshot })

    const result = await store.triggerCollect(3)

    expect(apiClient.post).toHaveBeenCalledWith('/server-health/3/collect')
    expect(store.currentHealth[3]).toEqual(freshSnapshot)
    expect(result).toEqual(freshSnapshot)
  })

  // ── fetchAlerts ───────────────────────────────────────────────────────────
  it('fetchAlerts populates alerts array from GET /alerts', async () => {
    const alertsList = [
      factories.healthAlert({ id: 1 }),
      factories.healthAlert({ id: 2, metric: 'memory', threshold: 80 }),
    ]
    apiClient.get.mockResolvedValueOnce({ data: alertsList })

    const result = await store.fetchAlerts()

    expect(apiClient.get).toHaveBeenCalledWith('/server-health/alerts')
    expect(store.alerts).toEqual(alertsList)
    expect(result).toEqual(alertsList)
  })

  // ── createAlert ───────────────────────────────────────────────────────────
  it('createAlert adds new alert to state after POST', async () => {
    const newAlert = factories.healthAlert({ id: 10, metric: 'disk', threshold: 95 })
    apiClient.post.mockResolvedValueOnce({ data: newAlert })

    const dto = { metric: 'disk', threshold: 95, direction: 'above', serverId: 1 }
    const result = await store.createAlert(dto)

    expect(apiClient.post).toHaveBeenCalledWith('/server-health/alerts', dto)
    expect(store.alerts).toContainEqual(newAlert)
    expect(result).toEqual(newAlert)
  })

  // ── deleteAlert ───────────────────────────────────────────────────────────
  it('deleteAlert removes alert from state after DELETE', async () => {
    store.alerts = [
      factories.healthAlert({ id: 1 }),
      factories.healthAlert({ id: 2 }),
    ]
    apiClient.delete.mockResolvedValueOnce({})

    await store.deleteAlert(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-health/alerts/1')
    expect(store.alerts).toHaveLength(1)
    expect(store.alerts[0].id).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// displayOrder store
// ═══════════════════════════════════════════════════════════════════════════════
describe('displayOrder store', () => {
  let store

  beforeEach(() => {
    createTestPinia()
    store = useDisplayOrderStore()
  })

  // ── fetchOrder('grid') ────────────────────────────────────────────────────
  it('fetchOrder("grid") populates gridOrder from GET response', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [3, 1, 2] })

    await store.fetchOrder('grid')

    expect(apiClient.get).toHaveBeenCalledWith('/server-display-order/grid')
    expect(store.gridOrder).toEqual([3, 1, 2])
    expect(store.loading).toBe(false)
  })

  // ── fetchOrder('sidebar') ─────────────────────────────────────────────────
  it('fetchOrder("sidebar") populates sidebarOrder from GET response', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { orderedServerIds: [5, 4, 6] } })

    await store.fetchOrder('sidebar')

    expect(apiClient.get).toHaveBeenCalledWith('/server-display-order/sidebar')
    expect(store.sidebarOrder).toEqual([5, 4, 6])
  })

  // ── saveOrder ─────────────────────────────────────────────────────────────
  it('saveOrder updates local state immediately (optimistic) and sends PUT', async () => {
    apiClient.put.mockResolvedValueOnce({})

    await store.saveOrder('grid', [10, 20, 30])

    expect(store.gridOrder).toEqual([10, 20, 30])
    expect(apiClient.put).toHaveBeenCalledWith('/server-display-order/grid', {
      orderedServerIds: [10, 20, 30],
    })
  })

  it('saveOrder updates sidebarOrder for sidebar context', async () => {
    apiClient.put.mockResolvedValueOnce({})

    await store.saveOrder('sidebar', [7, 8, 9])

    expect(store.sidebarOrder).toEqual([7, 8, 9])
  })

  // ── applyOrder ────────────────────────────────────────────────────────────
  it('applyOrder returns servers sorted by the stored order', () => {
    store.gridOrder = [3, 1, 2]

    const servers = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
      { id: 3, name: 'Gamma' },
    ]

    const sorted = store.applyOrder(servers, 'grid')

    expect(sorted.map((s) => s.id)).toEqual([3, 1, 2])
  })

  // ── applyOrder with unknown servers ───────────────────────────────────────
  it('applyOrder puts servers not in the order at the end', () => {
    store.gridOrder = [2]

    const servers = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
      { id: 3, name: 'Gamma' },
    ]

    const sorted = store.applyOrder(servers, 'grid')

    expect(sorted[0].id).toBe(2)
    // Servers 1 and 3 are not in the order, so they come after server 2
    const tailIds = sorted.slice(1).map((s) => s.id)
    expect(tailIds).toContain(1)
    expect(tailIds).toContain(3)
  })

  it('applyOrder returns original order when no order is stored', () => {
    store.gridOrder = []

    const servers = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ]

    const sorted = store.applyOrder(servers, 'grid')

    expect(sorted.map((s) => s.id)).toEqual([1, 2])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// multiTerminal store
// ═══════════════════════════════════════════════════════════════════════════════
describe('multiTerminal store', () => {
  let store

  beforeEach(() => {
    createTestPinia()
    store = useMultiTerminalStore()
  })

  // ── initial state ─────────────────────────────────────────────────────────
  it('has correct initial state', () => {
    expect(store.panes).toEqual([])
    expect(store.broadcastMode).toBe(false)
    expect(store.layout).toBe('horizontal')
    expect(store.activePaneId).toBeNull()
    expect(store.paneCount).toBe(0)
  })

  // ── addPane ───────────────────────────────────────────────────────────────
  it('addPane creates a pane with correct properties', () => {
    const server = factories.server({ id: 1, name: 'Test Server' })

    const paneId = store.addPane(server)

    expect(paneId).toBeTruthy()
    expect(store.panes).toHaveLength(1)

    const pane = store.panes[0]
    expect(pane.id).toBe(paneId)
    expect(pane.serverId).toBe(1)
    expect(pane.serverName).toBe('Test Server')
    expect(pane.lines).toEqual([])
    expect(pane.connected).toBe(false)
    expect(pane.socket).toBeDefined()

    expect(createAuthenticatedSocket).toHaveBeenCalledWith('terminal')
  })

  it('addPane sets activePaneId to first pane if none active', () => {
    const server = factories.server({ id: 1 })
    const paneId = store.addPane(server)

    expect(store.activePaneId).toBe(paneId)
  })

  // ── addPane max 6 ─────────────────────────────────────────────────────────
  it('addPane rejects 7th pane by returning null', () => {
    for (let i = 1; i <= 6; i++) {
      store.addPane(factories.server({ id: i, name: `Server ${i}` }))
    }
    expect(store.panes).toHaveLength(6)

    const result = store.addPane(factories.server({ id: 7, name: 'Server 7' }))

    expect(result).toBeNull()
    expect(store.panes).toHaveLength(6)
  })

  // ── removePane ────────────────────────────────────────────────────────────
  it('removePane removes the correct pane and disconnects its socket', () => {
    const s1 = factories.server({ id: 1, name: 'S1' })
    const s2 = factories.server({ id: 2, name: 'S2' })
    const id1 = store.addPane(s1)
    const id2 = store.addPane(s2)

    const removedSocket = store.panes.find((p) => p.id === id1).socket

    store.removePane(id1)

    expect(store.panes).toHaveLength(1)
    expect(store.panes[0].id).toBe(id2)
    expect(removedSocket.disconnect).toHaveBeenCalled()
  })

  it('removePane updates activePaneId when active pane is removed', () => {
    const s1 = factories.server({ id: 1, name: 'S1' })
    const s2 = factories.server({ id: 2, name: 'S2' })
    const id1 = store.addPane(s1)
    const id2 = store.addPane(s2)

    // id1 is the active pane
    expect(store.activePaneId).toBe(id1)

    store.removePane(id1)

    expect(store.activePaneId).toBe(id2)
  })

  // ── setLayout ─────────────────────────────────────────────────────────────
  it('setLayout updates layout and persists to localStorage', () => {
    store.setLayout('vertical')

    expect(store.layout).toBe('vertical')
    expect(localStorage.setItem).toHaveBeenCalledWith('servctl_terminal_layout', 'vertical')
  })

  // ── broadcastMode toggle ──────────────────────────────────────────────────
  it('toggleBroadcastMode flips broadcastMode', () => {
    expect(store.broadcastMode).toBe(false)

    store.toggleBroadcastMode()
    expect(store.broadcastMode).toBe(true)

    store.toggleBroadcastMode()
    expect(store.broadcastMode).toBe(false)
  })

  // ── cleanup ───────────────────────────────────────────────────────────────
  it('cleanup disconnects all sockets and removes all panes', () => {
    const s1 = factories.server({ id: 1, name: 'S1' })
    const s2 = factories.server({ id: 2, name: 'S2' })
    store.addPane(s1)
    store.addPane(s2)

    const sockets = store.panes.map((p) => p.socket)

    store.cleanup()

    expect(store.panes).toHaveLength(0)
    expect(store.activePaneId).toBeNull()
    expect(store.broadcastMode).toBe(false)
    sockets.forEach((s) => {
      expect(s.disconnect).toHaveBeenCalled()
    })
  })
})
