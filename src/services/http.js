import axios from 'axios'
import { STORAGE_KEYS } from '../constants/storage'

const ACCESS_TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN
const USER_KEY = STORAGE_KEYS.USER

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
            if (!refreshToken) {
                isRefreshing = false
                processQueue(error)
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                localStorage.removeItem(REFRESH_TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const { data } = await apiClient.post('/auth/refresh', {
                    refresh_token: refreshToken,
                })

                localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
                localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
                localStorage.setItem(USER_KEY, JSON.stringify(data.user))

                isRefreshing = false
                processQueue(null, data.access_token)

                originalRequest.headers.Authorization = `Bearer ${data.access_token}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                isRefreshing = false
                processQueue(refreshError)
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                localStorage.removeItem(REFRESH_TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
