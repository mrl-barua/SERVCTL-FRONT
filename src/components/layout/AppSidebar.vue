<template>
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-text">SERVCTL</div>
      <div class="logo-sub">server control panel</div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">navigation</div>
      <router-link to="/" custom v-slot="{ isActive, navigate }">
        <button
          @click="navigate"
          :class="['nav-item', { active: isActive }]"
        >
          <span class="icon">⬡</span> Overview
          <span class="nav-count">{{ serversStore.totalServers }}</span>
        </button>
      </router-link>

      <router-link to="/terminal" custom v-slot="{ isActive, navigate }">
        <button
          @click="navigate"
          :class="['nav-item', { active: isActive }]"
        >
          <span class="icon">&gt;_</span> Terminal
        </button>
      </router-link>

      <router-link to="/deploy" custom v-slot="{ isActive, navigate }">
        <button
          @click="navigate"
          :class="['nav-item', { active: isActive }]"
        >
          <span class="icon">↑</span> Deploy
        </button>
      </router-link>

      <router-link to="/logs" custom v-slot="{ isActive, navigate }">
        <button
          @click="navigate"
          :class="['nav-item', { active: isActive }]"
        >
          <span class="icon">≡</span> Logs
        </button>
      </router-link>
    </div>

    <div class="sidebar-servers">
      <template v-for="env in envOrder" :key="env">
        <template v-if="serversStore.serversByEnv[env].length > 0">
          <div class="env-group-title">{{ envLabels[env] }}</div>
          <router-link
            v-for="server in serversStore.serversByEnv[env]"
            :key="server.id"
            :to="{ name: 'terminal', query: { serverId: server.id } }"
            custom
            v-slot="{ navigate, isActive }"
          >
            <div
              @click="navigate"
              :class="['server-item', { active: isActive }]"
            >
              <span :class="['s-dot', server.status]"></span>
              {{ server.name }}
            </div>
          </router-link>
        </template>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { onMounted } from 'vue'
import { useServersStore } from '../../stores/servers'

const serversStore = useServersStore()

const envOrder = ['prod', 'live', 'qa', 'test']
const envLabels = {
  prod: 'Production',
  live: 'Live',
  qa: 'QA',
  test: 'Testing',
}

onMounted(async () => {
  if (serversStore.servers.length === 0) {
    await serversStore.fetchServers()
  }
})
</script>

<style scoped>
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--border);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.05em;
}

.logo-sub {
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.sidebar-section {
  padding: 14px 10px 6px;
}

.sidebar-label {
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0 8px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius);
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-mono);
}

.nav-item:hover {
  background: var(--bg3);
  color: var(--text);
}

.nav-item.active {
  background: var(--bg4);
  color: var(--accent);
}

.nav-item .icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-count {
  margin-left: auto;
  font-size: 10px;
  background: var(--bg4);
  color: var(--text3);
  padding: 1px 6px;
  border-radius: 99px;
}

.sidebar-servers {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

.env-group-title {
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 8px 4px;
}

.server-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius);
  font-size: 11px;
  color: var(--text2);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  text-decoration: none;
}

.server-item:hover {
  background: var(--bg3);
  color: var(--text);
}

.server-item.active {
  background: var(--bg4);
  color: var(--text);
}

.s-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.s-dot.online {
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.s-dot.offline {
  background: var(--red);
}

.s-dot.unknown {
  background: var(--gray);
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 6px var(--green);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 12px var(--green);
  }
}
</style>
