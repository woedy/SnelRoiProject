import requests
import logging
from .models import TelegramConfig

logger = logging.getLogger(__name__)

def send_telegram_notification(message):
    """
    Sends a notification message to the configured Telegram chat.
    """
    config = TelegramConfig.objects.filter(is_enabled=True).first()
    if not config:
        logger.warning("Telegram notification skipped: No enabled TelegramConfig found.")
        return False

    if not config.bot_token or not config.chat_id:
        logger.warning("Telegram notification skipped: bot_token or chat_id is missing.")
        return False

    url = f"https://api.telegram.org/bot{config.bot_token}/sendMessage"
    payload = {
        "chat_id": config.chat_id,
        "text": message
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {e}")
        return False
