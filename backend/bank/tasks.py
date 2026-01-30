from celery import shared_task
from django.utils import timezone

from .models import LedgerEntry, Statement
from .services import approve_entry
from . import emails # Ensure email tasks are registered


@shared_task
def auto_post_entry(entry_id):
    entry = LedgerEntry.objects.filter(id=entry_id, status='PENDING').first()
    if not entry:
        return
    approver = entry.created_by
    approve_entry(entry, approver)
    
    # Create notification for the customer when deposit is auto-posted
    if entry.entry_type == 'DEPOSIT':
        from .services import create_transaction_notification
        customer = entry.postings.first().account.customer
        amount = entry.postings.filter(direction='CREDIT').first().amount
        create_transaction_notification(
            customer=customer,
            transaction_type='DEPOSIT',
            amount=amount,
            status='POSTED',
            reference=entry.reference
        )


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
