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
          >
            <span>Star</span>
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
          <span class="sep">·</span> live logs
          <span class="sep">·</span> zero vendor lock-in
        </p>

        <div class="cta-row">
          <span class="cta-primary-wrap">
            <RouterLink class="btn-primary" to="/demo">Try Live Demo</RouterLink>
            <span class="cta-meta">no login required</span>
          </span>
          <RouterLink class="btn-secondary" to="/login">Self-host Free</RouterLink>
          <a
            class="btn-ghost"
            href="https://github.com/mrl-barua/SERVCTL-FRONT"
            target="_blank"
            rel="noreferrer"
          >
            Star on GitHub
          </a>
        </div>

        <div class="demo-proof">
          Live demo has 7 pre-loaded servers and resets every 30 minutes
        </div>
      </div>
    </section>

    <section class="features-strip" id="features">
      <div class="container feature-grid">
        <article class="feature-card">
          <h3 class="feature-title">SSH Access</h3>
          <p class="feature-desc">Launch terminal sessions directly from the dashboard.</p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Deploy Pipelines</h3>
          <p class="feature-desc">Run deployments with real-time progress visibility.</p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Live Log Streaming</h3>
          <p class="feature-desc">Tail logs from any server and filter by signal.</p>
        </article>
        <article class="feature-card">
          <h3 class="feature-title">Multi-environment</h3>
          <p class="feature-desc">Organize servers by production, live, QA, and testing.</p>
        </article>
      </div>
    </section>

    <section class="open-source-band" id="docs">
      <div class="container">
        <h2 class="band-title">Built in the open.</h2>
        <p class="band-body">
          SERVCTL is MIT-licensed. Fork it, self-host it, and contribute freely.
        </p>
      </div>
    </section>

    <section class="self-host" id="install">
      <div class="container">
        <h2 class="self-title">Self-host in minutes.</h2>
        <p class="self-sub">One command. Your infrastructure, your rules.</p>
        <pre class="install-code">git clone https://github.com/mrl-barua/SERVCTL-FRONT.git
cd SERVCTL-FRONT
npm install
npm run dev</pre>
      </div>
    </section>

    <footer class="footer" id="changelog">
      <div class="container footer-inner">
        <div>SERVCTL 2025 · MIT License</div>
        <a href="https://github.com/mrl-barua/SERVCTL-FRONT" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
:root {
  --bg: #0d0f14;
  --bg2: #13161e;
  --bg3: #1a1e28;
  --border: #2a2f3f;
  --border2: #363c52;
  --text: #e8eaf0;
  --text2: #8b90a8;
  --text3: #555a72;
  --accent: #4f8ef7;
  --green: #3ecf8e;
  --radius: 8px;
  --radius-lg: 12px;
}

.landing {
  min-height: 100vh;
  background: radial-gradient(ellipse 90% 60% at 50% -10%, rgba(79, 142, 247, 0.09) 0%, transparent 70%),
    var(--bg);
  color: var(--text);
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
}

.nav-cta,
.btn-primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.btn-secondary {
  background: var(--bg3);
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
}

.hero-title {
  margin: 16px 0 10px;
  line-height: 0.96;
  font-size: clamp(42px, 8vw, 84px);
  letter-spacing: -0.03em;
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

.band-title,
.self-title {
  margin: 0 0 8px;
}

.band-body,
.self-sub {
  color: var(--text2);
  font-size: 12px;
}

.install-code {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: #0a0c10;
  color: var(--text);
  font-size: 12px;
  padding: 14px;
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
