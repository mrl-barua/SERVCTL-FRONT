import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../services/http";

interface Features {
  keyPath: boolean;
  keyVault: boolean;
  privateNetworks: boolean;
}

export const useAppStore = defineStore("app", () => {
  const deployMode = ref<"cloud" | "local">("local");
  const version = ref("0.0.0");
  const features = ref<Features>({
    keyPath: true,
    keyVault: true,
    privateNetworks: true,
  });
  const loading = ref(false);

  async function initializeConfig() {
    loading.value = true;
    try {
      const { data } = await apiClient.get("/config");
      deployMode.value = data?.deployMode === "cloud" ? "cloud" : "local";
      version.value = data?.version || "0.1.0";
      features.value = {
        keyPath: Boolean(data?.features?.keyPath),
        keyVault: Boolean(data?.features?.keyVault),
        privateNetworks: Boolean(data?.features?.privateNetworks),
      };
    } catch {
      deployMode.value = "local";
      version.value = "0.1.0";
    } finally {
      loading.value = false;
    }
  }

  return {
    deployMode,
    version,
    features,
    loading,
    initializeConfig,
  };
});
