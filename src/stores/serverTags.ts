import { defineStore } from 'pinia'
import apiClient from '../services/http'

export interface ServerTagAssignment {
  id: number
  serverId: number
  tagId: number
}

export interface ServerTag {
  id: number
  name: string
  color: string
  servers: ServerTagAssignment[]
  createdAt?: string
  updatedAt?: string
}

export const useServerTagsStore = defineStore('serverTags', {
  state: () => ({
    tags: [] as ServerTag[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    tagsForServer: (state) => (serverId: number) => {
      return state.tags.filter((t) =>
        t.servers?.some((s) => s.serverId === serverId),
      )
    },
  },

  actions: {
    async fetchTags() {
      this.loading = true
      this.error = null
      try {
        const { data } = await apiClient.get('/server-tags')
        this.tags = data
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to load server tags'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createTag(name: string, color: string) {
      this.error = null
      try {
        const { data } = await apiClient.post('/server-tags', { name, color })
        this.tags.push(data)
        return data as ServerTag
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to create server tag'
        throw err
      }
    },

    async updateTag(id: number, updates: Partial<Pick<ServerTag, 'name' | 'color'>>) {
      this.error = null
      try {
        const { data } = await apiClient.patch(`/server-tags/${id}`, updates)
        const idx = this.tags.findIndex((t) => t.id === id)
        if (idx !== -1) {
          this.tags[idx] = data
        }
        return data as ServerTag
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to update server tag'
        throw err
      }
    },

    async deleteTag(id: number) {
      this.error = null
      try {
        await apiClient.delete(`/server-tags/${id}`)
        this.tags = this.tags.filter((t) => t.id !== id)
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to delete server tag'
        throw err
      }
    },

    async assignTag(tagId: number, serverIds: number[]) {
      this.error = null
      try {
        const { data } = await apiClient.post(
          `/server-tags/${tagId}/assign`,
          { serverIds },
        )
        const idx = this.tags.findIndex((t) => t.id === tagId)
        if (idx !== -1) {
          this.tags[idx] = data
        }
        return data as ServerTag
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to assign server tag'
        throw err
      }
    },

    async unassignTag(tagId: number, serverId: number) {
      this.error = null
      try {
        await apiClient.delete(
          `/server-tags/${tagId}/servers/${serverId}`,
        )
        const tag = this.tags.find((t) => t.id === tagId)
        if (tag) {
          tag.servers = tag.servers.filter((s) => s.serverId !== serverId)
        }
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || 'Failed to unassign server tag'
        throw err
      }
    },
  },
})
