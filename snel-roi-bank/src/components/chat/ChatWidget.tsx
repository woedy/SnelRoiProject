import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { chatService, type SupportConversation, type SupportMessage } from '@/services/chatService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  // Load conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversation) {
      loadConversation();
    }
  }, [isOpen]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && conversation) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen, conversation]);

  // Poll for unread count when chat is closed
  useEffect(() => {
    if (!isOpen) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const conv = await chatService.getOrCreateConversation();
      setConversation(conv);
      setUnreadCount(0); // Reset unread when opening
    } catch (error) {
      toast.error('Failed to load conversation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) return;
    
    pollingIntervalRef.current = setInterval(async () => {
      if (conversation) {
        try {
          const updated = await chatService.getConversation(conversation.id);
          setConversation(updated);
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      await chatService.sendMessage(conversation.id, messageText);
      // Immediately reload conversation to show new message
      const updated = await chatService.getConversation(conversation.id);
      setConversation(updated);
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 md:h-16 md:w-16"
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6 mx-auto md:h-7 md:w-7" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Mobile: Full-screen overlay */}
      <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary-foreground text-primary">
                CS
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Customer Support</h3>
              <p className="text-xs opacity-90">We're here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {conversation?.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {conversation?.messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation with our support team</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending || loading}
              className="flex-1 min-h-[44px]"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending || loading}
              className="min-h-[44px] min-w-[44px]"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Desktop: Floating window */}
      <div className="hidden md:block fixed bottom-20 right-4 z-50 w-96 h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary-foreground text-primary">
                CS
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Customer Support</h3>
              <p className="text-xs opacity-90">We're here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {conversation?.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {conversation?.messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start a conversation</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending || loading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending || loading}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function ChatMessage({ message }: { message: SupportMessage }) {
  const isCustomer = message.sender_type === 'CUSTOMER';
  const formattedTime = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex gap-2', isCustomer ? 'justify-end' : 'justify-start')}>
      {!isCustomer && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            CS
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isCustomer ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 max-w-[280px] md:max-w-xs break-words',
            isCustomer
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        <span className="text-xs text-muted-foreground px-1">{formattedTime}</span>
      </div>
      {isCustomer && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-muted text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
