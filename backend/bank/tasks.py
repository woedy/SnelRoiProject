from celery import shared_task
from django.utils import timezone

from .models import LedgerEntry, Statement
from .services import approve_entry


@shared_task
def auto_post_entry(entry_id):
    entry = LedgerEntry.objects.filter(id=entry_id, status='PENDING').first()
    if not entry:
        return
    approver = entry.created_by
    approve_entry(entry, approver)


@shared_task
def generate_statement(statement_id):
    statement = Statement.objects.filter(id=statement_id, status='PENDING').first()
    if not statement:
        return
    statement.content = (
        f"Statement for {statement.customer.full_name}\n"
        f"Period: {statement.period_start} to {statement.period_end}\n"
    )
    statement.status = 'READY'
    statement.generated_at = timezone.now()
    statement.save(update_fields=['content', 'status', 'generated_at'])
