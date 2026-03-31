<template>
  <div class="callback-loading">
    <div class="spinner" aria-hidden="true"></div>
    <p>Signing you in...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import apiClient from "../services/http";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  const code = typeof route.query.code === "string" ? route.query.code : "";

  if (!code) {
    router.replace("/login?error=sso_failed");
    return;
  }

  try {
    const { data } = await apiClient.post("/auth/exchange-code", { code });
    authStore.persistSession(data);
    router.replace("/overview");
  } catch {
    authStore.logout();
    router.replace("/login?error=sso_failed");
  }
});
</script>

<style scoped>
.callback-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 10px;
  color: var(--text2);
  font-family: var(--font-mono);
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 2px solid var(--border2);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
