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

    <section
      class="features-strip"
      id="features"
      role="region"
      aria-label="Key features"
    >
      <div class="container feature-grid">
        <article class="feature-card">
          <h3 class="feature-title">SSH Access</h3>
          <p class="feature-desc">
            Launch terminal sessions directly from the dashboard.
          </p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Deploy Pipelines</h3>
          <p class="feature-desc">
            Run deployments with real-time progress visibility.
          </p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Live Log Streaming</h3>
          <p class="feature-desc">
            Tail logs from any server and filter by signal.
          </p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Multi-environment</h3>
          <p class="feature-desc">
            Organize servers by production, live, QA, and testing.
          </p>
        </article>
      </div>
    </section>

    <section class="open-source-band" id="docs">
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
            ★ 1.2k Stars
          </a>
          <a
            class="stat-pill"
            href="https://github.com/mrl-barua/SERVCTL-FRONT/forks"
            target="_blank"
            rel="noreferrer"
          >
            ⑂ 84 Forks
          </a>
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

    <footer class="footer" id="changelog">
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
import { ref } from "vue";
import { RouterLink } from "vue-router";

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
.feature-title {
  font-family: var(--font-display);
}

.container {
  width: min(1160px, calc(100% - 48px));
  margin-inline: auto;
}

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

.features-strip {
  padding: 24px 0 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.feature-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg2);
  padding: 16px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-3px);
  border-color: var(--border2);
}

.feature-title {
  margin: 0 0 6px;
  font-size: 13px;
}

.feature-desc {
  margin: 0;
  color: var(--text2);
  font-size: 11px;
}

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
}

.stat-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
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
}

.band-body,
.self-sub {
  color: var(--text2);
  font-size: 12px;
}

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

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .oss-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 680px) {
  .container {
    width: calc(100% - 24px);
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .cta-row {
    flex-direction: column;
    width: min(320px, 100%);
    margin-inline: auto;
  }
}
</style>
