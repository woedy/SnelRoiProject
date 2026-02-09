"""
Activity Log Utility
Aggregates activities from various models into a unified activity feed for admin monitoring.
"""
from django.db.models import Q, Prefetch
from django.utils import timezone
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .models import (
    User, CustomerProfile, Account, LedgerEntry, 
    KYCDocument, Loan, VirtualCard, TaxRefundApplication,
    GrantApplication, SupportConversation, SupportMessage,
    CryptoDeposit, Notification
)


class ActivityType:
    """Activity type constants"""
    USER_REGISTERED = 'user_registered'
    USER_LOGIN = 'user_login'
    PROFILE_UPDATED = 'profile_updated'
    ACCOUNT_CREATED = 'account_created'
    ACCOUNT_FROZEN = 'account_frozen'
    ACCOUNT_UNFROZEN = 'account_unfrozen'
    TRANSACTION_CREATED = 'transaction_created'
    TRANSACTION_APPROVED = 'transaction_approved'
    TRANSACTION_DECLINED = 'transaction_declined'
    KYC_SUBMITTED = 'kyc_submitted'
    KYC_APPROVED = 'kyc_approved'
    KYC_REJECTED = 'kyc_rejected'
    LOAN_APPLIED = 'loan_applied'
    LOAN_APPROVED = 'loan_approved'
    LOAN_REJECTED = 'loan_rejected'
    LOAN_DISBURSED = 'loan_disbursed'
    LOAN_PAYMENT = 'loan_payment'
    VIRTUAL_CARD_REQUESTED = 'virtual_card_requested'
    VIRTUAL_CARD_APPROVED = 'virtual_card_approved'
    VIRTUAL_CARD_FROZEN = 'virtual_card_frozen'
    TAX_REFUND_SUBMITTED = 'tax_refund_submitted'
    TAX_REFUND_APPROVED = 'tax_refund_approved'
    TAX_REFUND_REJECTED = 'tax_refund_rejected'
    GRANT_APPLIED = 'grant_applied'
    GRANT_APPROVED = 'grant_approved'
    GRANT_REJECTED = 'grant_rejected'
    SUPPORT_MESSAGE = 'support_message'
    CRYPTO_DEPOSIT_INITIATED = 'crypto_deposit_initiated'
    CRYPTO_DEPOSIT_VERIFIED = 'crypto_deposit_verified'
    ADMIN_ACTION = 'admin_action'


def format_activity_entry(
    activity_type: str,
    timestamp: datetime,
    user: Optional[User] = None,
    customer: Optional[CustomerProfile] = None,
    description: str = '',
    metadata: Dict[str, Any] = None,
    actor: Optional[User] = None,
    reference: str = '',
    amount: Optional[float] = None,
    status: str = '',
) -> Dict[str, Any]:
    """
    Format an activity entry into a standardized structure.
    
    Args:
        activity_type: Type of activity (use ActivityType constants)
        timestamp: When the activity occurred
        user: User associated with the activity
        customer: Customer profile associated with the activity
        description: Human-readable description
        metadata: Additional data about the activity
        actor: User who performed the action (for admin actions)
        reference: Reference number/ID
        amount: Transaction amount if applicable
        status: Current status
    
    Returns:
        Formatted activity dictionary
    """
    return {
        'activity_type': activity_type,
        'timestamp': timestamp.isoformat() if timestamp else None,
        'user_id': user.id if user else (customer.user.id if customer else None),
        'user_email': user.email if user else (customer.user.email if customer else None),
        'user_name': (user.get_full_name() if hasattr(user, 'get_full_name') else user.email) if user else (customer.full_name if customer else None),
        'description': description,
        'metadata': metadata or {},
        'actor_id': actor.id if actor else None,
        'actor_email': actor.email if actor else None,
        'reference': reference,
        'amount': float(amount) if amount else None,
        'status': status,
    }


