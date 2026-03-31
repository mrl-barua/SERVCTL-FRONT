import { defineStore } from 'pinia'
import apiClient from '../services/http'

export interface ServerGroup {
  id: number
  name: string
  color: string
  sortOrder: number
  serverIds?: number[]
  _count?: { members: number }
  createdAt?: string
  updatedAt?: string
}

export const useServerGroupsStore = defineStore('serverGroups', {
  state: () => ({
    groups: [] as ServerGroup[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    groupsForServer: (state) => (serverId: number) => {
      return state.groups.filter((g) => g.serverIds?.includes(serverId))
    },
  },

  actions: {
    async fetchGroups() {
      this.loading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/server-groups')
        this.groups = data
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to load server groups'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createGroup(name: string, color: string) {
      this.error = null
      try {
        const { data } = await apiClient.post('/server-groups', { name, color })
        this.groups.push(data)
        return data as ServerGroup
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to create server group'
        throw err
      }
    },

    async updateGroup(id: number, updates: Partial<Pick<ServerGroup, 'name' | 'color'>>) {
      this.error = null
      try {
        const { data } = await apiClient.patch(`/server-groups/${id}`, updates)
        const idx = this.groups.findIndex((g) => g.id === id)
        if (idx !== -1) {
          this.groups[idx] = data
        }
        return data as ServerGroup
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to update server group'
        throw err
      }
    },

    async deleteGroup(id: number) {
      this.error = null
      try {
        await apiClient.delete(`/server-groups/${id}`)
        this.groups = this.groups.filter((g) => g.id !== id)
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to delete server group'
        throw err
      }
    },

    async addServersToGroup(groupId: number, serverIds: number[]) {
      this.error = null
      try {
        await apiClient.post(
          `/server-groups/${groupId}/servers`,
          { serverIds },
        )
        // Refetch all groups to get updated counts and serverIds
        await this.fetchGroups()
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to add servers to group'
        throw err
      }
    },

    async removeServerFromGroup(groupId: number, serverId: number) {
      this.error = null
      try {
        await apiClient.delete(
          `/server-groups/${groupId}/servers/${serverId}`,
        )
        // Update local state immediately for responsiveness
        const group = this.groups.find((g) => g.id === groupId)
        if (group) {
          group.serverIds = (group.serverIds ?? []).filter((id) => id !== serverId)
          if (group._count) {
            group._count.members = Math.max(0, (group._count.members ?? 0) - 1)
          }
        }
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to remove server from group'
        throw err
      }
    },

    async reorderGroups(orderedIds: number[]) {
      this.error = null
      try {
        await apiClient.patch('/server-groups/reorder', { orderedIds })
        const orderMap = new Map<number, number>()
        orderedIds.forEach((id, index) => orderMap.set(id, index))
        this.groups = [...this.groups]
          .map((g) => ({
            ...g,
            sortOrder: orderMap.get(g.id) ?? g.sortOrder,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to reorder server groups'
        throw err
      }
    },
  },
})
