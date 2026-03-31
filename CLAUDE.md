# SERVCTL Frontend - CLAUDE.md
## 1. What This File Is For
This file gives Claude Code persistent project context for SERVCTL frontend.
Use it to:
- Understand architecture quickly
- Follow visual/style system exactly
- Respect cloud vs local behavior
- Implement routes, stores, sockets, and modals consistently
- Avoid repeat mistakes already known in this repo
This document is intentionally strict and implementation-oriented.
## 2. Repository Context
| Field | Value |
|---|---|
| Repository | https://github.com/mrl-barua/SERVCTL-FRONT |
| Project | SERVCTL |
| Product type | Open source, self-hostable SSH server control panel |
| Frontend type | Vue 3 SPA |
| Runtime modes | Cloud (SaaS-like) and Local (self-hosted) |
## 3. Tech Stack
| Layer | Technology |
|---|---|
| UI framework | Vue 3 |
| Vue style | Composition API + script setup |
| Build tool | Vite |
| Routing | Vue Router 4 |
| State | Pinia |
| HTTP | Axios |
| Real-time | socket.io-client |
| Styling | Hand-crafted CSS only |
| Fonts | JetBrains Mono + Syne |
| Deploy targets | Docker (nginx) or Vercel |
## 4. Architecture Overview
### 4.1 Layer responsibilities
- Views:
  - Route-level orchestration
  - Compose feature components
  - Trigger store actions
- Components:
  - Reusable UI building blocks
  - Local interaction state
- Stores (Pinia):
  - Domain state
  - API and socket operations
  - Loading/error handling
- Services:
  - Shared HTTP and socket client wiring
- Composables:
  - Focused reusable logic
- Router:
  - Route definitions
  - Auth guards and redirects
