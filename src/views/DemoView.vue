<template>
  <div class="demo-page">
    <div class="demo-banner">
      <span>
        You are exploring the SERVCTL demo in read-only mode. Resets every 30
        min.
      </span>
      <RouterLink to="/login" class="signup">Sign Up Free</RouterLink>
      <a
        class="guide"
        href="https://github.com/mrl-barua/SERVCTL-FRONT"
        target="_blank"
        rel="noreferrer"
      >
        Self-host Guide
      </a>
    </div>

    <div class="app">
      <aside class="sidebar">
        <div class="logo">
          <RouterLink to="/">
            <span class="logo-main">SERVCTL</span>
            <span class="demo-pill">DEMO</span>
          </RouterLink>
          <div class="logo-sub">server control panel</div>
        </div>

        <div class="side-label">Navigation</div>
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-btn"
          :class="{ active: state.view === item.id }"
          type="button"
          @click="switchView(item.id)"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'overview'" class="nav-count">{{
            state.servers.length
          }}</span>
        </button>

        <div class="server-list">
          <template v-for="group in groupedServers" :key="group.env">
            <div class="env-title">{{ group.title }}</div>
            <button
              v-for="server in group.items"
              :key="server.id"
              class="server-item"
              :class="{ selected: state.selectedServerId === server.id }"
              type="button"
              @click="state.selectedServerId = server.id"
            >
              <span
                class="status-dot"
                :class="`status-${server.status}`"
              ></span>
              <span>{{ server.name }}</span>
            </button>
          </template>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="topbar-title">{{ viewTitle }}</div>
          <div class="tb-actions">
            <button class="tb-btn" type="button" @click="pingAll">
              ping all
            </button>
            <button
              class="tb-btn primary"
              type="button"
              @click="openDemoGate()"
            >
              + add server
            </button>
            <div class="reset-timer">
              Demo resets in {{ formatTimer(state.resetInSeconds) }}
            </div>
          </div>
        </div>

        <div class="content">
          <section v-if="state.view === 'overview'">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">total servers</div>
                <div class="stat-value">{{ counts.total }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">online</div>
                <div class="stat-value">{{ counts.online }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">offline</div>
                <div class="stat-value">{{ counts.offline }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">unknown</div>
                <div class="stat-value">{{ counts.unknown }}</div>
              </div>
            </div>

            <div class="cards-grid">
              <article
                v-for="server in state.servers"
                :key="server.id"
                class="server-card"
                :class="`env-${server.environment}`"
              >
                <div class="card-top">
                  <div>
                    <div class="card-name">{{ server.name }}</div>
                    <div class="card-host">
                      {{ server.user }}@{{ server.host }}:{{ server.port }}
                    </div>
                  </div>
                  <span class="env-badge">{{ server.environment }}</span>
                </div>

                <div class="card-status">
                  <span
                    class="status-dot"
                    :class="`status-${server.status}`"
                  ></span>
                  <span class="status-text">{{ server.status }}</span>
                  <span>uptime {{ server.uptime }}%</span>
                </div>

                <div class="uptime">
                  <span :style="{ width: `${server.uptime}%` }"></span>
                </div>

                <div class="actions">
                  <button
                    class="card-btn"
                    type="button"
                    @click="openDemoGate(sshMsg(server.name))"
                  >
                    SSH
                  </button>
                  <button
                    class="card-btn"
                    type="button"
                    @click="copySsh(server)"
                  >
                    copy cmd
                  </button>
                  <button
                    class="card-btn"
                    type="button"
                    @click="openDemoGate()"
                  >
                    deploy
                  </button>
                  <button
                    class="card-btn"
                    type="button"
                    @click="switchToLogs(server.id)"
                  >
                    logs
                  </button>
                  <button
                    class="card-btn"
                    type="button"
                    @click="openDemoGate()"
                  >
                    delete
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="state.view === 'terminal'" class="terminal-box">
            <div class="terminal-toolbar">
              <span>Connected to {{ selectedServer?.name || "n/a" }}</span>
              <div class="spacer"></div>
              <button
                v-for="cmd in quickCmds"
                :key="cmd"
                class="tb-btn"
                type="button"
                @click="runTerminal(cmd)"
              >
                {{ cmd }}
              </button>
            </div>
            <div class="terminal-screen" ref="terminalScreen">
              <div
                v-for="(line, idx) in state.terminalLines"
                :key="idx"
                :class="`line-${line.type}`"
              >
                {{ line.text }}
              </div>
            </div>
            <form class="terminal-input-row" @submit.prevent="submitTerminal">
              <span class="prompt-label">$</span>
              <input
                v-model="state.terminalInput"
                class="terminal-input"
                type="text"
                placeholder="Type a command and press Enter"
              />
              <button class="tb-btn" type="submit">Run</button>
            </form>
          </section>

          <section v-if="state.view === 'logs'" class="logs-box">
            <div class="logs-toolbar">
              <select v-model="state.logLevelFilter">
                <option value="ALL">ALL</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
                <option value="OK">OK</option>
              </select>
              <input
                v-model="state.logQuery"
                type="text"
                placeholder="Filter logs"
              />
            </div>
            <div class="logs-list">
              <div v-if="filteredLogs.length === 0" class="empty">
                No logs match current filters.
              </div>
              <div v-for="log in filteredLogs" :key="log.id" class="log-row">
                <div class="log-ts">{{ log.ts }}</div>
                <div class="log-lvl" :class="`lvl-${log.level}`">
                  {{ log.level }}
                </div>
                <div class="log-msg">{{ log.message }}</div>
              </div>
            </div>
          </section>

          <section v-if="state.view === 'deploy'" class="deploy-grid">
            <article
              v-for="server in state.servers"
              :key="server.id"
              class="deploy-card"
            >
              <div class="deploy-head">
                <div>
                  <div class="deploy-name">{{ server.name }}</div>
                  <div class="deploy-script">
                    deploy/{{ server.environment }}.yml
                  </div>
                </div>
                <span class="deploy-status">idle</span>
              </div>
              <ol class="deploy-steps">
                <li v-for="step in deploySteps" :key="step">{{ step }}</li>
              </ol>
              <button
                class="tb-btn primary"
                type="button"
                @click="openDemoGate()"
              >
                Start deploy
              </button>
            </article>
          </section>
        </div>
      </main>
    </div>

    <div class="toast-wrap">
      <div v-for="toast in state.toasts" :key="toast.id" class="toast">
        {{ toast.message }}
      </div>
    </div>

    <div
      class="modal-overlay"
      :class="{ open: state.demoGateOpen }"
      @click.self="closeDemoGate"
    >
      <div class="modal">
        <h3 class="modal-title">Demo is intentionally sandboxed</h3>
        <div class="modal-body">{{ state.demoGateMessage }}</div>
        <div class="modal-actions">
          <RouterLink class="primary" to="/login"
            >Sign Up and Self-host</RouterLink
          >
          <a
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
            >View Setup Guide</a
          >
        </div>
        <button class="modal-close" type="button" @click="closeDemoGate">
          Continue exploring demo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from "vue";
import { RouterLink } from "vue-router";

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "terminal", label: "Terminal" },
  { id: "deploy", label: "Deploy" },
  { id: "logs", label: "Logs" },
];

const deploySteps = [
  "Validate config",
  "Pull source",
  "Install deps",
  "Build",
  "Restart service",
  "Health checks",
];
const quickCmds = ["uptime", "df -h", "free -m", "systemctl status nginx"];

const seedServers = [
  {
    id: "srv-1",
    name: "web-prod-01",
    environment: "prod",
    host: "10.0.1.10",
    port: 22,
    user: "ubuntu",
    status: "online",
    uptime: 99.8,
  },
  {
    id: "srv-2",
    name: "db-prod-01",
    environment: "prod",
    host: "10.0.1.11",
    port: 22,
    user: "ubuntu",
    status: "online",
    uptime: 99.9,
  },
  {
    id: "srv-3",
    name: "web-live-01",
    environment: "live",
    host: "10.0.2.10",
    port: 22,
    user: "ubuntu",
    status: "online",
    uptime: 97.2,
  },
  {
    id: "srv-4",
    name: "web-qa-01",
    environment: "qa",
    host: "10.0.3.10",
    port: 22,
    user: "ubuntu",
    status: "online",
    uptime: 94.1,
  },
  {
    id: "srv-5",
    name: "api-qa-01",
    environment: "qa",
    host: "10.0.3.11",
    port: 22,
    user: "ubuntu",
    status: "unknown",
    uptime: 87.5,
  },
  {
    id: "srv-6",
    name: "dev-test-01",
    environment: "test",
    host: "10.0.4.10",
    port: 2222,
    user: "dev",
    status: "online",
    uptime: 78,
  },
  {
    id: "srv-7",
    name: "load-test-01",
    environment: "test",
    host: "10.0.4.11",
    port: 22,
    user: "dev",
    status: "offline",
    uptime: 0,
  },
];

const logSamples = [
  "HTTP 200 GET /health in 12ms",
  "Deploy pipeline waiting for artifact approval",
  "Nginx worker recycled after config update",
  "Redis cache hit ratio 97%",
  "Disk usage warning on /var/log",
  "SSH handshake accepted from 10.2.0.8",
];

const terminalScreen = ref(null);
const resetStart = 30 * 60;

const state = reactive({
  view: "overview",
  servers: structuredClone(seedServers),
  selectedServerId: seedServers[0].id,
  terminalLines: [
    {
      type: "prompt",
      text: "demo@sandbox:~$ Welcome to SERVCTL demo terminal",
    },
    {
      type: "output",
      text: "Read-only mode: commands are simulated for preview.",
    },
  ],
  terminalInput: "",
  logs: [],
  logLevelFilter: "ALL",
  logQuery: "",
  resetInSeconds: resetStart,
  demoGateOpen: false,
  demoGateMessage:
    "The live demo is read-only and sandboxed. To use SSH, deploy pipelines, and add your own servers, self-host SERVCTL in your own environment.",
  toasts: [],
});

let timerHandle = null;
let logTailHandle = null;

const selectedServer = computed(
  () => state.servers.find((s) => s.id === state.selectedServerId) || null,
);

const groupedServers = computed(() => {
  const groups = [
    { env: "prod", title: "Production" },
    { env: "live", title: "Live" },
    { env: "qa", title: "QA" },
    { env: "test", title: "Testing" },
  ];

  return groups.map((group) => ({
    ...group,
    items: state.servers.filter((server) => server.environment === group.env),
  }));
});

const counts = computed(() => ({
  total: state.servers.length,
  online: state.servers.filter((s) => s.status === "online").length,
  offline: state.servers.filter((s) => s.status === "offline").length,
  unknown: state.servers.filter((s) => s.status === "unknown").length,
}));

const viewTitle = computed(() => {
  if (state.view === "overview") return "Overview";
  if (state.view === "terminal") return "Terminal";
  if (state.view === "deploy") return "Deploy";
  return "Logs";
});

const filteredLogs = computed(() => {
  const query = state.logQuery.trim().toLowerCase();
  return state.logs.filter((entry) => {
    const levelOk =
      state.logLevelFilter === "ALL" || entry.level === state.logLevelFilter;
    const queryOk = !query || entry.message.toLowerCase().includes(query);
    return levelOk && queryOk;
  });
});

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function showToast(message) {
  const toast = { id: `${Date.now()}-${Math.random()}`, message };
  state.toasts.push(toast);
  setTimeout(() => {
    state.toasts = state.toasts.filter((item) => item.id !== toast.id);
  }, 2100);
}

function openDemoGate(customMessage) {
  state.demoGateMessage =
    customMessage ||
    "The live demo is read-only and sandboxed. To use SSH, deploy pipelines, and add your own servers, self-host SERVCTL in your own environment.";
  state.demoGateOpen = true;
}

function closeDemoGate() {
  state.demoGateOpen = false;
}

function switchView(viewName) {
  state.view = viewName;
}

function switchToLogs(serverId) {
  state.selectedServerId = serverId;
  state.view = "logs";
}

function sshMsg(serverName) {
  return `Direct SSH is disabled in demo mode for safety.\n\nTo run real commands on ${serverName}, sign up and self-host SERVCTL.`;
}

async function copySsh(server) {
  const command = `ssh ${server.user}@${server.host} -p ${server.port}`;
  try {
    await navigator.clipboard.writeText(command);
    showToast("SSH command copied");
  } catch {
    showToast("Could not copy command");
  }
}

function pushTerminal(type, text) {
  state.terminalLines.push({ type, text });
  nextTick(() => {
    if (terminalScreen.value) {
      terminalScreen.value.scrollTop = terminalScreen.value.scrollHeight;
    }
  });
}

function runTerminal(command) {
  const server = selectedServer.value;
  pushTerminal("prompt", `demo@${server?.name || "sandbox"}:~$ ${command}`);

  if (/^sudo\s+/i.test(command)) {
    pushTerminal("error", "sudo is blocked in demo mode.");
    return;
  }

  if (command === "uptime") {
    pushTerminal("output", "up 42 days, 06:11, load average: 0.12 0.08 0.05");
    return;
  }

  if (command === "df -h") {
    pushTerminal("output", "/dev/sda1 50G 18G 30G 38% /");
    return;
  }

  if (command === "free -m") {
    pushTerminal("output", "Mem: 4096 total, 1932 used, 2164 free");
    return;
  }

  if (command === "systemctl status nginx") {
    pushTerminal("output", "nginx.service active (running)");
    return;
  }

  pushTerminal("output", `Executed in sandbox: ${command}`);
}

function submitTerminal() {
  const cmd = state.terminalInput.trim();
  if (!cmd) return;
  runTerminal(cmd);
  state.terminalInput = "";
}

function logLevelFromRandom() {
  const levels = ["INFO", "WARN", "ERROR", "DEBUG", "OK"];
  return levels[Math.floor(Math.random() * levels.length)];
}

function addLog(message, level) {
  state.logs.unshift({
    id: `${Date.now()}-${Math.random()}`,
    ts: new Date().toLocaleTimeString(),
    level,
    message,
  });

  if (state.logs.length > 300) {
    state.logs = state.logs.slice(0, 300);
  }
}

function seedLogs() {
  for (let i = 0; i < 18; i += 1) {
    const server = state.servers[i % state.servers.length];
    const msg = logSamples[i % logSamples.length];
    const level = logLevelFromRandom();
    addLog(`${server.name}: ${msg}`, level);
  }
}

function pingAll() {
  state.servers = state.servers.map((server) => {
    const roll = Math.random();
    let status = "online";
    if (roll > 0.9) status = "offline";
    else if (roll > 0.78) status = "unknown";
    return { ...server, status };
  });
  showToast("Ping completed across all demo servers");
}

onMounted(() => {
  seedLogs();

  timerHandle = setInterval(() => {
    state.resetInSeconds -= 1;
    if (state.resetInSeconds <= 0) {
      state.resetInSeconds = resetStart;
      state.servers = structuredClone(seedServers);
      state.logs = [];
      seedLogs();
      showToast("Demo sandbox reset complete");
    }
  }, 1000);

  logTailHandle = setInterval(() => {
    const server =
      state.servers[Math.floor(Math.random() * state.servers.length)];
    const msg = logSamples[Math.floor(Math.random() * logSamples.length)];
    addLog(`${server.name}: ${msg}`, logLevelFromRandom());
  }, 3000);
});

onBeforeUnmount(() => {
  clearInterval(timerHandle);
  clearInterval(logTailHandle);
});
</script>

<style scoped>
.demo-page {
  --bg: #0d0f14;
  --bg2: #13161e;
  --bg3: #1a1e28;
  --bg4: #222636;
  --border: #2a2f3f;
  --border2: #363c52;
  --text: #e8eaf0;
  --text2: #8b90a8;
  --text3: #555a72;
  --accent: #4f8ef7;
  --accent2: #2d5bb5;
  --green: #3ecf8e;
  --yellow: #f5a623;
  --red: #f25f5c;
  --radius: 8px;
  --radius-lg: 12px;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.demo-banner {
  position: fixed;
  inset: 0 0 auto 0;
  height: 36px;
  z-index: 120;
  border-bottom: 1px solid var(--accent2);
  background: linear-gradient(90deg, #0d1a2b, #13161e, #0d1a2b);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 10px;
  color: var(--text2);
  padding: 0 8px;
}

.signup {
  color: var(--accent);
}

.guide {
  color: var(--text2);
}

.app {
  margin-top: 36px;
  display: flex;
  min-height: calc(100vh - 36px);
}

.sidebar {
  width: 230px;
  border-right: 1px solid var(--border);
  background: var(--bg2);
  display: flex;
  flex-direction: column;
}

.logo {
  border-bottom: 1px solid var(--border);
  padding: 14px;
}

.logo a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.logo-main {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.demo-pill {
  font-size: 9px;
  color: var(--yellow);
  border: 1px solid var(--yellow);
  border-radius: 999px;
  padding: 2px 7px;
}

.logo-sub,
.side-label,
.env-title {
  color: var(--text3);
  font-size: 10px;
}

.side-label {
  padding: 12px 10px 6px;
  text-transform: uppercase;
}

.nav-btn,
.server-item,
.tb-btn,
.card-btn,
.modal-close {
  font-family: inherit;
}

.nav-btn {
  width: calc(100% - 16px);
  margin: 0 8px 6px;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text2);
  text-align: left;
  font-size: 12px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.nav-btn.active {
  background: var(--bg4);
  color: var(--accent);
}

.nav-count {
  margin-left: auto;
  font-size: 10px;
  color: var(--text3);
}

.server-list {
  overflow-y: auto;
  padding: 10px;
  flex: 1;
}

.server-item {
  width: 100%;
  border: none;
  border-radius: var(--radius);
  padding: 6px 8px;
  background: transparent;
  color: var(--text2);
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.server-item.selected,
.server-item:hover {
  background: var(--bg3);
  color: var(--text);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.status-online {
  background: var(--green);
  box-shadow: 0 0 8px rgba(62, 207, 142, 0.6);
}

.status-offline {
  background: var(--red);
}

.status-unknown {
  background: var(--text3);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 54px;
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
}

.topbar-title {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
}

.tb-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tb-btn {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text2);
  font-size: 11px;
  padding: 6px 11px;
  cursor: pointer;
}

.tb-btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.reset-timer {
  color: var(--text3);
  font-size: 11px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card,
.server-card,
.terminal-box,
.logs-box,
.deploy-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg2);
}

.stat-card {
  padding: 14px;
}

.stat-label {
  color: var(--text3);
  font-size: 10px;
  text-transform: uppercase;
}

.stat-value {
  margin-top: 8px;
  font-size: 21px;
  font-weight: 600;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 10px;
}

.server-card {
  padding: 14px;
}

.card-top {
  display: flex;
  gap: 8px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
}

.card-host {
  font-size: 10px;
  color: var(--text3);
}

.env-badge {
  margin-left: auto;
  font-size: 9px;
  border: 1px solid var(--border2);
  border-radius: 999px;
  padding: 2px 8px;
  color: var(--text2);
}

.card-status {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
}

.uptime {
  margin-top: 8px;
  height: 3px;
  border-radius: 2px;
  background: var(--bg4);
}

.uptime span {
  display: block;
  height: 100%;
  background: var(--green);
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-btn {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg4);
  color: var(--text2);
  font-size: 10px;
  padding: 4px 9px;
  cursor: pointer;
}

.terminal-toolbar,
.logs-toolbar,
.deploy-head {
  border-bottom: 1px solid var(--border);
  background: var(--bg3);
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.spacer {
  flex: 1;
}

.terminal-screen,
.logs-list {
  background: #0a0c10;
  padding: 12px;
}

.terminal-screen {
  min-height: 230px;
  max-height: 350px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.75;
}

.line-prompt {
  color: var(--accent);
}

.line-output {
  color: var(--text2);
}

.line-error {
  color: var(--red);
}

.terminal-input-row {
  border-top: 1px solid var(--border);
  background: #0a0c10;
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.prompt-label {
  color: var(--accent);
}

.terminal-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  outline: none;
}

.logs-toolbar select,
.logs-toolbar input {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg2);
  color: var(--text);
  font-size: 11px;
  padding: 6px 8px;
}

.logs-toolbar input {
  min-width: 220px;
}

.logs-list {
  max-height: 480px;
  overflow-y: auto;
  font-size: 11px;
}

.log-row {
  display: flex;
  gap: 8px;
  line-height: 1.8;
}

.log-ts {
  min-width: 120px;
  color: var(--text3);
}

.log-lvl {
  min-width: 50px;
  font-weight: 600;
}

.lvl-INFO {
  color: var(--accent);
}

.lvl-WARN {
  color: var(--yellow);
}

.lvl-ERROR {
  color: var(--red);
}

.lvl-DEBUG {
  color: var(--text3);
}

.lvl-OK {
  color: var(--green);
}

.log-msg {
  color: var(--text2);
}

.empty {
  color: var(--text3);
  text-align: center;
  padding: 20px;
}

.deploy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.deploy-card {
  padding: 14px;
}

.deploy-name {
  font-size: 13px;
  font-weight: 600;
}

.deploy-script,
.deploy-status {
  color: var(--text3);
  font-size: 10px;
}

.deploy-status {
  margin-left: auto;
}

.deploy-steps {
  margin: 10px 0;
  padding-left: 18px;
  color: var(--text2);
  font-size: 11px;
}

.toast-wrap {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 180;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text2);
  font-size: 11px;
  padding: 9px 11px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.modal-overlay.open {
  display: flex;
}

.modal {
  width: min(460px, 100%);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  background: var(--bg2);
  padding: 18px;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 18px;
}

.modal-body {
  white-space: pre-line;
  color: var(--text2);
  font-size: 12px;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-actions a,
.modal-close {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg3);
  color: var(--text2);
  font-size: 11px;
  padding: 8px 10px;
  text-decoration: none;
}

.modal-actions .primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.modal-close {
  margin-top: 10px;
  cursor: pointer;
}

@media (max-width: 980px) {
  .sidebar {
    display: none;
  }
}
</style>
