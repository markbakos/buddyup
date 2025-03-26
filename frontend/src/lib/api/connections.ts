import api from "@/lib/api"
import { Connection, ConnectionStatus, ConnectionStats } from '@/types/connections'


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
        const response = await api.get<Connection[]>('/connections/all')
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
        const response = await api.get<ConnectionStatus | null>(`/connections/status/${userId}`)
        return response.data
    }
}