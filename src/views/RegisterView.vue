<template>
  <div class="auth-shell">
    <form class="auth-card" @submit.prevent="handleSubmit">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Start managing your infrastructure.</p>

      <label class="auth-label">Name</label>
      <input v-model="form.name" type="text" class="auth-input" required />

      <label class="auth-label">Email</label>
      <input v-model="form.email" type="email" class="auth-input" required />

      <label class="auth-label">Password</label>
      <input v-model="form.password" type="password" class="auth-input" required minlength="6" />

      <button class="auth-btn" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creating account...' : 'Register' }}
      </button>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
})

async function handleSubmit() {
  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    toastStore.showToast('Account created successfully', 'success')
    router.push({ name: 'overview' })
  } catch (error) {
    const message = error?.response?.data?.message || 'Registration failed'
    toastStore.showToast(Array.isArray(message) ? message.join(', ') : message, 'error')
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
</style>
