import { apiRequest } from '@/lib/api';

export interface SupportMessage {
    id: number;
    sender_type: 'CUSTOMER' | 'ADMIN';
    sender_name: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface SupportConversation {
    id: number;
    customer_name: string;
    customer_email: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    subject: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
    messages: SupportMessage[];
    unread_count: number;
}

export interface ConversationListItem {
    id: number;
    customer_name: string;
    customer_email: string;
    status: string;
    subject: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
    unread_count: number;
    last_message: {
        message: string;
        sender_type: string;
        created_at: string;
    } | null;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

interface WebSocketMessage {
    type: 'message' | 'typing' | 'user_status' | 'connection_established' | 'error' | 'pong';
    message?: SupportMessage;
    is_typing?: boolean;
    sender_type?: 'CUSTOMER' | 'ADMIN';
    status?: 'online' | 'offline';
}

class ChatService {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private messageHandlers: ((message: SupportMessage) => void)[] = [];
    private typingHandlers: ((isTyping: boolean, senderType: string) => void)[] = [];
    private statusHandlers: ((status: ConnectionStatus) => void)[] = [];
    private userStatusHandlers: ((status: 'online' | 'offline') => void)[] = [];
    private currentConversationId: number | null = null;
    private typingTimeout: NodeJS.Timeout | null = null;

    async getOrCreateConversation(): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>('/support/conversations/', {
            method: 'POST',
            body: JSON.stringify({}),
        });
    }

    async getConversations(): Promise<ConversationListItem[]> {
        return await apiRequest<ConversationListItem[]>('/support/conversations/');
    }

    async getConversation(conversationId: number): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>(`/support/conversations/${conversationId}/`);
    }

    async sendMessage(conversationId: number, message: string): Promise<SupportMessage> {
        return await apiRequest<SupportMessage>(`/support/conversations/${conversationId}/messages/`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    async getUnreadCount(): Promise<number> {
        const response = await apiRequest<{ unread_count: number }>('/support/unread-count/');
        return response.unread_count;
    }

    async updateConversationStatus(conversationId: number, status: string): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>(`/support/conversations/${conversationId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    connectToChat(
        conversationId: number,
        onMessage: (message: SupportMessage) => void,
        onTyping?: (isTyping: boolean, senderType: string) => void,
        onStatusChange?: (status: ConnectionStatus) => void,
        onUserStatus?: (status: 'online' | 'offline') => void
    ): WebSocket | null {
        this.currentConversationId = conversationId;
        this.messageHandlers = [onMessage];
        if (onTyping) this.typingHandlers = [onTyping];
        if (onStatusChange) this.statusHandlers = [onStatusChange];
        if (onUserStatus) this.userStatusHandlers = [onUserStatus];

        this.connect();
        return this.socket;
    }

    private connect() {
        if (!this.currentConversationId) return;

        const token = localStorage.getItem('admin_token') || localStorage.getItem('snel-roi-token') || localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        let wsProtocol = 'ws:';
        let wsHost = window.location.hostname + ':8000';

        if (apiUrl.startsWith('http')) {
            const url = new URL(apiUrl);
            wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            wsHost = url.host;
        }

        const wsUrl = `${wsProtocol}//${wsHost}/ws/support/chat/${this.currentConversationId}/?token=${token}`;

        this.notifyStatus('connecting');

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('✅ Admin chat WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                this.notifyStatus('connected');
                this.startHeartbeat();
            };

            this.socket.onmessage = (event) => {
                const data = this.jsonParse(event.data) as WebSocketMessage;
                if (!data) return;

                switch (data.type) {
                    case 'message':
                        if (data.message) {
                            this.messageHandlers.forEach(handler => handler(data.message!));
                        }
                        break;

                    case 'typing':
                        if (data.is_typing !== undefined && data.sender_type) {
                            this.typingHandlers.forEach(handler =>
                                handler(data.is_typing!, data.sender_type!)
                            );
                        }
                        break;

                    case 'user_status':
                        if (data.status) {
                            this.userStatusHandlers.forEach(handler => handler(data.status!));
                        }
                        break;

                    case 'connection_established':
                        console.log('✅ Connection established:', data.message);
                        break;

                    case 'error':
                        console.error('❌ WebSocket error message:', data.message);
                        break;

                    case 'pong':
                        break;
                }
            };

            this.socket.onclose = (event) => {
                console.log('🔌 Admin chat WebSocket closed:', event.code, event.reason);
                this.stopHeartbeat();
                this.notifyStatus('disconnected');

                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ Admin chat WebSocket error:', error);
                this.notifyStatus('disconnected');
            };

        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
            this.notifyStatus('disconnected');
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Max reconnection attempts reached');
            this.notifyStatus('disconnected');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.notifyStatus('reconnecting');

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    sendTypingIndicator(isTyping: boolean) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'typing',
                is_typing: isTyping
            }));
        }
    }

    handleTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.sendTypingIndicator(true);

        this.typingTimeout = setTimeout(() => {
            this.sendTypingIndicator(false);
        }, 2000);
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.stopHeartbeat();

        if (this.socket) {
            this.socket.close(1000, 'Admin disconnected');
            this.socket = null;
        }

        this.currentConversationId = null;
        this.messageHandlers = [];
        this.typingHandlers = [];
        this.statusHandlers = [];
        this.userStatusHandlers = [];
    }

    private notifyStatus(status: ConnectionStatus) {
        this.statusHandlers.forEach(handler => handler(status));
    }

    private jsonParse(str: string): WebSocketMessage | null {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.error('Failed to parse WebSocket message:', str);
            return null;
        }
    }
}

export const chatService = new ChatService();
