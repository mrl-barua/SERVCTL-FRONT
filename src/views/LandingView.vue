<template>
  <div class="landing">
    <header class="top-nav">
      <div class="container top-nav-inner">
        <div class="brand" aria-label="SERVCTL home">
          <span class="brand-word">SERVCTL</span>
          <span class="version-pill">v0.1.0</span>
        </div>

        <nav class="nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#docs">Docs</a>
          <a href="#install">Self-host</a>
          <a href="#changelog">Changelog</a>
        </nav>

        <div class="nav-right">
          <a
            class="star-btn"
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
            aria-label="Star on GitHub"
            role="link"
          >
            <span class="star-icon">★</span>
            <span>Star</span>
            <span class="star-count">1.2k</span>
          </a>
          <RouterLink class="nav-cta" to="/login">Get Started</RouterLink>
        </div>
      </div>
    </header>

    <!-- ─── HERO ─── -->
    <section class="hero" id="hero">
      <div class="container hero-content">
        <div class="env-tag">[ open source / self-hostable / MIT ]</div>

        <h1 class="hero-title">
          Your servers.<br />
          Under <span class="control">control</span><span class="dot">.</span>
        </h1>

        <p class="subheadline">
          SSH access <span class="sep">·</span> deploy pipelines
          <span class="sep">·</span> live logs <span class="sep">·</span> zero
          vendor lock-in
        </p>

        <div class="cta-row">
          <span class="cta-primary-wrap">
            <RouterLink
              class="btn-primary"
              to="/demo"
              aria-label="Try the live demo, no login required"
              >→ Try Live Demo</RouterLink
            >
            <span class="cta-meta">no login required</span>
          </span>
          <RouterLink
            class="btn-secondary"
            to="/login"
            aria-label="Self-host SERVCTL for free"
            >⬡ Self-host Free</RouterLink
          >
          <a
            class="btn-ghost"
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
            aria-label="Star SERVCTL on GitHub"
          >
            Star on GitHub
          </a>
        </div>

        <div class="demo-proof">
          Live demo has 7 pre-loaded servers and resets every 30 minutes
        </div>

        <div class="terminal-card" aria-label="Terminal preview">
          <div class="terminal-bar">
            <span class="td td-red"></span>
            <span class="td td-yellow"></span>
            <span class="td td-green"></span>
            <span class="term-title-label">servctl-terminal-preview</span>
          </div>
          <div class="terminal-body" aria-hidden="true">
            <div class="tline">
              <span class="tprompt">ubuntu@web-prod-01:~$</span>
              <span class="tcmd"> uptime</span>
            </div>
            <div class="tline tout">
              14:32:01 up 42 days, 6:11, 1 user, load average: 0.12, 0.08, 0.05
            </div>
            <div class="tline">
              <span class="tprompt">ubuntu@web-prod-01:~$</span>
              <span class="tcmd"> df -h /</span>
            </div>
            <div class="tline tout">
              Filesystem&nbsp;&nbsp;&nbsp;Size&nbsp; Used Avail Use%
            </div>
            <div class="tline tout">
              /dev/sda1&nbsp;&nbsp;&nbsp;&nbsp; 50G&nbsp;&nbsp; 18G&nbsp;&nbsp;
              30G&nbsp; 38% /
            </div>
            <div class="tline">
              <span class="tprompt">ubuntu@web-prod-01:~$</span>
              <span class="tcmd"> sudo systemctl status nginx</span>
            </div>
            <div class="tline tout">
              ● nginx.service - A high performance web server
            </div>
            <div class="tline tout">
              &nbsp;&nbsp; Loaded: loaded (/lib/systemd/system/nginx.service)
            </div>
            <div class="tline">
              <span class="tout">&nbsp;&nbsp; Active: </span>
              <span class="tok">active (running)</span>
              <span class="tout"> since Mon 2025-01-06; 42 days ago</span>
            </div>
            <div class="tline">
              <span class="tprompt">ubuntu@web-prod-01:~$</span>
              <span class="tcursor">_</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── INTERACTIVE FEATURE SHOWCASE ─── -->
    <section
      class="features-showcase"
      id="features"
      role="region"
      aria-label="Key features"
    >
      <div class="container">
        <p class="section-label">FEATURES</p>
        <h2 class="section-title">Everything you need to manage servers.</h2>
        <div class="showcase-layout">
          <div class="showcase-tabs">
            <button
              v-for="(feat, i) in features"
              :key="feat.id"
              class="showcase-tab"
              :class="{ active: activeFeature === i }"
              @click="activeFeature = i"
            >
              <span class="tab-icon">{{ feat.icon }}</span>
              <div class="tab-text">
                <span class="tab-title">{{ feat.title }}</span>
                <span class="tab-desc">{{ feat.desc }}</span>
              </div>
            </button>
          </div>
          <div class="showcase-preview">
            <div class="terminal-card showcase-terminal">
              <div class="terminal-bar">
                <span class="td td-red"></span>
                <span class="td td-yellow"></span>
                <span class="td td-green"></span>
                <span class="term-title-label">{{ features[activeFeature].previewTitle }}</span>
              </div>
              <div class="terminal-body">
                <div
                  v-for="(line, li) in features[activeFeature].previewLines"
                  :key="li"
                  class="tline"
                >
                  <span v-if="line.prompt" class="tprompt">{{ line.prompt }}</span>
                  <span v-if="line.cmd" class="tcmd"> {{ line.cmd }}</span>
                  <span v-if="line.out" class="tout">{{ line.out }}</span>
                  <span v-if="line.ok" class="tok">{{ line.ok }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section class="how-it-works" id="how-it-works">
      <div class="container">
        <p class="section-label">HOW IT WORKS</p>
        <h2 class="section-title">Up and running in 3 steps.</h2>
        <div class="steps-grid">
          <div class="step" v-for="(step, i) in steps" :key="i">
            <div class="step-number">{{ i + 1 }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
          <div class="step-connector" aria-hidden="true"></div>
        </div>
      </div>
    </section>

    <!-- ─── WHO IT'S FOR ─── -->
    <section class="who-section">
      <div class="container">
        <p class="section-label">WHO IT'S FOR</p>
        <h2 class="section-title">Built for people who ship.</h2>
        <div class="persona-grid">
          <article class="persona-card" v-for="p in personas" :key="p.title">
            <span class="persona-icon">{{ p.icon }}</span>
            <h3 class="persona-title">{{ p.title }}</h3>
            <p class="persona-desc">{{ p.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ─── COMPARISON TABLE ─── -->
    <section class="compare-section">
      <div class="container">
        <p class="section-label">COMPARISON</p>
        <h2 class="section-title">How SERVCTL stacks up.</h2>
        <div class="table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th class="feature-col">Feature</th>
                <th class="highlight-col">SERVCTL</th>
                <th>Portainer</th>
                <th>Raw SSH</th>
                <th>Ansible</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareRows" :key="row.feature">
                <td class="feature-col">{{ row.feature }}</td>
                <td class="highlight-col">
                  <span :class="cellClass(row.servctl)">{{ cellIcon(row.servctl) }}</span>
                </td>
                <td>
                  <span :class="cellClass(row.portainer)">{{ cellIcon(row.portainer) }}</span>
                </td>
                <td>
                  <span :class="cellClass(row.ssh)">{{ cellIcon(row.ssh) }}</span>
                </td>
                <td>
                  <span :class="cellClass(row.ansible)">{{ cellIcon(row.ansible) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ─── OPEN SOURCE BAND (with animated stats) ─── -->
    <section class="open-source-band" id="docs" ref="statsSection">
      <div class="container oss-content">
        <p class="oss-label">OPEN SOURCE</p>
        <h2 class="band-title">Built in the open.</h2>
        <p class="band-body">
          SERVCTL is MIT-licensed. Fork it, self-host it, and contribute freely.
          No accounts required to read the code.
        </p>
        <div class="oss-stats">
          <a
            class="stat-pill"
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
          >
            ★ {{ statsVisible ? animatedStars : '0' }} Stars
          </a>
          <a
            class="stat-pill"
            href="https://github.com/mrl-barua/SERVCTL-FRONT/forks"
            target="_blank"
            rel="noreferrer"
          >
            ⑂ {{ statsVisible ? animatedForks : '0' }} Forks
          </a>
          <span class="stat-pill stat-pill-static">7 Demo Servers</span>
          <span class="stat-pill stat-pill-static">MIT Licensed</span>
        </div>
        <a
          class="btn-secondary oss-cta"
          href="https://github.com/mrl-barua/SERVCTL-FRONT"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub →
        </a>
        <p class="oss-fine">
          MIT License · Last release: v0.1.0 · Contributions welcome via Pull
          Request
        </p>
      </div>
    </section>

    <!-- ─── FAQ ─── -->
    <section class="faq-section">
      <div class="container">
        <p class="section-label">FAQ</p>
        <h2 class="section-title">Common questions.</h2>
        <div class="faq-list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="faq-item"
            :class="{ open: openFaq === i }"
          >
            <button class="faq-trigger" @click="toggleFaq(i)">
              <span>{{ faq.q }}</span>
              <span class="faq-icon">{{ openFaq === i ? '−' : '+' }}</span>
            </button>
            <div class="faq-answer" v-show="openFaq === i">
              <p>{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CHANGELOG ─── -->
    <section class="changelog-section" id="changelog">
      <div class="container">
        <p class="section-label">CHANGELOG</p>
        <h2 class="section-title">What's new.</h2>
        <div class="changelog-list">
          <div v-for="release in releases" :key="release.version" class="changelog-entry">
            <div class="changelog-header">
              <span class="changelog-version">{{ release.version }}</span>
              <span class="changelog-date">{{ release.date }}</span>
              <span v-if="release.latest" class="changelog-badge">latest</span>
            </div>
            <ul class="changelog-items">
              <li v-for="(item, ii) in release.items" :key="ii">{{ item }}</li>
            </ul>
          </div>
        </div>
        <a
          class="btn-ghost changelog-link"
          href="https://github.com/mrl-barua/SERVCTL-FRONT/releases"
          target="_blank"
          rel="noreferrer"
        >
          View full changelog on GitHub →
        </a>
      </div>
    </section>

    <!-- ─── COMMUNITY CTA ─── -->
    <section class="community-section">
      <div class="container community-content">
        <h2 class="community-title">Join the community.</h2>
        <p class="community-sub">
          Get help, share feedback, and stay updated on new releases.
        </p>
        <div class="community-actions">
          <a
            class="btn-primary"
            href="https://github.com/mrl-barua/SERVCTL-FRONT/discussions"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Discussions →
          </a>
          <a
            class="btn-secondary"
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
          >
            ★ Star on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- ─── SELF-HOST ─── -->
    <section class="self-host" id="install">
      <div class="container">
        <h2 class="self-title">Self-host in minutes.</h2>
        <p class="self-sub">One command. Your infrastructure, your rules.</p>
        <div class="install-wrap">
          <button
            class="copy-btn"
            @click="copyInstall"
            :aria-label="copied ? 'Copied!' : 'Copy install commands'"
          >
            {{ copied ? "✓ Copied" : "Copy" }}
          </button>
          <pre
            class="install-code"
            role="region"
            aria-label="Installation commands"
            >{{ installCmd }}</pre
          >
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="footer">
      <div class="container footer-inner">
        <div>SERVCTL 2025 · MIT License</div>
        <a
          href="https://github.com/mrl-barua/SERVCTL-FRONT"
          target="_blank"
          rel="noreferrer"
          >GitHub</a
        >
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";

// ─── Feature Showcase ───
const activeFeature = ref(0);
const features = [
  {
    id: "ssh",
    icon: ">_",
    title: "SSH Access",
    desc: "Launch terminal sessions directly from the dashboard.",
    previewTitle: "servctl-terminal",
    previewLines: [
      { prompt: "ubuntu@web-prod-01:~$", cmd: "whoami" },
      { out: "ubuntu" },
      { prompt: "ubuntu@web-prod-01:~$", cmd: "systemctl status nginx" },
      { out: "● nginx.service - A high performance web server" },
      { out: "   Loaded: loaded (/lib/systemd/system/nginx.service)" },
      { out: "   Active: ", ok: "active (running)" },
    ],
  },
  {
    id: "deploy",
    icon: "⬡",
    title: "Deploy Pipelines",
    desc: "Run deployments with real-time progress visibility.",
    previewTitle: "servctl-deploy",
    previewLines: [
      { prompt: "deploy@pipeline:~$", cmd: "servctl deploy --env production" },
      { ok: "✓ Connected to web-prod-01" },
      { ok: "✓ Pulling latest changes..." },
      { out: "  From github.com:team/app" },
      { out: "  * branch  main -> FETCH_HEAD" },
      { ok: "✓ Running build script..." },
      { ok: "✓ Deploy complete — 3.2s" },
    ],
  },
  {
    id: "logs",
    icon: "≡",
    title: "Live Log Streaming",
    desc: "Tail logs from any server and filter by signal.",
    previewTitle: "servctl-logs",
    previewLines: [
      { prompt: "logs@web-prod-01:~$", cmd: "tail -f /var/log/nginx/access.log" },
      { out: '192.168.1.50 - - "GET /api/health" 200 12ms' },
      { out: '192.168.1.51 - - "POST /api/deploy" 201 340ms' },
      { out: '192.168.1.50 - - "GET /api/servers" 200 8ms' },
      { out: '10.0.0.12 - - "GET /dashboard" 200 45ms' },
      { out: '192.168.1.50 - - "GET /api/logs" 200 15ms' },
    ],
  },
  {
    id: "env",
    icon: "◈",
    title: "Multi-environment",
    desc: "Organize servers by production, live, QA, and testing.",
    previewTitle: "servctl-environments",
    previewLines: [
      { prompt: "admin@servctl:~$", cmd: "servctl list --by-env" },
      { out: "" },
      { ok: "PRODUCTION (3 servers)" },
      { out: "  web-prod-01    online   42d uptime" },
      { out: "  web-prod-02    online   42d uptime" },
      { out: "  db-prod-01     online   89d uptime" },
      { out: "" },
      { ok: "STAGING (2 servers)" },
      { out: "  web-staging-01 online   12d uptime" },
      { out: "  db-staging-01  online   12d uptime" },
    ],
  },
];

// ─── How It Works ───
const steps = [
  {
    title: "Add Your Server",
    desc: "Enter your server IP, select an SSH key, and assign an environment tag.",
  },
  {
    title: "Connect Instantly",
    desc: "One-click SSH from the dashboard. No local terminal needed.",
  },
  {
    title: "Deploy & Monitor",
    desc: "Push code, stream logs in real-time, and track server health.",
  },
];

// ─── Who It's For ───
const personas = [
  {
    icon: ">_",
    title: "Solo Developers",
    desc: "Manage your VPS from a single dashboard instead of scattered terminal windows.",
  },
  {
    icon: "⌘",
    title: "Small Teams",
    desc: "Shared SSH access without sharing keys. Everyone gets their own session.",
  },
  {
    icon: "⬡",
    title: "Homelabbers",
    desc: "Self-host on your own hardware with zero cloud dependency.",
  },
  {
    icon: "◈",
    title: "DevOps Engineers",
    desc: "Lightweight alternative to heavy infra tools. No agents, no lock-in.",
  },
];

// ─── Comparison Table ───
const compareRows = [
  { feature: "Web SSH Terminal",   servctl: "yes", portainer: "no",      ssh: "no",      ansible: "no" },
  { feature: "Deploy Pipelines",   servctl: "yes", portainer: "partial", ssh: "no",      ansible: "yes" },
  { feature: "Live Log Streaming", servctl: "yes", portainer: "yes",     ssh: "partial", ansible: "no" },
  { feature: "Self-hostable",      servctl: "yes", portainer: "yes",     ssh: "yes",     ansible: "yes" },
  { feature: "No Agent Required",  servctl: "yes", portainer: "no",      ssh: "yes",     ansible: "yes" },
  { feature: "MIT Licensed",       servctl: "yes", portainer: "partial", ssh: "yes",     ansible: "yes" },
  { feature: "Free Forever",       servctl: "yes", portainer: "partial", ssh: "yes",     ansible: "yes" },
];

function cellClass(val) {
  return val === "yes" ? "cell-yes" : val === "no" ? "cell-no" : "cell-partial";
}
function cellIcon(val) {
  return val === "yes" ? "✓" : val === "no" ? "✗" : "~";
}

// ─── Animated Stats ───
const statsSection = ref(null);
const statsVisible = ref(false);
const animatedStars = ref("0");
const animatedForks = ref("0");

function animateCount(target, suffix, duration, setter) {
  const start = performance.now();
  const numTarget = parseFloat(target);
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * numTarget;
    if (suffix === "k") {
      setter((current).toFixed(1) + "k");
    } else {
      setter(Math.round(current).toString());
    }
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let statsObserver = null;
onMounted(() => {
  statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !statsVisible.value) {
        statsVisible.value = true;
        animateCount(1.2, "k", 1500, (v) => (animatedStars.value = v));
        animateCount(84, "", 1500, (v) => (animatedForks.value = v));
      }
    },
    { threshold: 0.3 }
  );
  if (statsSection.value) statsObserver.observe(statsSection.value);
});
onUnmounted(() => {
  if (statsObserver) statsObserver.disconnect();
});

// ─── FAQ ───
const openFaq = ref(null);
const faqs = [
  {
    q: "Is SERVCTL really free?",
    a: "Yes. SERVCTL is MIT-licensed and completely free to use, self-host, and modify. There are no paid tiers, usage limits, or hidden fees.",
  },
  {
    q: "Do I need to install an agent on my servers?",
    a: "No. SERVCTL connects to your servers over standard SSH. There is nothing to install on the remote side — if you can SSH into it, SERVCTL can manage it.",
  },
  {
    q: "How is SSH access secured?",
    a: "SERVCTL uses SSH key-based authentication. Keys are stored in an encrypted vault on your self-hosted instance. No passwords are transmitted or stored in plaintext.",
  },
  {
    q: "Can I use this with Docker or Kubernetes?",
    a: "SERVCTL manages servers over SSH, so it works with any Linux host — whether that host runs Docker, K8s, or bare-metal services. It is not a container orchestrator.",
  },
  {
    q: "What happens to the demo data?",
    a: "The live demo runs 7 pre-loaded sandbox servers and resets every 30 minutes. Nothing you do in the demo persists or affects real infrastructure.",
  },
  {
    q: "How do I contribute?",
    a: "Fork the repo, make your changes, and open a Pull Request. Check the GitHub Discussions for feature ideas and coordination. All contributions are welcome.",
  },
];

function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? null : i;
}

// ─── Changelog ───
const releases = [
  {
    version: "v0.1.0",
    date: "2025-01-15",
    latest: true,
    items: [
      "Initial public release",
      "Web-based SSH terminal with session management",
      "Deploy pipelines with real-time progress",
      "Live log streaming with signal filtering",
      "Multi-environment server organization",
      "SSH key vault with encrypted storage",
      "Sandboxed live demo mode",
    ],
  },
];

// ─── Self-host Install ───
const copied = ref(false);
const installCmd = [
  "git clone https://github.com/mrl-barua/SERVCTL-FRONT.git",
  "cd SERVCTL-FRONT",
  "npm install",
  "npm run dev",
].join("\n");

function copyInstall() {
  navigator.clipboard.writeText(installCmd).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2500);
  });
}
</script>

<style scoped>
/* ─── BASE ─── */
.landing {
  font-family: var(--font-mono);
  min-height: 100vh;
  background:
    radial-gradient(
      ellipse 90% 60% at 50% -10%,
      rgba(79, 142, 247, 0.09) 0%,
      transparent 70%
    ),
    var(--bg);
  color: var(--text);
}

.brand-word,
.hero-title,
.band-title,
.self-title,
.section-title,
.step-title,
.persona-title,
.community-title {
  font-family: var(--font-display);
}

.container {
  width: min(1160px, calc(100% - 48px));
  margin-inline: auto;
}

/* ─── SECTION SHARED ─── */
.section-label {
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.14em;
  text-align: center;
  margin-bottom: 8px;
}

.section-title {
  text-align: center;
  margin: 0 0 32px;
  font-size: clamp(22px, 3vw, 32px);
}

/* ─── TOP NAV ─── */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(19, 22, 30, 0.9);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.top-nav-inner {
  min-height: 62px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.brand-word {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.version-pill {
  font-size: 10px;
  border: 1px solid var(--border2);
  border-radius: 999px;
  padding: 2px 8px;
  color: var(--text3);
}

.nav-links {
  display: inline-flex;
  gap: 18px;
  justify-self: center;
}

.nav-links a {
  color: var(--text2);
  font-size: 12px;
  transition: color 0.15s ease;
}

.nav-links a:hover {
  color: var(--text);
}

.nav-right {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.star-btn,
.nav-cta,
.btn-primary,
.btn-secondary,
.btn-ghost {
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text2);
  transition: all 0.15s ease;
  cursor: pointer;
  font-family: var(--font-mono);
  text-decoration: none;
  display: inline-block;
}

.star-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.star-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.star-icon {
  color: var(--yellow);
  font-size: 13px;
}

.star-count {
  font-size: 10px;
  color: var(--text3);
  background: var(--bg4);
  border-radius: 999px;
  padding: 1px 7px;
  border: 1px solid var(--border);
}

.nav-cta,
.btn-primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.nav-cta:hover,
.btn-primary:hover {
  background: var(--accent2);
  border-color: var(--accent2);
}

.btn-secondary {
  background: var(--bg3);
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--text);
}

.btn-ghost:hover {
  color: var(--yellow);
  border-color: var(--yellow);
}

/* ─── HERO ─── */
.hero {
  min-height: calc(100vh - 62px);
  display: grid;
  place-items: center;
  padding: 44px 0;
}

.hero-content {
  text-align: center;
}

.env-tag {
  display: inline-block;
  border: 1px solid var(--border2);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--text3);
  font-size: 10px;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.hero-title {
  margin: 16px 0 10px;
  line-height: 0.96;
  font-size: clamp(42px, 8vw, 84px);
  letter-spacing: -0.03em;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.hero-title .control {
  text-decoration: underline wavy rgba(79, 142, 247, 0.92);
}

.hero-title .dot {
  color: var(--accent);
}

.subheadline {
  color: var(--text2);
  font-size: 13px;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.sep {
  color: var(--accent);
}

.cta-row {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.cta-primary-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cta-meta {
  color: var(--green);
  font-size: 10px;
}

.demo-proof {
  margin-top: 10px;
  color: var(--text3);
  font-size: 11px;
  animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.48s both;
}

/* ─── TERMINAL CARD (shared) ─── */
.terminal-card {
  margin: 32px auto 0;
  max-width: 680px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(79, 142, 247, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(79, 142, 247, 0.04);
  text-align: left;
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.56s both;
}

.terminal-bar {
  background: var(--bg3);
  border-bottom: 1px solid var(--border);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.td {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}

.td-red {
  background: #f25f5c;
}

.td-yellow {
  background: #f5a623;
}

.td-green {
  background: #3ecf8e;
}

.term-title-label {
  margin-left: 8px;
  font-size: 11px;
  color: var(--text3);
}

.terminal-body {
  background: #0a0c10;
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.85;
}

.tline {
  display: block;
}

.tprompt {
  color: var(--accent);
}

.tcmd {
  color: var(--text);
}

.tout {
  color: var(--text2);
}

.tok {
  color: var(--green);
}

.tcursor {
  display: inline-block;
  color: var(--accent);
  animation: blink 1.1s step-start infinite;
}

/* ─── FEATURE SHOWCASE ─── */
.features-showcase {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.showcase-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

.showcase-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.showcase-tab {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg2);
  color: var(--text2);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.15s ease;
}

.showcase-tab:hover {
  border-color: var(--border2);
  color: var(--text);
}

.showcase-tab.active {
  border-color: var(--accent);
  background: rgba(79, 142, 247, 0.06);
  color: var(--text);
}

.tab-icon {
  font-size: 14px;
  color: var(--accent);
  flex-shrink: 0;
  width: 22px;
  text-align: center;
  margin-top: 1px;
}

.tab-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tab-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
}

.tab-desc {
  font-size: 11px;
  color: var(--text3);
  line-height: 1.4;
}

.showcase-tab.active .tab-desc {
  color: var(--text2);
}

.showcase-preview {
  position: sticky;
  top: 86px;
}

.showcase-terminal {
  margin: 0;
  max-width: none;
  animation: none;
}

/* ─── HOW IT WORKS ─── */
.how-it-works {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
}

.step-connector {
  position: absolute;
  top: 24px;
  left: calc(16.67% + 24px);
  right: calc(16.67% + 24px);
  height: 1px;
  background: linear-gradient(
    90deg,
    var(--accent) 0%,
    var(--border2) 50%,
    var(--accent) 100%
  );
  opacity: 0.4;
}

.step {
  text-align: center;
  padding: 20px 16px;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(79, 142, 247, 0.1);
  border: 1px solid var(--accent);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-title {
  font-size: 15px;
  margin: 0 0 8px;
}

.step-desc {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.5;
  margin: 0;
}

/* ─── WHO IT'S FOR ─── */
.who-section {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.persona-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg2);
  padding: 20px 16px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
  cursor: default;
}

.persona-card:hover {
  transform: translateY(-3px);
  border-color: var(--border2);
}

.persona-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: rgba(79, 142, 247, 0.08);
  border: 1px solid var(--border);
  color: var(--accent);
  font-size: 14px;
  margin-bottom: 12px;
}

.persona-title {
  font-size: 13px;
  margin: 0 0 6px;
}

.persona-desc {
  font-size: 11px;
  color: var(--text2);
  margin: 0;
  line-height: 1.5;
}

/* ─── COMPARISON TABLE ─── */
.compare-section {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 560px;
}

.compare-table th,
.compare-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.compare-table th {
  color: var(--text3);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.04em;
}

.compare-table .feature-col {
  text-align: left;
  color: var(--text);
  font-weight: 500;
}

.compare-table .highlight-col {
  background: rgba(79, 142, 247, 0.04);
}

.compare-table thead .highlight-col {
  color: var(--accent);
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 13px;
}

.cell-yes {
  color: var(--green);
  font-weight: 600;
}

.cell-no {
  color: var(--red);
  opacity: 0.7;
}

.cell-partial {
  color: var(--yellow);
}

/* ─── OPEN SOURCE BAND ─── */
.open-source-band,
.self-host {
  border-top: 1px solid var(--border);
  padding: 44px 0;
}

.oss-content {
  text-align: center;
}

.oss-label {
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.14em;
  margin-bottom: 10px;
}

.oss-stats {
  display: inline-flex;
  gap: 10px;
  margin: 18px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-pill {
  font-size: 11px;
  color: var(--text2);
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 14px;
  transition:
    border-color 0.15s,
    color 0.15s;
  text-decoration: none;
}

.stat-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.stat-pill-static {
  cursor: default;
}

.stat-pill-static:hover {
  border-color: var(--border);
  color: var(--text2);
}

.oss-cta {
  display: inline-block;
  margin-bottom: 14px;
}

.oss-fine {
  font-size: 10px;
  color: var(--text3);
  margin-top: 6px;
}

.band-title,
.self-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
}

.band-body,
.self-sub {
  color: var(--text2);
  font-size: 12px;
}

/* ─── FAQ ─── */
.faq-section {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.faq-list {
  max-width: 720px;
  margin: 0 auto;
}

.faq-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.faq-item.open {
  border-color: var(--border2);
}

.faq-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: var(--bg2);
  border: none;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s ease;
}

.faq-trigger:hover {
  color: var(--accent);
}

.faq-icon {
  color: var(--accent);
  font-size: 16px;
  flex-shrink: 0;
  margin-left: 12px;
}

.faq-answer {
  padding: 0 18px 14px;
  background: var(--bg2);
}

.faq-answer p {
  margin: 0;
  font-size: 11px;
  color: var(--text2);
  line-height: 1.65;
}

/* ─── CHANGELOG ─── */
.changelog-section {
  padding: 48px 0;
  border-top: 1px solid var(--border);
}

.changelog-list {
  max-width: 720px;
  margin: 0 auto 24px;
}

.changelog-entry {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg2);
  padding: 18px 20px;
  margin-bottom: 10px;
}

.changelog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.changelog-version {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
}

.changelog-date {
  font-size: 11px;
  color: var(--text3);
}

.changelog-badge {
  font-size: 9px;
  color: var(--green);
  background: var(--green-bg);
  border: 1px solid rgba(62, 207, 142, 0.2);
  border-radius: 999px;
  padding: 2px 8px;
  letter-spacing: 0.04em;
}

.changelog-items {
  margin: 0;
  padding-left: 18px;
  list-style: none;
}

.changelog-items li {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.8;
  position: relative;
}

.changelog-items li::before {
  content: "·";
  color: var(--accent);
  font-weight: 700;
  position: absolute;
  left: -14px;
}

.changelog-link {
  display: block;
  text-align: center;
}

/* ─── COMMUNITY CTA ─── */
.community-section {
  padding: 48px 0;
  border-top: 1px solid var(--border);
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 100%,
      rgba(79, 142, 247, 0.07) 0%,
      transparent 70%
    );
}

.community-content {
  text-align: center;
}

.community-title {
  margin: 0 0 8px;
  font-size: clamp(22px, 3vw, 32px);
}

.community-sub {
  color: var(--text2);
  font-size: 12px;
  margin: 0 0 24px;
}

.community-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ─── SELF-HOST ─── */
.install-wrap {
  position: relative;
  margin-top: 16px;
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 4px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg4);
  color: var(--text3);
  cursor: pointer;
  transition: all 0.15s ease;
  z-index: 1;
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.install-code {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: #0a0c10;
  color: var(--text);
  font-size: 12px;
  padding: 40px 14px 14px;
  white-space: pre-wrap;
}

/* ─── FOOTER ─── */
.footer {
  border-top: 1px solid var(--border);
}

.footer-inner {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text3);
  font-size: 11px;
}

/* ─── ANIMATIONS ─── */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* ─── RESPONSIVE: TABLET ─── */
@media (max-width: 980px) {
  .top-nav-inner {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px 0;
  }

  .brand,
  .nav-links,
  .nav-right {
    justify-self: center;
  }

  .showcase-layout {
    grid-template-columns: 1fr;
  }

  .showcase-tabs {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 8px;
    padding-bottom: 4px;
  }

  .showcase-tab {
    min-width: 160px;
    flex-shrink: 0;
  }

  .showcase-preview {
    position: static;
  }

  .steps-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .step-connector {
    display: none;
  }

  .persona-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── RESPONSIVE: MOBILE ─── */
@media (max-width: 680px) {
  .container {
    width: calc(100% - 24px);
  }

  .nav-links {
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .cta-row {
    flex-direction: column;
    width: min(320px, 100%);
    margin-inline: auto;
  }

  .showcase-tabs {
    flex-direction: column;
  }

  .showcase-tab {
    min-width: unset;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .persona-grid {
    grid-template-columns: 1fr;
  }

  .community-actions {
    flex-direction: column;
    width: min(320px, 100%);
    margin-inline: auto;
  }
}
</style>