### 4.2 Request flow
1. User action in a view/component
2. Component triggers store action
3. Store calls API via shared HTTP client
4. Interceptor attaches bearer token
5. Store updates refs/computed
6. UI updates reactively
### 4.3 Real-time flow
1. View/store opens Socket.IO namespace
2. Backend emits terminal/log events
3. Store/composable updates reactive stream
4. Component renders events
5. onUnmounted/store teardown disconnects sockets
## 5. Project Structure
### 5.1 Canonical annotated tree
```text
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── main.css              # Global CSS vars, resets, fonts
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmModal.vue  # Reusable delete confirm dialog
│   │   │   └── AppToast.vue      # Slide-in toast notifications
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue    # Left nav, server list, mode badge
│   │   │   └── AppTopbar.vue     # Top bar, ping all, add server btn
│   │   ├── servers/
│   │   │   ├── ServerCard.vue    # Individual server card with actions
│   │   │   ├── StatCard.vue      # Overview stat (total/online/etc)
│   │   │   └── AddServerModal.vue # Add + Edit server form modal
│   │   ├── terminal/
│   │   │   ├── TerminalPanel.vue        # Terminal UI + input row
│   │   │   ├── QuickCommands.vue        # Quick command button strip
│   │   │   ├── QuickCommandsManager.vue # Drawer - CRUD for commands
│   │   │   └── QuickCommandForm.vue     # Add/Edit command modal
│   │   ├── deploy/
│   │   │   └── DeployCard.vue    # Deploy step tracker per server
│   │   ├── logs/
│   │   │   └── LogViewer.vue     # Real-time log streaming UI
│   │   └── ssh-keys/
│   │       └── SshKeyUploadPanel.vue  # SSH key upload + management
│   ├── composables/
│   │   ├── useMode.ts            # Cloud vs local mode detection
│   │   ├── useSocket.ts          # socket.io hooks (logs + terminal)
│   │   └── useSSH.ts             # SSH URI builder, clipboard copy
│   ├── stores/
│   │   ├── servers.ts            # Server CRUD, ping, status
│   │   ├── auth.ts               # JWT token, user profile, logout
│   │   ├── quickCommands.ts      # Quick command CRUD + reorder
│   │   └── logs.ts               # Log lines, filters, tail mode
│   ├── views/
│   │   ├── LandingView.vue       # Public marketing/hero page
│   │   ├── LoginView.vue         # Login + Register + SSO + Forgot PW
│   │   ├── AuthCallbackView.vue  # SSO OAuth callback handler
│   │   ├── OverviewView.vue      # Dashboard - stat cards + server grid
│   │   ├── TerminalView.vue      # SSH terminal + quick commands
│   │   ├── DeployView.vue        # Deploy pipelines per server
│   │   ├── LogsView.vue          # Live log streaming view
│   │   ├── SshKeysView.vue       # SSH Key Vault management
│   │   └── demo/
│   │       └── DemoView.vue      # Sandboxed demo (no login required)
│   ├── router/
│   │   └── index.ts              # Route definitions + auth guards
│   ├── App.vue                   # Root layout, sidebar + main area
│   └── main.ts                   # App bootstrap, Pinia, Router init
├── Dockerfile                    # Multi-stage: builder + nginx runner
├── nginx.conf                    # Proxy /api/ and /socket.io/ to backend
├── docker-compose.yml            # Standalone frontend container
├── .env.example                  # Required env vars documented
└── vite.config.ts                # Vite config, path aliases
```
### 5.2 Current implementation mapping (important)
The live repository currently has some JS/TS differences from canonical docs.
Use existing paths unless explicitly migrating.
Current notable paths:
- `src/main.js` (not `src/main.ts`)
- `vite.config.js` (not `vite.config.ts`)
- `src/services/http.js`
- `src/services/socket.js`
- `src/stores/app.ts` (mode/config store)
- `src/stores/auth.js`
- `src/stores/servers.js`
- `src/stores/logs.js`
- `src/components/AppToast.vue` (outside common folder currently)
- `src/views/KeyVaultView.vue` and `src/views/SshKeysView.vue`
Not currently present:
- `src/composables/useMode.ts`
- `src/composables/useSocket.ts`
- `src/components/ssh-keys/SshKeyUploadPanel.vue`
## 6. Design System
Do not import a UI library.
Do not hardcode color palette values in component styles.
Use global tokens.
### 6.1 CSS variables (defined in src/assets/main.css)
All variables are global.
Never redefine tokens in scoped styles.
```css
:root {
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
  --green-bg: #0d2b1f;
  --yellow: #f5a623;
  --yellow-bg: #2b1f0a;
  --red: #f25f5c;
  --red-bg: #2b0d0d;
  --radius: 8px;
  --radius-lg: 12px;
  --font-mono: 'JetBrains Mono', monospace;
  --font-display: 'Syne', sans-serif;
}
```
### 6.2 Variable reference table
| Group | Token | Value | Meaning |
|---|---|---|---|
| Background | `--bg` | `#0d0f14` | Page background |
| Background | `--bg2` | `#13161e` | Card/sidebar bg |
| Background | `--bg3` | `#1a1e28` | Input/hover bg |
| Background | `--bg4` | `#222636` | Badge/pill bg |
| Border | `--border` | `#2a2f3f` | Base border |
| Border | `--border2` | `#363c52` | Hover/active border |
| Text | `--text` | `#e8eaf0` | Primary text |
| Text | `--text2` | `#8b90a8` | Secondary text |
| Text | `--text3` | `#555a72` | Placeholder/label text |
| Accent | `--accent` | `#4f8ef7` | Primary action color |
| Accent | `--accent2` | `#2d5bb5` | Accent hover color |
| Status | `--green` | `#3ecf8e` | Online/success |
| Status | `--green-bg` | `#0d2b1f` | Success background |
| Status | `--yellow` | `#f5a623` | Warning/unknown |
| Status | `--yellow-bg` | `#2b1f0a` | Warning background |
| Status | `--red` | `#f25f5c` | Offline/error |
| Status | `--red-bg` | `#2b0d0d` | Error background |
### 6.3 Environment colors
Use this env mapping for badges/chips:
| Env | Foreground | Background |
|---|---|---|
| prod | `#f25f5c` | `#2b0d0d` |
| live | `#3ecf8e` | `#0d2b1f` |
| qa | `#f5a623` | `#2b1f0a` |
| test | `#4f8ef7` | `#0d1a2b` |
If env tokens are added to global CSS, add:
- `--prod` and `--prod-bg`
- `--live` and `--live-bg`
- `--qa` and `--qa-bg`
- `--test` and `--test-bg`
### 6.4 Typography rules
- UI text, labels, inputs, and code: `var(--font-mono)`
- Headings, titles, wordmark: `var(--font-display)`
- Form labels:
  - 9px to 10px
  - uppercase
  - letter spacing
  - `var(--text3)`
