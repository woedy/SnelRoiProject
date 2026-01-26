import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle, User, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { chatService, type ConversationListItem, type SupportConversation, type SupportMessage } from '@/services/chatService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CustomerSupport() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  // Poll for updates when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await chatService.getConversations();
      
      // Filter by status
      const filtered = statusFilter === 'all' 
        ? convs 
        : convs.filter(c => c.status === statusFilter.toUpperCase());
      
      setConversations(filtered);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (id: number) => {
    try {
      const conv = await chatService.getConversation(id);
      setSelectedConversation(conv);
    } catch (error) {
      toast.error('Failed to load conversation');
      console.error(error);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    
    pollingIntervalRef.current = setInterval(async () => {
      if (selectedConversation) {
        try {
          const updated = await chatService.getConversation(selectedConversation.id);
          setSelectedConversation(updated);
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
      // Also refresh conversation list
      loadConversations();
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      await chatService.sendMessage(selectedConversation.id, messageText);
      const updated = await chatService.getConversation(selectedConversation.id);
      setSelectedConversation(updated);
      loadConversations(); // Refresh list
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedConversation) return;

    try {
      const updated = await chatService.updateConversationStatus(selectedConversation.id, newStatus);
      setSelectedConversation(updated);
      loadConversations(); // Refresh list
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      OPEN: { variant: 'destructive', label: 'Open' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      RESOLVED: { variant: 'secondary', label: 'Resolved' },
      CLOSED: { variant: 'outline', label: 'Closed' },
    };
    const config = variants[status] || variants.OPEN;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Conversations List */}
      <Card className="lg:w-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer Support
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conversations</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <Separator />
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversationDetails(conv.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent',
                    selectedConversation?.id === conv.id && 'bg-accent border-primary'
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {conv.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conv.customer_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{conv.customer_email}</p>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {getStatusBadge(conv.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(conv.last_message_at || conv.created_at)}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {conv.last_message.message}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Conversation Detail */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedConversation.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedConversation.customer_email}</p>
                  </div>
                </div>
                <Select value={selectedConversation.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <form onSubmit={handleSendMessage} className="p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your response..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim() || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function ChatMessage({ message }: { message: SupportMessage }) {
  const isAdmin = message.sender_type === 'ADMIN';
  const formattedTime = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex gap-2', isAdmin ? 'justify-end' : 'justify-start')}>
      {!isAdmin && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-muted text-xs">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isAdmin ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 max-w-md break-words',
            isAdmin
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
          {message.is_read && isAdmin && (
            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
      {isAdmin && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
