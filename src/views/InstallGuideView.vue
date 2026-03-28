<template>
  <section class="install-page">
    <header>
      <h1>Self-host SERVCTL</h1>
      <p>
        SERVCTL Cloud works great for public servers. For private networks and
        VPN-only infrastructure, install SERVCTL locally.
      </p>
    </header>

    <article class="section">
      <h2>1. Why Local?</h2>
      <p>
        SERVCTL Cloud cannot reach private networks like home labs, office LANs,
        or air-gapped servers. Running SERVCTL locally gives direct network
        access and keeps data on your own machine or internal server.
      </p>
    </article>

    <article class="section">
      <h2>2. Requirements</h2>
      <ul>
        <li>Node.js 18 or newer</li>
        <li>Network access to your target servers (LAN/VPN/company network)</li>
        <li>Git</li>
      </ul>
    </article>

    <article class="section">
      <h2>3. Install Steps</h2>
      <pre><code>{{ installCmd }}</code></pre>
    </article>

    <article class="section cards">
      <h2>4. Where to Install</h2>
      <div class="card-grid">
        <div class="card">
          <h3>On your laptop/desktop</h3>
          <p>Best for personal servers, home lab, remote access through VPN.</p>
          <p class="mono">Access: http://localhost:5173</p>
        </div>
        <div class="card">
          <h3>On a jump server / bastion host</h3>
          <p>Best for teams sharing private infrastructure access.</p>
          <p class="mono">Access: http://your-bastion:5173 (add auth)</p>
        </div>
        <div class="card">
          <h3>On a company server in-network</h3>
          <p>Best for enterprise shared operations dashboards.</p>
          <p class="mono">Access: http://internal-hostname:5173</p>
        </div>
      </div>
    </article>

    <article class="section">
      <h2>5. Security Note</h2>
      <p>
        SERVCTL binds to localhost by default in local runs. If you expose it on
        a network interface, secure it with authentication and HTTPS.
      </p>
    </article>
  </section>
</template>

<script setup>
const installCmd = [
  "git clone https://github.com/mrl-barua/SERVCTL-FRONT.git",
  "cd SERVCTL-FRONT",
  "npm install",
  "cp .env.example .env",
  "npm run dev",
].join("\n");
</script>

<style scoped>
.install-page {
  max-width: 920px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 28px;
}

header p,
.section p,
.section li {
  color: var(--text2);
}

.section {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
}

.section h2 {
  margin: 0 0 8px;
  font-size: 15px;
}

pre {
  margin: 0;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 10px;
  overflow-x: auto;
}

code,
.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.card-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.card {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 10px;
}

.card h3 {
  margin-top: 0;
  font-size: 13px;
}

ul {
  margin: 0;
  padding-left: 18px;
}
</style>