- Body/description text:
  - 11px to 12px
  - `var(--text2)`
- Never use Inter, Roboto, Arial, or generic system-first stacks
### 6.5 Component style patterns
- All modals use `.modal-overlay` + `.modal`
- Delete actions use `ConfirmModal.vue`
- Do not use `window.confirm()`
- Notifications use `AppToast.vue`
- Do not use `window.alert()`
- Form fields follow `.form-label` + `.form-input`
- Buttons use `.modal-btn` and `.modal-btn.primary`
- Global styles only in `main.css`; component styles scoped
- No UI framework imports
## 7. Application Modes
SERVCTL has two behavior modes:
```bash
VITE_SERVCTL_MODE=cloud
VITE_SERVCTL_MODE=local
```
### 7.1 Cloud mode rules
In cloud mode:
- Private IP addresses are blocked in server-add/update flows
- Restricted ranges:
  - `10.x.x.x`
  - `192.168.x.x`
  - `172.16.x.x` to `172.31.x.x`
Private IP warning/guard appears at 4 touchpoints:
1. Onboarding modal on first login
2. AddServerModal validation
3. ServerCard private-IP warning badge
4. Sidebar footer warning notice
### 7.2 Local mode rules
In local mode:
- All IP ranges allowed
- No private-network warnings required
- Sidebar shows green local mode indicator
### 7.3 Current implementation note
Current mode/config initialization is in `src/stores/app.ts` via backend `/config`.
If `useMode.ts` is introduced, keep it aligned with store state.
## 8. API and WebSocket Rules
### 8.1 API base URL
Use `import.meta.env.VITE_API_URL`.
Typical values:
- local direct backend: `http://localhost:3000`
- nginx proxy path: `/api`
### 8.2 API ownership rule
- API calls belong in stores
- Components should never call Axios directly
- Use shared client in `src/services/http.js`
Current HTTP client behavior:
- baseURL from env or localhost fallback
- request timeout 15000ms
- bearer token auto-injected via interceptor
### 8.3 WebSocket namespaces
- `/terminal`: command execution stream
- `/logs`: tail/live log stream
Current helper:
- `src/services/socket.js`
Canonical composable API if added:
```ts
useTerminalSocket() // connect, exec(command), output, disconnect
useLogsSocket()     // connect(serverId), lines, disconnect
```
### 8.4 Socket lifecycle rule
Always disconnect and cleanup in `onUnmounted()` or explicit store teardown action.
No background stale sockets after navigation.
## 9. Router and Auth
### 9.1 Guard pattern
- Protected routes use `meta: { requiresAuth: true }`
- Guard checks localStorage token
- Missing token redirects to login
- Auth pages should redirect authenticated users to overview
### 9.2 Current token keys
Current code uses:
- `servctl_access_token`
- `servctl_refresh_token`
- `servctl_user`
### 9.3 SSO callback route
Pattern:
```text
/auth/callback?token=xxx
```
Behavior:
1. Extract token
2. Persist in auth store/localStorage
3. Redirect to overview
### 9.4 Routes matrix
| Route | View | Access |
|---|---|---|
| `/` | LandingView | Public |
| `/login` | LoginView | Public |
| `/register` | RegisterView | Public |
| `/reset-password` | ResetPasswordView | Public |
| `/demo` | DemoView | Public |
| `/install` | InstallGuideView | Public |
| `/auth/callback` | AuthCallbackView | Public |
| `/overview` | OverviewView | Protected |
| `/terminal` | TerminalView | Protected |
| `/deploy` | DeployView | Protected |
| `/logs` | LogsView | Protected |
| `/keys` | KeyVaultView/SshKeysView | Protected |
## 10. Key Conventions
### 10.1 Vue component conventions
- Use script setup
- New logic should prefer TypeScript (`lang="ts"`)
- Props typed explicitly via `defineProps`
- Emits typed explicitly via `defineEmits`
- Do not use `this`
- Use composables/store refs
- `ref` for primitives
- `reactive` for objects
- `computed` for derived values
- Avoid complex inline template logic
### 10.2 Pinia conventions
- Domain-based stores (auth, servers, logs, terminal, etc.)
- Components call store actions, not axios
- Every async action:
  - set `loading = true` before start
  - set `error = null` before request
  - set `loading = false` in finally
