<template>
  <div class="auth-shell">
    <div class="login-layout">
      <aside class="left-panel">
        <div class="left-top">
          <h1 class="brand-wordmark">SERVCTL</h1>
          <p class="brand-sub">server control panel</p>
        </div>

        <div class="left-middle">
          <p class="hero-quote">Your servers. Under control.</p>

          <div class="terminal-snippet" aria-hidden="true">
            <div class="term-head"><span></span><span></span><span></span></div>
            <p><span class="prompt">ubuntu@prod-01:~$</span> uptime</p>
            <p class="term-output">22:14 up 99 days</p>
            <p>
              <span class="prompt">ubuntu@prod-01:~$</span>
              <span class="cursor">_</span>
            </p>
          </div>

          <div class="pill-stack">
            <div class="feature-pill">
              <span class="pill-icon">⌨</span> SSH Access
            </div>
            <div class="feature-pill">
              <span class="pill-icon">↑</span> Deploy Pipelines
            </div>
            <div class="feature-pill">
              <span class="pill-icon">≡</span> Live Log Streaming
            </div>
          </div>
        </div>

        <p class="left-footer">MIT License · Open Source · Self-hostable</p>
      </aside>

      <section class="right-panel">
        <div class="auth-card">
          <div class="mobile-brand">
            <h1 class="brand-wordmark">SERVCTL</h1>
            <p class="brand-sub">server control panel</p>
          </div>

          <form
            v-if="panel === 'login'"
            class="form-shell"
            @submit.prevent="handleSubmit"
          >
            <h2 class="auth-title">Welcome back.</h2>
            <p class="auth-subtitle">Sign in to your SERVCTL workspace.</p>

            <label class="auth-label">EMAIL</label>
            <input
              v-model="form.email"
              type="email"
              class="auth-input"
              placeholder="you@example.com"
              required
            />

            <label class="auth-label">PASSWORD</label>
            <div class="input-wrap">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input"
                placeholder="••••••••"
                required
              />
              <button
                class="pwd-toggle"
                type="button"
                :title="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "👁" : "👁‍🗨" }}
              </button>
            </div>

            <button class="forgot-link" type="button" @click="openForgotPanel">
              Forgot password?
            </button>

            <button class="auth-btn" :disabled="authStore.loading">
              <span class="btn-content">
                <span
                  v-if="authStore.loading"
                  class="btn-spinner"
                  aria-hidden="true"
                ></span>
                {{ authStore.loading ? "Signing in..." : "Sign In →" }}
              </span>
            </button>

            <div class="sso-divider">or continue with</div>

            <div class="sso-row">
              <a
                class="sso-btn github"
                :href="`${apiUrl}/auth/github`"
                aria-label="Sign in with GitHub"
              >
                <svg
                  class="sso-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                  />
                </svg>
                <span>GitHub</span>
              </a>

              <a
                class="sso-btn google"
                :href="`${apiUrl}/auth/google`"
                aria-label="Sign in with Google"
              >
                <svg class="sso-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
              </a>

              <a
                class="sso-btn facebook"
                :href="`${apiUrl}/auth/facebook`"
                aria-label="Sign in with Facebook"
              >
                <svg
                  class="sso-icon"
                  viewBox="0 0 24 24"
                  fill="#1877F2"
                  aria-hidden="true"
                >
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                <span>Facebook</span>
              </a>
            </div>

            <p class="auth-footer">
              Need an account?
              <router-link to="/register">Register</router-link>
            </p>
          </form>

          <div v-else-if="panel === 'forgot'" class="slide-panel form-shell">
            <div class="forgot-top">
              <button class="top-link" type="button" @click="goBackToLogin">
                Back to login
              </button>
              <button class="top-link" type="button" @click="goBackToLogin">
                Close
              </button>
            </div>

            <h2 class="auth-title">Reset your password</h2>
            <p class="auth-subtitle">
              Enter your account email and we'll send you a reset link.
            </p>

            <label class="auth-label">Email address</label>
            <input
              v-model="forgotEmail"
              type="email"
              class="auth-input"
              required
            />
            <p class="inline-error">{{ forgotError }}</p>

            <button
              class="auth-btn"
              :disabled="forgotLoading"
              @click="submitForgotPassword"
            >
              <span class="btn-content">
                <span
                  v-if="forgotLoading"
                  class="btn-spinner"
                  aria-hidden="true"
                ></span>
                {{ forgotLoading ? "Sending..." : "Send Reset Link" }}
              </span>
            </button>

            <div class="inside-sep">or</div>
            <p class="auth-footer centered">
              <router-link to="/demo">Explore the demo instead</router-link>
            </p>
          </div>

          <div v-else class="slide-panel check-email-panel form-shell">
            <div class="mail-icon">✉</div>
            <h2 class="auth-title centered-title">Check your email</h2>
            <p class="auth-subtitle centered-subtitle">
              We sent a reset link to:
            </p>
            <p class="email-highlight">{{ forgotEmail }}</p>
            <p class="expiry-note">The link expires in 15 minutes.</p>

            <div class="resend-box">
              <span>Didn't get it? Check spam · </span>
              <button
                class="resend-btn"
                type="button"
                :disabled="resendCooldown > 0 || resendLoading"
                @click="resendResetEmail"
              >
                {{ resendLabel }}
              </button>
              <span class="resend-ok" v-if="resendSuccess">Sent!</span>
            </div>

            <button
              class="top-link center-link"
              type="button"
              @click="goBackToLogin"
            >
              Back to login
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import apiClient from "../services/http";
import { useToastStore } from "../stores/toast";

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const form = reactive({
  email: "",
  password: "",
});

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const showPassword = ref(false);