def get_user_activity(user_id: int, limit: int = 50, activity_types: List[str] = None) -> List[Dict[str, Any]]:
    """
    Get all activities for a specific user.
    
    Args:
        user_id: User ID to get activities for
        limit: Maximum number of activities to return
        activity_types: Filter by specific activity types
    
    Returns:
        List of activity entries sorted by timestamp (newest first)
    """
    try:
        user = User.objects.get(id=user_id)
        customer = CustomerProfile.objects.filter(user=user).first()
    except User.DoesNotExist:
        return []
    
    activities = []
    
    # User registration
    activities.append(format_activity_entry(
        activity_type=ActivityType.USER_REGISTERED,
        timestamp=user.date_joined,
        user=user,
        description=f"User {user.email} registered",
    ))
    
    if customer:
        # Profile updates
        if customer.updated_at != customer.created_at:
            activities.append(format_activity_entry(
                activity_type=ActivityType.PROFILE_UPDATED,
                timestamp=customer.updated_at,
                customer=customer,
                description=f"Profile updated",
                metadata={'profile_completion': customer.profile_completion_percentage}
            ))
        
        # Accounts
        for account in customer.accounts.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.ACCOUNT_CREATED,
                timestamp=account.created_at if hasattr(account, 'created_at') else customer.created_at,
                customer=customer,
                description=f"{account.get_type_display()} account created",
                reference=account.account_number,
                metadata={'account_type': account.type, 'currency': account.currency}
            ))
        
        # Transactions
        for entry in LedgerEntry.objects.filter(created_by=user).order_by('-created_at')[:20]:
            activities.append(format_activity_entry(
                activity_type=ActivityType.TRANSACTION_CREATED,
                timestamp=entry.created_at,
                customer=customer,
                description=f"{entry.get_entry_type_display()}: {entry.memo}",
                reference=entry.reference,
                status=entry.status,
                metadata={'entry_type': entry.entry_type}
            ))
        
        # KYC Documents
        for doc in customer.kyc_documents.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.KYC_SUBMITTED,
                timestamp=doc.uploaded_at,
                customer=customer,
                description=f"KYC document uploaded: {doc.get_document_type_display()}",
                status=doc.status,
                metadata={'document_type': doc.document_type}
            ))
            if doc.verified_at:
                activities.append(format_activity_entry(
                    activity_type=ActivityType.KYC_APPROVED if doc.status == 'APPROVED' else ActivityType.KYC_REJECTED,
                    timestamp=doc.verified_at,
                    customer=customer,
                    description=f"KYC document {doc.status.lower()}: {doc.get_document_type_display()}",
                    actor=doc.verified_by,
                    status=doc.status,
                ))
        
        # Loans
        for loan in customer.loans.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.LOAN_APPLIED,
                timestamp=loan.application_date,
                customer=customer,
                description=f"Loan application: {loan.get_loan_type_display()}",
                amount=float(loan.requested_amount),
                status=loan.status,
            ))
            if loan.reviewed_at:
                activities.append(format_activity_entry(
                    activity_type=ActivityType.LOAN_APPROVED if loan.status == 'APPROVED' else ActivityType.LOAN_REJECTED,
                    timestamp=loan.reviewed_at,
                    customer=customer,
                    description=f"Loan {loan.status.lower()}",
                    actor=loan.reviewed_by,
                    amount=float(loan.approved_amount) if loan.approved_amount else None,
                ))
        
        # Virtual Cards
        for card in customer.virtual_cards.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.VIRTUAL_CARD_REQUESTED,
                timestamp=card.created_at,
                customer=customer,
                description=f"Virtual card requested: {card.get_card_type_display()}",
                status=card.status,
            ))
            if card.approved_at:
                activities.append(format_activity_entry(
                    activity_type=ActivityType.VIRTUAL_CARD_APPROVED,
                    timestamp=card.approved_at,
                    customer=customer,
                    description=f"Virtual card approved",
                    actor=card.approved_by,
                ))
        
        # Tax Refunds
        for tax_app in customer.tax_refund_applications.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.TAX_REFUND_SUBMITTED,
                timestamp=tax_app.submitted_at or tax_app.created_at,
                customer=customer,
                description=f"Tax refund application: {tax_app.application_number}",
                amount=float(tax_app.estimated_refund) if tax_app.estimated_refund else None,
                status=tax_app.status,
            ))
        
        # Grants
        for grant_app in customer.grant_applications.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.GRANT_APPLIED,
                timestamp=grant_app.submitted_at or grant_app.created_at,
                customer=customer,
                description=f"Grant application: {grant_app.grant.title}",
                amount=float(grant_app.requested_amount),
                status=grant_app.status,
            ))
        
        # Crypto Deposits
        for crypto in customer.crypto_deposits.all():
            activities.append(format_activity_entry(
                activity_type=ActivityType.CRYPTO_DEPOSIT_INITIATED,
                timestamp=crypto.created_at,
                customer=customer,
                description=f"Crypto deposit: {crypto.crypto_wallet.get_crypto_type_display()}",
                amount=float(crypto.amount_usd),
                status=crypto.verification_status,
            ))
    
    # Sort by timestamp (newest first) and apply limit
    activities.sort(key=lambda x: x['timestamp'] if x['timestamp'] else '', reverse=True)
    
    # Filter by activity types if specified
    if activity_types:
        activities = [a for a in activities if a['activity_type'] in activity_types]
    
    return activities[:limit]


