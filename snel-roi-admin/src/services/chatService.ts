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

class ChatService {
    /**
     * Get or create active conversation for current user
     */
    async getOrCreateConversation(): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>('/support/conversations', {
            method: 'POST',
            body: JSON.stringify({}),
        });
    }

    /**
     * Get all conversations for current user
     */
    async getConversations(): Promise<ConversationListItem[]> {
        return await apiRequest<ConversationListItem[]>('/support/conversations');
    }

    /**
     * Get conversation details with messages
     */
    async getConversation(conversationId: number): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>(`/support/conversations/${conversationId}`);
    }

    /**
     * Send a message in a conversation
     */
    async sendMessage(conversationId: number, message: string): Promise<SupportMessage> {
        return await apiRequest<SupportMessage>(`/support/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiRequest<{ unread_count: number }>('/support/unread-count');
        return response.unread_count;
    }

    /**
     * Update conversation status (admin only)
     */
    async updateConversationStatus(conversationId: number, status: string): Promise<SupportConversation> {
        return await apiRequest<SupportConversation>(`/support/conversations/${conversationId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }
}

export const chatService = new ChatService();