- Errors should be normalized to user-readable messages
### 10.3 CSS conventions
- Every component style block is scoped by default
- Do not use `!important` unless mobile edge-case override is required
- Mobile breakpoint: `@media (max-width: 767px)`
- Prefer Flexbox for single-axis layouts
- Add `min-width: 0` on flex children containing text
- Transition timing:
  - `0.15s ease` default
  - `0.12s ease` for snappier controls
- Entrance animation easing:
  - `cubic-bezier(0.16, 1, 0.3, 1)`
### 10.4 Naming conventions
- Components: PascalCase (`ServerCard.vue`)
- Composables: camelCase with `use` prefix (`useSocket.ts`)
- Stores: domain names (`servers.ts`, `auth.ts`)
- CSS classes: kebab-case (`.server-card`)
- Emits: kebab-case (`update:modelValue`, `add-key`)
- Props: camelCase (`serverName`, `isLoading`)
## 11. Common Tasks
### 11.1 Adding a new view/page
1. Create `src/views/MyNewView.vue`
2. Register route in `src/router/index.ts`
3. Add nav item in sidebar if needed
4. If protected, add `meta: { requiresAuth: true }`
5. Verify auth redirect behavior manually
### 11.2 Adding a new server action button
1. Add button in `ServerCard.vue` action row
2. Reuse existing button classes
3. Wire action to servers store
4. Use ConfirmModal for destructive action
5. Show success/error via toast pattern
### 11.3 Adding a new Pinia store
1. Create `src/stores/myStore.ts`
2. Define store with clear domain key
3. Include state/getters/actions
4. Include loading/error handling in async actions
5. Use store from components via `useMyStore()`
### 11.4 Adding a new API endpoint call
1. Add action to relevant store in `src/stores/`
2. Use shared axios client and env base URL
3. Handle loading and error states
4. Return useful action result if needed by caller
5. Do not call axios directly from components
### 11.5 Adding a new modal
1. Add component in `src/components/common/` or feature folder
2. Use `<Teleport to="body">`
3. Use v-model or explicit prop/emit open-state pattern
4. Follow `.modal-overlay` + `.modal` structure
5. Add entrance animation (`modalIn` style)
### 11.6 Fixing a mobile layout issue
1. Check for missing `min-width: 0`
2. Add `overflow: hidden` to parent if needed
3. Add media query block at bottom of scoped style
4. Verify drawer/panel behavior:
   - desktop: side panel
   - mobile: overlay or bottom sheet pattern
## 12. Known Issues and Gotchas
1. CSS root tokens must live in `src/assets/main.css` only.
2. Stat cards can render wrong if numeric value is undefined; default to 0.
3. Terminal panel may shift on mobile with long command text.
4. Terminal input row can flex-blowout without `min-width: 0`.
5. `window.confirm()` and `window.alert()` are banned.
6. Sidebar must be slide-in overlay on mobile.
7. Quick command buttons must wrap on mobile.
8. `VITE_*` env values are baked at build time; rebuild required.
9. Socket connections must be cleaned up on unmount.
10. Demo mode must reuse shared cards, not duplicate markup.
11. Token key mismatches break guard/interceptor paths.
12. Mixed JS/TS imports can break silently when refactoring.
13. Components bypassing stores cause duplicated API logic.
14. Namespace mismatch in socket URL leads to no data events.
15. Route name changes can break redirects and nav logic.
## 13. Docker
### 13.1 Runtime model
Frontend Docker image uses two stages:
- Stage 1 (builder): `node:20-alpine`
- Stage 2 (runner): `nginx:1.25-alpine`
Build stage:
- installs dependencies with `npm ci`
- builds with `npm run build`
- accepts build args:
  - `VITE_API_URL`
  - `VITE_SERVCTL_MODE`
