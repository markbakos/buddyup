import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = 'https://buddyup-backend.onrender.com'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
})

api.interceptors.request.use(async (config) => {
    try {
        const session = await getSession()
        
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`
        }
        
        return config;
    } catch (error) {
        console.error('Error in request interceptor:', error);
        return config;
    }
}, (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) {
            console.error('Network error or server not responding:', error.message)
            return Promise.reject(new Error('Network error: Please check your connection and try again.'))
        }
        
        if (error.response?.status === 401) {
            console.error('Authentication error. Token may be invalid or expired.')
            await signOut({ redirect: true, callbackUrl: '/auth/signin' })
            return Promise.reject(new Error('Session expired. Please log in again.'))
        }
        
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response)
        }
        
        return Promise.reject(error)
    }
)

export default api;