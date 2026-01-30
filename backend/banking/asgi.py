import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
# Initialize Django ASGI application early to ensure the app registry is loaded
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from bank.middleware import JWTAuthMiddleware
import bank.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            bank.routing.websocket_urlpatterns
        )
    ),
})
