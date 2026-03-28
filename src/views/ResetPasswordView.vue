<template>
  <div class="auth-shell">
    <div class="auth-card" v-if="!success">
      <h1 class="auth-title">Set a new password</h1>
      <p class="auth-subtitle">
        Choose a strong password for your SERVCTL account.
      </p>

      <template v-if="tokenMissing">
        <p class="auth-error">
          Reset token is missing. Redirecting to login...
        </p>
      </template>

      <template v-else>
        <label class="auth-label">New Password</label>
        <div class="input-wrap">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="auth-input"
            autocomplete="new-password"
          />
          <button
            class="toggle-btn"
            type="button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "Hide" : "Show" }}
          </button>
        </div>

        <label class="auth-label">Confirm Password</label>
        <div class="input-wrap">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="auth-input"
            autocomplete="new-password"
          />
          <button
            class="toggle-btn"
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            {{ showConfirmPassword ? "Hide" : "Show" }}
          </button>
        </div>

        <div class="strength-wrap">
          <div class="strength-label">Password strength</div>
          <div class="strength-bar">
            <span
              class="strength-fill"
              :class="strengthClass"
              :style="{ width: strengthWidth }"
            ></span>
          </div>
          <div class="strength-text" :class="strengthClass">
            {{ strengthText }}
          </div>
        </div>

        <button class="auth-btn" :disabled="loading" @click="submitReset">
          {{ loading ? "Updating..." : "Update Password" }}
        </button>

        <p class="auth-error" v-if="errorText">{{ errorText }}</p>

        <p class="auth-footer" v-if="expired">
          This link has expired.
          <router-link to="/login">Request a new reset link</router-link>
        </p>
      </template>
    </div>

    <div class="auth-card success-card" v-else>
      <h1 class="auth-title success">Password updated!</h1>
      <p class="auth-subtitle">You can now log in with your new password.</p>
      <router-link class="auth-btn-link" to="/login">Go to Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "../services/http";

const route = useRoute();
const router = useRouter();

const token = ref("");
const tokenMissing = ref(false);
const loading = ref(false);
const expired = ref(false);
const success = ref(false);
const errorText = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  password: "",
  confirmPassword: "",
});

const strengthScore = computed(() => {
  const value = form.password || "";
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
});

const strengthWidth = computed(() => `${(strengthScore.value / 4) * 100}%`);

const strengthClass = computed(() => {
  if (strengthScore.value <= 2) return "weak";
  if (strengthScore.value === 3) return "fair";
  return "strong";
});

const strengthText = computed(() => {
  if (strengthScore.value <= 2) return "Weak";
  if (strengthScore.value === 3) return "Fair";
  return "Strong";
});

onMounted(() => {
  const rawToken = route.query.token;
  token.value = typeof rawToken === "string" ? rawToken : "";

  if (!token.value) {
    tokenMissing.value = true;
    setTimeout(() => {
      router.replace({ name: "login" });
    }, 600);
  }
});

async function submitReset() {
  expired.value = false;
  errorText.value = "";

  if (!form.password || !form.confirmPassword) {
    errorText.value = "Please fill in both password fields.";
    return;
  }

  loading.value = true;

  try {
    await apiClient.post("/auth/reset-password", {
      token: token.value,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });

    success.value = true;
  } catch (error) {
    const message =
      error?.response?.data?.message || "Unable to reset password.";
    const formatted = Array.isArray(message) ? message.join(", ") : message;
    errorText.value = formatted;

    if (
      String(formatted).toLowerCase().includes("expired") ||
      String(formatted).toLowerCase().includes("invalid")
    ) {
      expired.value = true;
    }
  } finally {
    loading.value = false;
  }
}
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

.auth-title.success {
  color: var(--green);
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

.input-wrap {
  position: relative;
  margin-bottom: 14px;
}

.auth-input {
  width: 100%;
  border: 1px solid var(--border2);
  background: var(--bg3);
  color: var(--text);
  border-radius: var(--radius);
  padding: 9px 64px 9px 10px;
  font-family: var(--font-mono);
}

.toggle-btn {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--text3);
  font-size: 11px;
  cursor: pointer;
}

.toggle-btn:hover {
  color: var(--text2);
}

.auth-input:focus {
  outline: none;
  border-color: var(--accent);
}

.strength-wrap {
  margin-bottom: 14px;
}

.strength-label {
  font-size: 10px;
  color: var(--text3);
  margin-bottom: 6px;
}

.strength-bar {
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: var(--bg4);
  overflow: hidden;
}

.strength-fill {
  display: block;
  height: 100%;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.strength-text {
  margin-top: 6px;
  font-size: 10px;
}

.weak {
  color: var(--red);
  background-color: var(--red);
}

.fair {
  color: var(--yellow);
  background-color: var(--yellow);
}

.strong {
  color: var(--green);
  background-color: var(--green);
}

.auth-btn,
.auth-btn-link {
  width: 100%;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  padding: 10px;
  font-family: var(--font-mono);
  cursor: pointer;
  text-align: center;
  display: block;
  text-decoration: none;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-error {
  margin-top: 12px;
  font-size: 11px;
  color: var(--red);
}

.auth-footer {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text3);
}

.auth-footer a {
  color: var(--accent);
}
</style>