def get_platform_activity(
    limit: int = 100,
    activity_types: List[str] = None,
    user_id: int = None,
    date_from: datetime = None,
    date_to: datetime = None,
) -> List[Dict[str, Any]]:
    """
    Get platform-wide activities across all users.
    
    Args:
        limit: Maximum number of activities to return
        activity_types: Filter by specific activity types
        user_id: Filter by specific user
        date_from: Filter activities from this date
        date_to: Filter activities until this date
    
    Returns:
        List of activity entries sorted by timestamp (newest first)
    """
    activities = []
    
    # Set default date range if not provided
    if not date_from:
        date_from = timezone.now() - timedelta(days=30)
    if not date_to:
        date_to = timezone.now()
    
    # Build query filters
    date_filter = Q(created_at__gte=date_from, created_at__lte=date_to)
    user_filter = Q(created_by_id=user_id) if user_id else Q()
    
    # Recent Transactions
    for entry in LedgerEntry.objects.filter(date_filter).order_by('-created_at')[:limit]:
        customer = entry.created_by.profile if hasattr(entry.created_by, 'profile') else None
        activities.append(format_activity_entry(
            activity_type=ActivityType.TRANSACTION_CREATED,
            timestamp=entry.created_at,
            user=entry.created_by,
            customer=customer,
            description=f"{entry.get_entry_type_display()}: {entry.memo}",
            reference=entry.reference,
            status=entry.status,
            metadata={'entry_type': entry.entry_type}
        ))
    
    # Recent KYC Submissions
    for doc in KYCDocument.objects.filter(uploaded_at__gte=date_from, uploaded_at__lte=date_to).order_by('-uploaded_at')[:50]:
        activities.append(format_activity_entry(
            activity_type=ActivityType.KYC_SUBMITTED,
            timestamp=doc.uploaded_at,
            customer=doc.customer,
            description=f"KYC document uploaded: {doc.get_document_type_display()}",
            status=doc.status,
        ))
    
    # Recent Loans
    for loan in Loan.objects.filter(application_date__gte=date_from, application_date__lte=date_to).order_by('-application_date')[:50]:
        activities.append(format_activity_entry(
            activity_type=ActivityType.LOAN_APPLIED,
            timestamp=loan.application_date,
            customer=loan.customer,
            description=f"Loan application: {loan.get_loan_type_display()}",
            amount=float(loan.requested_amount),
            status=loan.status,
        ))
    
    # Recent Virtual Cards
    for card in VirtualCard.objects.filter(created_at__gte=date_from, created_at__lte=date_to).order_by('-created_at')[:50]:
        activities.append(format_activity_entry(
            activity_type=ActivityType.VIRTUAL_CARD_REQUESTED,
            timestamp=card.created_at,
            customer=card.customer,
            description=f"Virtual card requested: {card.get_card_type_display()}",
            status=card.status,
        ))
    
    # Recent Tax Refunds
    for tax_app in TaxRefundApplication.objects.filter(created_at__gte=date_from, created_at__lte=date_to).order_by('-created_at')[:50]:
        activities.append(format_activity_entry(
            activity_type=ActivityType.TAX_REFUND_SUBMITTED,
            timestamp=tax_app.submitted_at or tax_app.created_at,
            customer=tax_app.customer,
            description=f"Tax refund: {tax_app.application_number}",
            amount=float(tax_app.estimated_refund) if tax_app.estimated_refund else None,
            status=tax_app.status,
        ))
    
    # Recent Grants
    for grant_app in GrantApplication.objects.filter(created_at__gte=date_from, created_at__lte=date_to).order_by('-created_at')[:50]:
        activities.append(format_activity_entry(
            activity_type=ActivityType.GRANT_APPLIED,
            timestamp=grant_app.submitted_at or grant_app.created_at,
            customer=grant_app.customer,
            description=f"Grant: {grant_app.grant.title}",
            amount=float(grant_app.requested_amount),
            status=grant_app.status,
        ))
    
    # Recent Support Messages
    for msg in SupportMessage.objects.filter(created_at__gte=date_from, created_at__lte=date_to).order_by('-created_at')[:50]:
        customer = msg.conversation.customer
        activities.append(format_activity_entry(
            activity_type=ActivityType.SUPPORT_MESSAGE,
            timestamp=msg.created_at,
            customer=customer,
            description=f"Support message from {msg.get_sender_type_display()}",
            metadata={'sender_type': msg.sender_type, 'conversation_id': msg.conversation.id}
        ))
    
    # Sort by timestamp (newest first) and apply limit
    activities.sort(key=lambda x: x['timestamp'] if x['timestamp'] else '', reverse=True)
    
    # Filter by activity types if specified
    if activity_types:
        activities = [a for a in activities if a['activity_type'] in activity_types]
    
    # Filter by user if specified
    if user_id:
        activities = [a for a in activities if a['user_id'] == user_id]
    
    return activities[:limit]
