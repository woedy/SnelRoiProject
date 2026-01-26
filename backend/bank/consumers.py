import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import SupportConversation, SupportMessage
from .serializers import SupportMessageSerializer

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope.get('user')
        
        # Verify conversation existence and user access
        if await self.is_authorized():
            await self.accept()
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            logger.info(f"WebSocket connected: conversation={self.conversation_id}, user={self.user.id if self.user else 'anonymous'}")
            
            # Send connection confirmation to client
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to chat'
            }))
            
            # Notify other participants that user is online
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id if self.user else None,
                    'status': 'online'
                }
            )
        else:
            logger.warning(f"WebSocket unauthorized: conversation={self.conversation_id}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Unauthorized access'
            }))
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Notify other participants that user is offline
            if hasattr(self, 'user') and self.user:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_status',
                        'user_id': self.user.id,
                        'status': 'offline'
                    }
                )
            
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
            logger.info(f"WebSocket disconnected: conversation={self.conversation_id}, code={close_code}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')
            
            # Handle different message types
            if message_type == 'message':
                message_text = text_data_json.get('message')
                if not message_text or not message_text.strip():
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Message cannot be empty'
                    }))
                    return
                
                # Save and broadcast message
                message = await self.save_message(message_text.strip())
                
                if message:
                    from .serializers import SupportMessageSerializer
                    serializer = SupportMessageSerializer(message)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': serializer.data
                        }
                    )
                else:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Failed to save message'
                    }))
            
            elif message_type == 'typing':
                # Broadcast typing indicator
                is_typing = text_data_json.get('is_typing', False)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': self.user.id if self.user else None,
                        'is_typing': is_typing,
                        'sender_type': 'ADMIN' if (self.user and self.user.is_staff) else 'CUSTOMER'
                    }
                )
            
            elif message_type == 'ping':
                # Respond to heartbeat
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid message format'
            }))
        except Exception as e:
            logger.error(f"Error in receive: {e}", exc_info=True)
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'An error occurred processing your message'
            }))

    async def chat_message(self, event):
        """Handle chat message event"""
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    async def typing_indicator(self, event):
        """Handle typing indicator event"""
        # Don't send typing indicator back to the sender
        if event.get('user_id') != (self.user.id if self.user else None):
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'is_typing': event['is_typing'],
                'sender_type': event['sender_type']
            }))

    async def user_status(self, event):
        """Handle user online/offline status"""
        # Don't send status back to the user themselves
        if event.get('user_id') != (self.user.id if self.user else None):
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'status': event['status']
            }))

    @database_sync_to_async
    def is_authorized(self):
        """Check if user is authorized to access this conversation"""
        from .models import SupportConversation
        from django.contrib.auth.models import AnonymousUser
        
        user = self.scope.get('user')
        
        # User must be authenticated
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            logger.warning(f"Unauthorized WebSocket attempt: no authenticated user")
            return False
            
        # Check conversation access
        try:
            conversation = SupportConversation.objects.get(pk=self.conversation_id)
            
            # Admin can access all conversations
            if user.is_staff:
                return True
            
            # Customer can only access their own conversation
            return conversation.customer.user == user
            
        except SupportConversation.DoesNotExist:
            logger.warning(f"WebSocket attempt for non-existent conversation: {self.conversation_id}")
            return False
        except Exception as e:
            logger.error(f"Error checking authorization: {e}", exc_info=True)
            return False

    @database_sync_to_async
    def save_message(self, message_text):
        """Save message to database"""
        from .models import SupportConversation, SupportMessage
        from django.utils import timezone
        
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            logger.error("Attempted to save message without authenticated user")
            return None
            
        try:
            conversation = SupportConversation.objects.get(pk=self.conversation_id)
            sender_type = 'ADMIN' if user.is_staff else 'CUSTOMER'
            
            message = SupportMessage.objects.create(
                conversation=conversation,
                sender_type=sender_type,
                sender_user=user,
                message=message_text
            )
            
            # Update conversation metadata
            conversation.last_message_at = timezone.now()
            if conversation.status == 'OPEN' and sender_type == 'ADMIN':
                conversation.status = 'IN_PROGRESS'
            conversation.save(update_fields=['last_message_at', 'status'])
            
            logger.info(f"Message saved: conversation={self.conversation_id}, sender={sender_type}, msg_id={message.id}")
            return message
            
        except SupportConversation.DoesNotExist:
            logger.error(f"Conversation not found: {self.conversation_id}")
            return None
        except Exception as e:
            logger.error(f"Error saving message: {e}", exc_info=True)
            return None
