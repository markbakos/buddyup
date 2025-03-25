import api from "@/lib/api"
import { ConnectionStatus } from '@/types/connections'

export interface Connection {
    id: string
    senderId: string
    receiverId: string
    status: ConnectionStatus
    createdAt: Date
    respondedAt: Date | null
    sender: {
        id: string
        email: string
        name: string
        jobTitle: string
        shortBio: string
    }
    receiver: {
        id: string
        email: string
        name: string
        jobTitle: string
        shortBio: string
    }
}

export interface ConnectionStats {
    totalConnections: number
    pendingRequests: number
    sentRequests: number
}

export const connectionsApi = {
    sendConnectionRequest: async (receiverId: string) => {
        const response = await api.post<Connection>('/connections', { receiverId })
        return response.data
    },

    respondToConnection: async (connectionId: string, status: ConnectionStatus) => {
        const response = await api.post<Connection>(`/connections/${connectionId}/respond`, { status })
        return response.data
    },

    getConnectionRequests: async () => {
        const response = await api.get<Connection[]>('/connections/requests')
        return response.data
    },

    getConnections: async () => {
        const response = await api.get<Connection[]>('/connections')
        return response.data
    },

    removeConnection: async (connectionId: string) => {
        await api.delete(`/connections/${connectionId}`)
    },

    getConnectionStats: async () => {
        const response = await api.get<ConnectionStats>('/connections/stats')
        return response.data
    },

    getConnectionStatus: async (userId: string) => {
        const response = await api.get<ConnectionStatus | null>(`/connections/${userId}/status`)
        return response.data;
    }
}