Runner stage:
- copies built `dist/` into nginx web root
- loads custom `nginx.conf`
- serves SPA static assets
### 13.2 nginx proxy behavior
Configured proxies:
```nginx
location /api/ {
  proxy_pass http://backend:3000/;
}
location /socket.io/ {
  proxy_pass http://backend:3000/socket.io/;
}
```
### 13.3 docker-compose behavior
`docker-compose.yml` frontend service:
- maps host port to container 80
- uses optional `.env`
- sets build args for Vite env values
- adds host mapping:
```yaml
extra_hosts:
  - "backend:host-gateway"
```
- includes healthcheck for nginx endpoint
### 13.4 Healthcheck
```yaml
test: ["CMD", "wget", "-qO-", "http://localhost:80/"]
```
## 14. Environment Variables
| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3000` | Backend API base URL (build-time) |
| `VITE_SERVCTL_MODE` | Yes | `local` | Frontend behavior mode (build-time) |
| `FRONTEND_PORT` | No | `80` | Docker host port mapping |
### Env policy
- Keep `.env.example` synchronized with actual usage
- Never commit sensitive values
- Remember `VITE_*` values are build-time constants
## 15. Feature Surface Map
### 15.1 Auth and entry
Views:
- LandingView
- LoginView
- RegisterView
- ResetPasswordView
- AuthCallbackView
Store:
- auth
### 15.2 Overview and servers
Views/components:
- OverviewView
- ServerGrid
- ServerCard
- StatCard
- AddServerModal
Store:
- servers
### 15.3 Terminal and quick commands
Views/components:
- TerminalView
- TerminalPanel
- QuickCommands
- QuickCommandsManager
- QuickCommandForm
Stores/services:
- terminal
- quickCommands
- socket service
### 15.4 Deploy
Views/components:
- DeployView
- DeployCard
Store:
- deploy
### 15.5 Logs
Views/components:
- LogsView
- LogViewer
Store:
- logs
### 15.6 SSH keys
Views/components:
- SshKeysView
- KeyVaultView
## 16. Quality Checklists
### 16.1 Component checklist
- Uses global tokens, not hardcoded palette
- Typography follows mono/display rules
- Handles loading, empty, error states
- Mobile behavior verified under 768px
- Long text does not overflow
- Uses modal/toast conventions
- No direct axios calls in component
### 16.2 Store checklist
- `loading` and `error` state managed consistently
- `error` reset at start of async action
- API calls centralized in store/service
- Returned data shape is stable
- Socket setup and teardown both implemented
### 16.3 Routing/auth checklist
- Route access level set correctly
- Protected routes use `requiresAuth`
- Guard redirect paths correct
- Callback flow stores token then redirects
- Existing route names unchanged unless migration planned
## 17. Typical Commands
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```
Docker:
```bash
docker compose up -d --build
docker compose logs -f frontend
docker compose down
```
## 18. Migration Guidance (JS to TS)
Current codebase is mixed JS/TS.
Migrate gradually and safely.
Rules:
- Migrate one domain at a time
- Keep store IDs and public APIs stable
- Add explicit interfaces/types for API payloads
- Avoid simultaneous broad path renames
- Verify imports after each conversion
Suggested order:
1. auth store
2. servers store
3. logs store
4. terminal store
5. socket/composable wrappers
## 19. Do/Do Not Summary
### Do
- Follow existing store-first data flow
- Reuse existing feature components
- Keep mode behavior explicit and testable
- Preserve visual consistency with tokens
- Disconnect socket listeners on teardown
### Do Not
- Do not add UI frameworks
- Do not hardcode colors in new components
- Do not call axios directly in views/components
- Do not use window alert/confirm dialogs
- Do not leave mode logic implicit or duplicated
## 20. Definition of Done
A frontend change is complete when:
1. Feature works in cloud and local behavior contexts
2. Route and auth behavior are correct
3. Design system rules are respected
4. Loading/error states are handled
5. Mobile layout is stable under 768px
6. Socket connections are cleaned up
7. Build succeeds and no runtime regressions are observed
## 21. Final Operating Notes for Claude Code
- Prefer consistency over novelty.
- Keep edits small and scoped.
- Follow canonical conventions, but account for current JS/TS reality.
- If introducing new abstractions, align with stores, router, and token system.
- Prioritize reliability, readability, and predictable UI behavior.
