<template>
  <div class="auth-shell">
    <div class="auth-card">
      <form v-if="panel === 'login'" @submit.prevent="handleSubmit">
        <h1 class="auth-title">Sign In</h1>
        <p class="auth-subtitle">Access your ServerCTL workspace.</p>

        <label class="auth-label">Email</label>
        <input v-model="form.email" type="email" class="auth-input" required />

        <label class="auth-label">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="auth-input"
          required
        />

        <button class="forgot-link" type="button" @click="openForgotPanel">
          Forgot password?
        </button>

        <button class="auth-btn" :disabled="authStore.loading">
          {{ authStore.loading ? "Signing in..." : "Sign In" }}
        </button>

        <p class="auth-footer">
          Need an account?
          <router-link to="/register">Register</router-link>
        </p>
      </form>

      <div v-else-if="panel === 'forgot'" class="slide-panel">
        <div class="forgot-top">
          <button class="top-link" type="button" @click="goBackToLogin">
            Back to login
          </button>
          <button class="top-link" type="button" @click="goBackToLogin">
            close
          </button>
        </div>

        <h1 class="auth-title">Reset your password</h1>
        <p class="auth-subtitle">
          Enter your account email and we'll send you a reset link.
        </p>

        <label class="auth-label">Email address</label>
        <input v-model="forgotEmail" type="email" class="auth-input" required />
        <p class="inline-error">{{ forgotError }}</p>

        <button class="auth-btn" :disabled="forgotLoading" @click="submitForgotPassword">
          {{ forgotLoading ? "Sending..." : "Send Reset Link" }}
        </button>

        <div class="inside-sep">or</div>
        <p class="auth-footer centered">
          <router-link to="/demo">Explore the demo instead</router-link>
        </p>
      </div>

      <div v-else class="slide-panel check-email-panel">
        <div class="mail-icon">✉</div>
        <h1 class="auth-title centered-title">Check your email</h1>
        <p class="auth-subtitle centered-subtitle">We sent a reset link to:</p>
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

        <button class="top-link" type="button" @click="goBackToLogin">
          Back to login
        </button>
      </div>
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
    const message = error?.response?.data?.message || "Unable to send reset link.";
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
    const message = error?.response?.data?.message || "Unable to resend reset email.";
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
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(420px, 100%);
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.auth-title {
  font-family: var(--font-display);
  margin-bottom: 6px;
}

.auth-subtitle {
  color: var(--text3);
  margin-bottom: 18px;
  font-size: 12px;
}

.auth-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  color: var(--text3);
}

.auth-input {
  width: 100%;
  margin-bottom: 14px;
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text);
  border-radius: var(--radius);
  padding: 9px 10px;
  font-family: var(--font-mono);
}

.forgot-link {
  width: 100%;
  display: block;
  border: none;
  background: transparent;
  text-align: right;
  margin: -6px 0 10px;
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
}

.auth-btn {
  width: 100%;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  padding: 10px;
  font-family: var(--font-mono);
  cursor: pointer;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text3);
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
</style>
