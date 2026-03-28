import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useServersStore } from '../stores/servers'

export function useServerSelection(selectedServerIdRef) {
    const route = useRoute()
    const serversStore = useServersStore()

    watch(
        () => route.query.serverId,
        (newServerId) => {
            if (newServerId) {
                selectedServerIdRef.value = parseInt(newServerId, 10)
            } else if (serversStore.servers.length > 0) {
                selectedServerIdRef.value = serversStore.servers[0].id
            }
        },
        { immediate: true },
    )

    watch(
        () => serversStore.servers,
        (servers) => {
            if (!selectedServerIdRef.value && servers.length > 0) {
                selectedServerIdRef.value = servers[0].id
            }
        },
        { deep: true, immediate: true },
    )

    const selectedServer = computed(() =>
        serversStore.servers.find((server) => server.id === selectedServerIdRef.value),
    )

    return {
        selectedServer,
    }
}
