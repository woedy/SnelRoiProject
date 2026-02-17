from __future__ import annotations

from email.utils import getaddresses
from typing import Any, Iterable

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.backends.smtp import EmailBackend as SmtpEmailBackend
from django.core.mail.backends.filebased import EmailBackend as FilebasedEmailBackend
from django.core.files.base import ContentFile
from django.utils import timezone

from .models import OutgoingEmail, OutgoingEmailAttachment


def _emails_to_csv(emails: Iterable[str] | None) -> str:
    if not emails:
        return ""
    return ",".join([e for e in emails if e])


def _parse_recipients(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, (list, tuple)):
        return [str(v) for v in value if v]
    return [str(value)]


class AuditingEmailBackend(BaseEmailBackend):
    """Wrap the configured email backend and persist outgoing messages to the DB."""

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self._inner = self._build_inner_backend(*args, **kwargs)

    def _build_inner_backend(self, *args: Any, **kwargs: Any) -> BaseEmailBackend:
        backend_path = getattr(settings, 'AUDIT_EMAIL_INNER_BACKEND', '')
        if backend_path == 'django.core.mail.backends.filebased.EmailBackend':
            return FilebasedEmailBackend(*args, **kwargs)
        return SmtpEmailBackend(*args, **kwargs)

    def open(self):
        return self._inner.open()

    def close(self):
        return self._inner.close()

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        count = 0
        for message in email_messages:
            audit = self._create_audit_row(message)
            try:
                sent = self._inner.send_messages([message])
                if sent:
                    audit.status = 'SENT'
                    audit.sent_at = timezone.now()
                    audit.save(update_fields=['status', 'sent_at', 'updated_at'])
                    count += sent
                else:
                    audit.status = 'FAILED'
                    audit.error_message = 'Email backend reported 0 messages sent.'
                    audit.save(update_fields=['status', 'error_message', 'updated_at'])
            except Exception as exc:
                audit.status = 'FAILED'
                audit.error_message = str(exc)
                audit.save(update_fields=['status', 'error_message', 'updated_at'])
                if not self.fail_silently:
                    raise

        return count

    def _create_audit_row(self, message) -> OutgoingEmail:
        to_emails = _parse_recipients(getattr(message, 'to', None))
        cc_emails = _parse_recipients(getattr(message, 'cc', None))
        bcc_emails = _parse_recipients(getattr(message, 'bcc', None))
        reply_to = _parse_recipients(getattr(message, 'reply_to', None))

        body = getattr(message, 'body', '') or ''
        text_body = body
        html_body = ''

        alternatives = getattr(message, 'alternatives', None) or []
        for alt_body, mimetype in alternatives:
            if mimetype == 'text/html':
                html_body = alt_body

        audit = OutgoingEmail.objects.create(
            status='PENDING',
            backend=f"{self.__class__.__module__}.{self.__class__.__name__}",
            from_email=getattr(message, 'from_email', '') or '',
            to_emails=_emails_to_csv(to_emails),
            cc_emails=_emails_to_csv(cc_emails),
            bcc_emails=_emails_to_csv(bcc_emails),
            reply_to=_emails_to_csv(reply_to),
            subject=getattr(message, 'subject', '') or '',
            text_body=text_body,
            html_body=html_body,
        )

        attachments = getattr(message, 'attachments', None) or []
        for attachment in attachments:
            filename, content, mimetype = self._normalize_attachment(attachment)
            if filename is None or content is None:
                continue

            if isinstance(content, bytes):
                content_bytes = content
            else:
                content_bytes = str(content).encode('utf-8')

            saved_file = ContentFile(content_bytes, name=filename)
            OutgoingEmailAttachment.objects.create(
                email=audit,
                file=saved_file,
                filename=filename,
                content_type=mimetype or '',
                size=len(content_bytes),
            )

        return audit

    def _normalize_attachment(self, attachment):
        if isinstance(attachment, tuple):
            if len(attachment) == 3:
                return attachment[0], attachment[1], attachment[2]
            if len(attachment) == 2:
                return attachment[0], attachment[1], ''

        if hasattr(attachment, 'read') and hasattr(attachment, 'name'):
            try:
                data = attachment.read()
            except Exception:
                return None, None, None
            return getattr(attachment, 'name', 'attachment'), data, getattr(attachment, 'content_type', '')

        return None, None, None
