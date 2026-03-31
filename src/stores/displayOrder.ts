import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../services/http";

export const useDisplayOrderStore = defineStore("displayOrder", () => {
  const gridOrder = ref<number[]>([]);
  const sidebarOrder = ref<number[]>([]);
  const loading = ref(false);

  async function fetchOrder(context: "grid" | "sidebar") {
    loading.value = true;
    try {
      const { data } = await apiClient.get(
        `/server-display-order/${context}`,
      );
      const ids: number[] = Array.isArray(data) ? data : data?.orderedServerIds ?? [];
      if (context === "grid") {
        gridOrder.value = ids;
      } else {
        sidebarOrder.value = ids;
      }
    } catch {
      // If endpoint returns 404 or fails, keep current order empty
    } finally {
      loading.value = false;
    }
  }

  async function saveOrder(
    context: "grid" | "sidebar",
    orderedServerIds: number[],
  ) {
    // Update local state immediately for responsive UI
    if (context === "grid") {
      gridOrder.value = orderedServerIds;
    } else {
      sidebarOrder.value = orderedServerIds;
    }

    try {
      await apiClient.put(`/server-display-order/${context}`, {
        orderedServerIds,
      });
    } catch {
      // Silently fail — local state is already updated
    }
  }

  function applyOrder<T extends { id: number }>(
    servers: T[],
    context: "grid" | "sidebar",
  ): T[] {
    const order = context === "grid" ? gridOrder.value : sidebarOrder.value;
    if (!order.length) return servers;

    const orderMap = new Map<number, number>();
    order.forEach((id, index) => orderMap.set(id, index));

    return [...servers].sort((a, b) => {
      const aIndex = orderMap.get(a.id);
      const bIndex = orderMap.get(b.id);
      // Servers not in order go to the end
      if (aIndex === undefined && bIndex === undefined) return 0;
      if (aIndex === undefined) return 1;
      if (bIndex === undefined) return -1;
      return aIndex - bIndex;
    });
  }

  return {
    gridOrder,
    sidebarOrder,
    loading,
    fetchOrder,
    saveOrder,
    applyOrder,
  };
});