const panel = ref("login");
const forgotEmail = ref("");
const forgotError = ref("");
const forgotLoading = ref(false);
const resendLoading = ref(false);
const resendSuccess = ref(false);
const resendCooldown = ref(0);
let resendInterval = null;

const resendLabel = computed(() => {
  if (resendLoading.value) {
    return "Sending...";
  }
  if (resendCooldown.value > 0) {
    return `Resend in ${resendCooldown.value}s...`;
  }
  return "Resend email";
});

async function handleSubmit() {
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });
    toastStore.showToast("Welcome back!", "success");
    router.push({ name: "overview" });
  } catch (error) {
    const message = error?.response?.data?.message || "Login failed";
    toastStore.showToast(
      Array.isArray(message) ? message.join(", ") : message,
      "error",
    );
  }
}

function openForgotPanel() {
  panel.value = "forgot";
  forgotError.value = "";
  forgotEmail.value = form.email || "";
}

function clearResendTimer() {
  if (resendInterval) {
    clearInterval(resendInterval);
    resendInterval = null;
  }
}

function startResendCooldown() {
  resendCooldown.value = 60;
  clearResendTimer();

  resendInterval = setInterval(() => {
    if (resendCooldown.value <= 1) {
      resendCooldown.value = 0;
      clearResendTimer();
      return;
    }
    resendCooldown.value -= 1;
  }, 1000);
}

function goBackToLogin() {
  panel.value = "login";
  showPassword.value = false;
  forgotError.value = "";
  resendSuccess.value = false;
  resendCooldown.value = 0;
  clearResendTimer();
}

async function submitForgotPassword() {
  forgotError.value = "";
  resendSuccess.value = false;

  if (!forgotEmail.value.trim()) {
    forgotError.value = "No account found with that email address.";
    return;
  }

  forgotLoading.value = true;

  try {
    await apiClient.post("/auth/forgot-password", {
      email: forgotEmail.value.trim(),
    });

    panel.value = "check-email";
  } catch (error) {
    const message =
      error?.response?.data?.message || "Unable to send reset link.";
    forgotError.value = Array.isArray(message) ? message.join(", ") : message;
  } finally {
    forgotLoading.value = false;
  }
}

async function resendResetEmail() {
  if (resendCooldown.value > 0 || resendLoading.value) {
    return;
  }

  resendLoading.value = true;
  resendSuccess.value = false;

  try {
    await apiClient.post("/auth/resend-reset", {
      email: forgotEmail.value.trim(),
    });

    resendSuccess.value = true;
    setTimeout(() => {
      resendSuccess.value = false;
    }, 3000);
    startResendCooldown();
  } catch (error) {
    const message =
      error?.response?.data?.message || "Unable to resend reset email.";
    toastStore.showToast(
      Array.isArray(message) ? message.join(", ") : message,
      "error",
    );
  } finally {
    resendLoading.value = false;
  }
}

onBeforeUnmount(() => {
  clearResendTimer();
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background:
    radial-gradient(
      ellipse 120% 80% at 20% 50%,
      rgba(79, 142, 247, 0.08) 0%,
      rgba(13, 15, 20, 0) 70%
    ),
    var(--bg);
}

.login-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 40% 60%;
}

.auth-card {
  width: min(380px, 100%);
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.32);
  opacity: 0;
  animation: right-in 0.4s ease-out 0.1s forwards;
}

.left-panel {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
  padding: 44px 36px;
  border-right: 1px solid var(--border);
  background:
    radial-gradient(
      ellipse 120% 80% at 20% 50%,
      rgba(79, 142, 247, 0.12) 0%,
      rgba(13, 15, 20, 0) 70%
    ),
    var(--bg);
  overflow: hidden;
  opacity: 0;
  animation: left-in 0.4s ease-out forwards;
}

.left-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

.left-top,
.left-middle,
.left-footer {
  position: relative;
  z-index: 1;
}

.brand-wordmark {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 0.12em;
  margin: 0;
}

.brand-sub {
  margin: 4px 0 0;
  color: var(--text3);
  font-size: 10px;
  text-transform: lowercase;
  font-family: var(--font-mono);
}

.left-middle {
  display: grid;
  align-content: center;
  gap: 18px;
}

.hero-quote {
  margin: 0;
  font-family: var(--font-display);
  font-size: 26px;
  line-height: 1.2;
  max-width: 16ch;
}

