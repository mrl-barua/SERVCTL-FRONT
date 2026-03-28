import { io } from 'socket.io-client'

const SOCKET_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function createAuthenticatedSocket(namespace) {
    const token = localStorage.getItem('servctl_access_token') || ''

    return io(`${SOCKET_BASE_URL}/${namespace}`, {
        transports: ['websocket'],
        auth: {
            token: token ? `Bearer ${token}` : '',
        },
    })
}
