import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { chatService, type SupportConversation, type SupportMessage, type ConnectionStatus } from '@/services/chatService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isTyping, setIsTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollRef.current) {
      // For ScrollArea component, we need to find the viewport element
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  // Load conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversation) {
      loadConversation();
    }
  }, [isOpen]);

  // Join WebSocket when chat is open and conversation exists
  useEffect(() => {
    if (isOpen && conversation) {
      chatService.connectToChat(
        conversation.id,
        (newMessage) => {
          setConversation(prev => {
            if (!prev || prev.id !== conversation.id) return prev;
            
            // Avoid duplicate messages
            const exists = prev.messages.some(m => m.id === newMessage.id);
            if (exists) return prev;
            
            return {
              ...prev,
              messages: [...prev.messages, newMessage]
            };
          });
        },
        (isTyping, senderType) => {
          // Only show typing indicator for admin messages
          if (senderType === 'ADMIN') {
            setIsTyping(isTyping);
          }
        },
        (status) => {
          setConnectionStatus(status);
        },
        (status) => {
          setAdminOnline(status === 'online');
        }
      );
    }
    
    return () => {
      if (isOpen && conversation) {
        chatService.disconnect();
      }
    };
  }, [isOpen, conversation?.id]);

  // Poll for unread count ONLY when chat is closed
  useEffect(() => {
    if (!isOpen) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const conv = await chatService.getOrCreateConversation();
      setConversation(conv);
      setUnreadCount(0);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      await chatService.sendMessage(conversation.id, messageText);
      // WebSocket handles adding the message to the UI
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
      setMessage(messageText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Send typing indicator
    if (e.target.value.trim()) {
      chatService.handleTyping();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
    }
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
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
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
              <div className="flex items-center gap-1.5 text-xs opacity-90">
                {getConnectionIcon()}
                <span>{getConnectionText()}</span>
                {adminOnline && connectionStatus === 'connected' && (
                  <span className="ml-1">• Online</span>
                )}
              </div>
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
                  <p className="text-sm mt-2">We typically respond within minutes</p>
                </div>
              )}
              {isTyping && (
                <div className="flex gap-2 items-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      CS
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30">
          {connectionStatus === 'disconnected' && (
            <div className="mb-2 text-sm text-destructive flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>Connection lost. Trying to reconnect...</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={sending || loading || connectionStatus !== 'connected'}
              className="flex-1 min-h-[44px]"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending || loading || connectionStatus !== 'connected'}
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
      <div className="hidden md:flex fixed bottom-20 right-4 z-50 w-96 h-[600px] bg-background border rounded-lg shadow-2xl flex-col overflow-hidden">
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
              <div className="flex items-center gap-1.5 text-xs opacity-90">
                {getConnectionIcon()}
                <span>{getConnectionText()}</span>
                {adminOnline && connectionStatus === 'connected' && (
                  <span className="ml-1">• Online</span>
                )}
              </div>
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
                  <p className="text-xs mt-1">We typically respond within minutes</p>
                </div>
              )}
              {isTyping && (
                <div className="flex gap-2 items-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      CS
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/30">
          {connectionStatus === 'disconnected' && (
            <div className="mb-2 text-xs text-destructive flex items-center gap-1.5">
              <WifiOff className="h-3 w-3" />
              <span>Connection lost. Reconnecting...</span>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={sending || loading || connectionStatus !== 'connected'}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sending || loading || connectionStatus !== 'connected'}
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
    <div className={cn('flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300', isCustomer ? 'justify-end' : 'justify-start')}>
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
