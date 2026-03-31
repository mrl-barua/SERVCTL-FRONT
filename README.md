# SERVCTL FRONTEND

## 1. HEADER SECTION

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  SERVCTL FRONTEND                                                           │
│  palette: #0d0f14 · #13161e · #4f8ef7 · #3ecf8e · #f25f5c                  │
│  vue 3 spa · self-host first · cloud + local modes                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

![License](https://img.shields.io/github/license/mrl-barua/SERVCTL-FRONT)
![Release](https://img.shields.io/github/v/release/mrl-barua/SERVCTL-FRONT)
![Build](https://img.shields.io/github/actions/workflow/status/mrl-barua/SERVCTL-FRONT/docker-publish.yml)
![Stars](https://img.shields.io/github/stars/mrl-barua/SERVCTL-FRONT?style=social)
![Issues](https://img.shields.io/github/issues/mrl-barua/SERVCTL-FRONT)
![GHCR Pulls](https://img.shields.io/badge/ghcr.io-image%20published-2ea44f)

Self-hosted SSH server control panel.
Manage, monitor, and deploy across all your servers
from a single dashboard.

[Live Demo](https://servctl.dev) · [Documentation](https://github.com/mrl-barua/SERVCTL-FRONT#readme) · [Self-host Guide](https://github.com/mrl-barua/SERVCTL-BACK#readme) · [Report Bug](https://github.com/mrl-barua/SERVCTL-FRONT/issues/new?labels=bug&template=bug_report.md) · [Request Feature](https://github.com/mrl-barua/SERVCTL-FRONT/issues/new?labels=enhancement&template=feature_request.md)

## 2. SCREENSHOT

> Screenshot or GIF here - shows Overview dashboard with server cards, terminal, and logs.

See the live demo at servctl.dev.

## 3. ABOUT

SERVCTL is an open source, self-hostable SSH server control panel built for developers and DevOps teams who manage multiple servers across environments. The frontend is a Vue 3 single-page app designed for operational speed: low-friction navigation, predictable state management, and real-time feedback where it matters.

Managing servers across production, staging, QA, and testing environments usually means juggling multiple terminal windows, remembering SSH commands, and hopping between unrelated tools for logs, deploy checks, and status tracking. SERVCTL puts those workflows into one dashboard so teams can execute, observe, and iterate without context switching.

The project follows a self-host-first philosophy. No vendor lock-in, no usage limits, and no requirement to send operational data outside your own network. You can run SERVCTL on a laptop for local testing, on company infrastructure for internal operations, or use the hosted environment at servctl.dev.

Operationally, the frontend is built around clear boundaries:

- Views orchestrate route-level workflows.
- Pinia stores own all API and socket interactions.
- Components focus on presentation and interaction.
- Shared clients in services handle HTTP and real-time transport wiring.

## 4. FEATURES

| Feature                | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| ⌨ SSH Terminal         | Execute commands on any server directly from the browser         |
| ↑ Deploy Pipelines     | Run and monitor deployment steps with real-time progress         |
| ≡ Live Log Streaming   | Stream logs via tail -f or journalctl in real time               |
| 🔑 SSH Key Vault       | Store and reuse SSH keys encrypted with AES-256-GCM              |
| ⚡ Quick Commands      | Save and organize terminal shortcuts per server or globally      |
| ⬡ Multi-environment    | Organize servers by Production, Live, QA, and Testing            |
| 🌐 Cloud + Local modes | Works as SaaS for public IPs or self-hosted for private networks |
| 🔐 SSO Authentication  | Login with GitHub, Google, or Facebook                           |
| 🐳 Docker ready        | Single docker compose command to self-host the full stack        |
| 📱 Mobile responsive   | Full dashboard access from any device                            |

What these features mean in practice:

- You can switch between server control, logs, and deploy workflows without leaving the app.
- Environment labels and visual status states reduce operator mistakes.
- Reused commands and key management remove repetitive setup in daily operations.
- Real-time sockets keep terminal and log views current without polling loops.

## 5. TECH STACK

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Frontend  | Vue 3, Vite, Pinia, Vue Router          |
| Styling   | Hand-crafted CSS, JetBrains Mono + Syne |
| Real-time | socket.io-client (WebSocket)            |
| HTTP      | Axios                                   |
| Container | Docker + nginx                          |
| CI/CD     | GitHub Actions → ghcr.io                |
| Backend   | NestJS, Prisma, PostgreSQL / SQLite     |

This repository is the frontend only.
See SERVCTL-BACK for the backend repository:
https://github.com/mrl-barua/SERVCTL-BACK

## 6. GETTING STARTED

Use whichever path matches your goal.

### Option A - Try the live demo (no install)

Open:
https://servctl.vercel.app

Notes:

- Demo is read-only.
- Demo data resets every 30 minutes.
- Ideal for UI walkthroughs and feature exploration.

### Option B - Self-host with Docker (recommended)

```bash
# Download the production compose file
curl -O https://raw.githubusercontent.com/mrl-barua/SERVCTL-BACK/main/docker-compose.production.yml
curl -O https://raw.githubusercontent.com/mrl-barua/SERVCTL-BACK/main/.env.production.example

# Configure environment
cp .env.production.example .env
# Edit .env - set JWT_SECRET, ENCRYPTION_SECRET at minimum

# Start SERVCTL
docker compose -f docker-compose.production.yml up -d

# Open http://localhost
```

Generate required secrets:

```bash
openssl rand -hex 32   # use for JWT_SECRET
openssl rand -hex 32   # use for ENCRYPTION_SECRET
```

Recommended next checks after startup:

- Confirm frontend loads on your configured FRONTEND_PORT.
- Confirm backend health endpoint responds.
- Add one server and run a harmless command.
- Verify logs and terminal stream in real time.

### Option C - Local development

```bash
git clone https://github.com/mrl-barua/SERVCTL-FRONT.git
cd SERVCTL-FRONT
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000
npm run dev
# Frontend runs at http://localhost:5173
```

Local development workflow tips:

- Run backend locally or in Docker at port 3000.
- Keep VITE_API_URL aligned with backend URL.
- Rebuild frontend if changing VITE\_ build-time values.

Backend pairing options during development:

- Use the local NestJS backend on localhost:3000.
- Use Dockerized backend and point VITE_API_URL to host URL.
- Use a remote staging backend for UI-only integration checks.

Suggested daily dev loop:

1. Pull latest main or develop branch.
2. Install dependencies if package-lock changes.
3. Run npm run dev and verify login flow.
4. Validate one terminal command and one logs stream.
5. Run npm run build before opening a PR.

## 7. CONFIGURATION

| Variable          | Required | Default               | Description                                       |
| ----------------- | -------- | --------------------- | ------------------------------------------------- |
| VITE_API_URL      | Yes      | http://localhost:3000 | Backend API base URL                              |
| VITE_SERVCTL_MODE | Yes      | local                 | cloud or local - controls private IP restrictions |

Mode behavior:

- local mode - supports private/LAN IP servers, designed for self-hosted installs.
- cloud mode - public IP servers only, shows warnings for private IPs.

Configuration notes:

- Values prefixed with VITE\_ are embedded at build time.
- For Docker deployments, set values before building image layers.
- For local npm run dev, update .env and restart the dev server.

Environment examples:

```bash
# Self-host on same machine as backend
VITE_API_URL=http://localhost:3000
VITE_SERVCTL_MODE=local

# Frontend behind nginx reverse proxy
VITE_API_URL=/api
VITE_SERVCTL_MODE=local

# Hosted/public mode
VITE_API_URL=https://api.servctl.dev
VITE_SERVCTL_MODE=cloud
```

Mode guard behavior in UI:

- cloud mode blocks adding private IP ranges.
- cloud mode shows private network warning indicators.
- local mode allows private and public IP ranges.
- local mode removes private IP restriction prompts.

## 8. PRIVATE NETWORK SUPPORT

> **Using private/LAN servers?**
>
> The hosted version at servctl.dev only supports
> servers with public IP addresses. To manage servers
> on private networks (10.x.x.x, 192.168.x.x, VPNs,
> corporate intranets) you must self-host SERVCTL on
> a machine inside your network.
>
> Self-hosting takes under 5 minutes.
> See the self-host guide above.

## 9. DOCKER

```text
# Image
ghcr.io/mrl-barua/servctl-frontend:latest

# Pull
docker pull ghcr.io/mrl-barua/servctl-frontend:latest
```

| Arg               | Default | Description                      |
| ----------------- | ------- | -------------------------------- |
| VITE_API_URL      | /api    | Backend URL baked into the build |
| VITE_SERVCTL_MODE | local   | Mode baked into the build        |

Note: VITE\_ variables are baked in at build time.
Changing them requires a rebuild, not just a restart.

Registry and release notes:

- Images are pushed through GitHub Actions.
- Main branch publishes release-ready image tags.
- SHA tags can be pinned in production for deterministic deploys.

Minimal frontend-only run command:

```bash
docker run --rm -p 8080:80 ghcr.io/mrl-barua/servctl-frontend:latest
```

When running frontend-only, ensure backend connectivity:

- Route /api and /socket.io to backend.
- Keep CORS origin aligned with frontend URL.
- Verify auth token flow works end to end.

## 10. CONTRIBUTING

## Contributing

Contributions are welcome. SERVCTL is MIT licensed
and built in the open.

```bash
# Fork the repo, then:
git clone https://github.com/mrl-barua/SERVCTL-FRONT
cd SERVCTL-FRONT
npm install
npm run dev
```

Guidelines:

- Follow the existing code style (script setup, Pinia stores).
- Hand-crafted CSS only - no UI libraries.
- All CSS variables must go in src/assets/main.css.
- Use ConfirmModal.vue for delete confirmations.
- Use AppToast.vue for notifications.
- Mobile-first - test at 375px width.
- Open an issue before large PRs.

Pull request expectations:

- Keep changes scoped and reviewable.
- Include short test notes in PR description.
- Document any env var or route changes.
- Prefer extending existing components over duplicating patterns.

Definition of done for frontend PRs:

- Lint passes or lint exceptions are documented.
- Build succeeds with VITE_API_URL and VITE_SERVCTL_MODE set.
- Mobile layout checked for terminal, cards, and modals.
- No direct Axios calls from components.
- Socket listeners are cleaned up on route leave.

Recommended issue template for bugs:

- Environment (local/cloud, browser, OS)
- Steps to reproduce
- Expected vs actual behavior
- Console/network logs
- Screenshot or short screen recording

Recommended issue template for features:

- Problem statement
- Proposed interaction flow
- API/store impact
- Migration or backward compatibility notes

| Branch     | Purpose                            |
| ---------- | ---------------------------------- |
| main       | Production - triggers Docker build |
| develop    | Active development                 |
| feature/\* | Feature branches                   |

## 11. ROADMAP

- [x] SSH terminal with real command execution
- [x] Live log streaming (tail -f / journalctl)
- [x] SSH Key Vault (AES-256-GCM encryption)
- [x] Quick Commands manager
- [x] Multi-environment server organization
- [x] SSO (GitHub, Google, Facebook)
- [x] Docker production deployment
- [x] Mobile responsive design
- [ ] Two-factor authentication (2FA)
- [ ] Server metrics dashboard (CPU, RAM, disk over time)
- [ ] Team workspaces (multi-user with roles)
- [ ] Webhook triggers for deploy pipelines
- [ ] Audit log export (CSV / JSON)
- [ ] CLI companion tool

Roadmap principles:

- Keep the product operationally simple.
- Favor deployability and observability over feature volume.
- Maintain strict self-host compatibility for every release.

## 12. LICENSE

MIT License - free for personal and commercial use.

```text
MIT License
Copyright (c) 2025 mrl-barua
```

Full license in LICENSE file.

## 13. FOOTER

---

Built with ❤ by the community ·
MIT License ·
Self-host for free
