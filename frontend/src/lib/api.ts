import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = 'http://localhost:4000'

const api = axios.create({
    baseURL: API_BASE_URL,
})

api.interceptors.request.use(async (config) => {
    const session = await getSession()
    
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    
    return config;
}, (error) => {
    return Promise.reject(error)
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication error. Token may be invalid or expired.')
        }
        return Promise.reject(error)
    }
)

export default api;