.terminal-snippet {
  background: #0a0c10;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.term-head {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.term-head span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
}

.terminal-snippet p {
  margin: 0 0 5px;
}

.prompt {
  color: var(--accent);
}

.term-output {
  color: var(--text2);
}

.cursor {
  animation: blink 1s steps(2, start) infinite;
}

.pill-stack {
  display: grid;
  gap: 8px;
}

.feature-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 8px 14px;
  color: var(--text2);
  font-size: 11px;
  font-family: var(--font-mono);
}

.pill-icon {
  color: var(--accent);
}

.left-footer {
  margin: 0;
  font-size: 10px;
  color: var(--text3);
  font-family: var(--font-mono);
}

.right-panel {
  background: var(--bg2);
  border-left: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.mobile-brand {
  display: none;
}

.form-shell {
  width: 100%;
}

.auth-title {
  font-family: var(--font-display);
  font-size: 28px;
  margin: 0 0 6px;
}

.auth-subtitle {
  color: var(--text2);
  margin: 0 0 28px;
  font-size: 12px;
  font-family: var(--font-mono);
}

.auth-label {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 6px;
  color: var(--text3);
  font-family: var(--font-mono);
}

.auth-input {
  width: 100%;
  margin-bottom: 14px;
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text);
  border-radius: var(--radius);
  padding: 10px 11px;
  font-family: var(--font-mono);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap .auth-input {
  padding-right: 40px;
  margin-bottom: 0;
}

.pwd-toggle {
  position: absolute;
  right: 10px;
  border: none;
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}

.pwd-toggle:hover {
  color: var(--text2);
}

.forgot-link {
  width: 100%;
  display: block;
  border: none;
  background: transparent;
  text-align: right;
  margin: 6px 0 10px;
  padding: 0;
  color: var(--text3);
  font-size: 10px;
  font-family: var(--font-mono);
  cursor: pointer;
}

.forgot-link:hover {
  color: var(--accent);
}

.auth-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(79, 142, 247, 0.15);
}

.auth-btn {
  width: 100%;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  padding: 11px;
  font-family: var(--font-mono);
  cursor: pointer;
}

.btn-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sso-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-size: 10px;
  color: var(--text3);
  font-family: var(--font-mono);
}

.sso-divider::before,
.sso-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.sso-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.sso-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text2);
  font-family: var(--font-mono);
  font-size: 11px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.sso-btn:hover {
  border-color: var(--border2);
  background: var(--bg4);
  color: var(--text);
  transform: translateY(-1px);
}

.sso-btn.github:hover {
  border-color: #555;
  color: #fff;
}

.sso-btn.google:hover {
  border-color: #4285f4;
}

.sso-btn.facebook:hover {
  border-color: #1877f2;
}

.sso-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.auth-footer {
  margin-top: 12px;
  font-size: 11px;
  color: var(--text2);
  font-family: var(--font-mono);
}

.auth-footer a {
  color: var(--accent);
}

.slide-panel {
  opacity: 1;
  transform: translateX(0);
  animation: panel-in 0.22s ease-out;
}

.forgot-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.top-link {
  border: none;
  background: transparent;
  color: var(--text3);
  font-size: 10px;
  font-family: var(--font-mono);
  cursor: pointer;
  padding: 0;
}

.top-link:hover {
  color: var(--text2);
}

.center-link {
  margin-inline: auto;
}

.inside-sep {
  margin: 14px 0 8px;
  text-align: center;
  color: var(--text3);
  font-size: 10px;
}

.centered {
  text-align: center;
}

.inline-error {
  min-height: 14px;
  margin: -8px 0 4px;
  color: var(--red);
  font-size: 10px;
}

.check-email-panel {
  text-align: center;
}

.mail-icon {
  color: var(--accent);
  font-size: 36px;
  line-height: 1;
  margin: 2px 0 10px;
}

.centered-title {
  text-align: center;
}

.centered-subtitle {
  margin-bottom: 8px;
}

.email-highlight {
  color: var(--accent);
  font-size: 12px;
  margin: 0 0 8px;
}

.expiry-note {
  color: var(--text3);
  font-size: 10px;
  margin: 0 0 10px;
}

.resend-box {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px;
  color: var(--text3);
  font-size: 10px;
  margin-bottom: 14px;
}

.resend-btn {
  border: none;
  background: transparent;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}

.resend-btn:disabled {
  color: var(--text3);
  cursor: not-allowed;
}

.resend-ok {
  margin-left: 6px;
  color: var(--green);
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateX(24px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes left-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes right-in {
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
  50% {
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 899px) {
  .login-layout {
    grid-template-columns: 1fr;
  }

  .left-panel {
    display: none;
  }

  .right-panel {
    min-height: 100vh;
    border-left: none;
    padding: 32px 20px;
  }

  .auth-card {
    padding: 24px 20px;
  }

  .mobile-brand {
    display: block;
    margin-bottom: 28px;
  }

  .auth-title {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .sso-btn span {
    display: none;
  }

  .sso-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
