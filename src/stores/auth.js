import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import apiClient from '../services/http'
import { STORAGE_KEYS } from '../constants/storage'

const ACCESS_TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN
const USER_KEY = STORAGE_KEYS.USER

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || '')
    const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || '')
    const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
    const loading = ref(false)

    const isAuthenticated = computed(() => Boolean(accessToken.value))

    function persistSession(payload) {
        accessToken.value = payload.access_token
        refreshToken.value = payload.refresh_token
        user.value = payload.user

        localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token)
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    }

    function clearSession() {
        accessToken.value = ''
        refreshToken.value = ''
        user.value = null

        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    }

    function setToken(token) {
        accessToken.value = token || ''
        refreshToken.value = ''

        if (token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, token)
        } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY)
        }

        localStorage.removeItem(REFRESH_TOKEN_KEY)
    }

    async function login(payload) {
        loading.value = true
        try {
            const { data } = await apiClient.post('/auth/login', payload)
            persistSession(data)
            return data
        } finally {
            loading.value = false
        }
    }

    async function register(payload) {
        loading.value = true
        try {
            const { data } = await apiClient.post('/auth/register', payload)
            persistSession(data)
            return data
        } finally {
            loading.value = false
        }
    }

    async function refreshSession() {
        if (!refreshToken.value) {
            clearSession()
            throw new Error('Missing refresh token')
        }

        const { data } = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken.value,
        })

        persistSession(data)
        return data
    }

    async function fetchCurrentUser() {
        if (!accessToken.value) {
            return null
        }

        const { data } = await apiClient.get('/auth/me')
        user.value = {
            id: data.id,
            email: data.email,
            name: data.name,
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
        return user.value
    }

    async function initializeAuth() {
        if (!accessToken.value) {
            return
        }

        try {
            await fetchCurrentUser()
        } catch {
            try {
                await refreshSession()
            } catch {
                clearSession()
            }
        }
    }

    function logout() {
        clearSession()
    }

    return {
        accessToken,
        refreshToken,
        user,
        loading,
        isAuthenticated,
        login,
        register,
        refreshSession,
        fetchCurrentUser,
        initializeAuth,
        setToken,
        logout,
    }
})
