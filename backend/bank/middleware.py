"""
WebSocket Authentication Middleware for Django Channels
"""
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens.
    Token should be passed as a query parameter: ?token=<jwt_token>
    """

    async def __call__(self, scope, receive, send):
        # Parse query string to get token
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            try:
                # Validate and decode token
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                
                # Get user from database
                scope['user'] = await self.get_user(user_id)
                logger.info(f"WebSocket authenticated: user_id={user_id}")
            except (TokenError, InvalidToken) as e:
                logger.warning(f"WebSocket auth failed: {e}")
                scope['user'] = AnonymousUser()
            except Exception as e:
                logger.error(f"WebSocket auth error: {e}")
                scope['user'] = AnonymousUser()
        else:
            logger.warning("WebSocket connection without token")
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        """Retrieve user from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
