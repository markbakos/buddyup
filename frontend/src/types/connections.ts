export enum ConnectionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

export interface Connection {
    id: string;
    senderId: string;
    receiverId: string;
    status: ConnectionStatus;
    createdAt: Date;
    respondedAt: Date | null;
    sender: {
        id: string;
        email: string;
        name: string;
        jobTitle: string;
        shortBio: string;
    };
    receiver: {
        id: string;
        email: string;
        name: string;
        jobTitle: string;
        shortBio: string;
    };
}

export interface ConnectionStats {
    totalConnections: number;
    pendingRequests: number;
    sentRequests: number;
}
