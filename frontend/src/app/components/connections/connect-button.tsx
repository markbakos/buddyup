import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { connectionsApi } from '@/lib/api/connections';
import { useToast } from '@/hooks/use-toast';
import { ConnectionStatus } from '@/types/connections';
import { Loader2 } from 'lucide-react';

interface ConnectButtonProps {
    userId: string;
    className?: string;
}

export function ConnectButton({ userId, className }: ConnectButtonProps) {
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadStatus()
    }, [userId])

    const loadStatus = async () => {
        try {
            setLoading(true)
            const connectionStatus = await connectionsApi.getConnectionStatus(userId)
            setStatus(connectionStatus)
        } catch (error) {
            console.error('Error loading connection status:', error)
            toast({
                title: 'Error',
                description: 'Failed to load connection status',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async () => {
        try {
            setActionLoading(true)
            await connectionsApi.sendConnectionRequest(userId)
            setStatus(ConnectionStatus.PENDING)
            toast({
                title: 'Success',
                description: 'Connection request sent'
            })
        } catch (error) {
            console.error('Error sending connection request:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send connection request',
                variant: 'destructive'
            })
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <Button disabled className={className}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
            </Button>
        )
    }

    if (!status) {
        return (
            <Button 
                onClick={handleConnect} 
                className={className}
                disabled={actionLoading}
            >
                {actionLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Connect'
                )}
            </Button>
        )
    }

    if (status === ConnectionStatus.PENDING) {
        return (
            <Button disabled className={className}>
                Request Sent
            </Button>
        )
    }

    if (status === ConnectionStatus.ACCEPTED) {
        return (
            <Button disabled className={className}>
                Connected
            </Button>
        )
    }

    return (
        <Button 
            onClick={handleConnect} 
            className={className}
            disabled={actionLoading}
        >
            {actionLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                </>
            ) : (
                'Connect'
            )}
        </Button>
    )
} 