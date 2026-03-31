import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'

/**
 * Create a fresh Pinia instance for each test
 */
export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Mock apiClient for store tests
 */
export function mockApiClient() {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return mock
}

/**
 * Sample test data factories
 */
export const factories = {
  server(overrides = {}) {
    return {
      id: 1,
      name: 'Test Server',
      host: '192.168.1.1',
      user: 'ubuntu',
      port: 22,
      env: 'prod',
      notes: 'test server',
      status: 'online',
      uptime: 99.5,
      authMethod: 'password',
      networkType: 'private',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      groupMemberships: [],
      tagAssignments: [],
      ...overrides,
    }
  },

  serverGroup(overrides = {}) {
    return {
      id: 1,
      name: 'Production Cluster',
      color: '#f25f5c',
      sortOrder: 0,
      _count: { members: 3 },
      ...overrides,
    }
  },

  serverTag(overrides = {}) {
    return {
      id: 1,
      name: 'critical',
      color: '#f25f5c',
      _count: { assignments: 2 },
      ...overrides,
    }
  },

  healthSnapshot(overrides = {}) {
    return {
      id: 'snap1',
      serverId: 1,
      cpuPercent: 45.2,
      memPercent: 62.8,
      diskPercent: 33.1,
      memTotalMb: 8192,
      memUsedMb: 5144,
      diskTotalGb: 100,
      diskUsedGb: 33.1,
      loadAvg1: 1.2,
      loadAvg5: 0.8,
      loadAvg15: 0.5,
      createdAt: '2026-03-31T12:00:00Z',
      ...overrides,
    }
  },

  healthAlert(overrides = {}) {
    return {
      id: 1,
      serverId: 1,
      metric: 'cpu',
      threshold: 90,
      direction: 'above',
      active: true,
      ...overrides,
    }
  },

  user(overrides = {}) {
    return {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      provider: 'local',
      ...overrides,
    }
  },
}
