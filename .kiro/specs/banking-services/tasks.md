# Implementation Plan: Banking Services

## Overview

This implementation plan breaks down the banking services feature (Loans, Grants, and Tax Refunds) into discrete coding tasks that build incrementally on the existing SnelROI platform. Each task integrates with the current ledger system, KYC validation, and admin approval workflows while maintaining the platform's architectural patterns.

## Tasks

- [ ] 1. Set up banking services models and database structure
  - Create Django models for LoanApplication, GrantApplication, TaxRefundClaim
  - Create ApplicationDocument model with generic foreign key for file uploads
  - Create LoanRepaymentSchedule model for loan payment tracking
  - Generate and run database migrations
  - _Requirements: 1.2, 4.2, 7.2, 10.1_

- [ ]* 1.1 Write property test for application creation consistency
  - **Property 1: Application Creation Consistency**
  - **Validates: Requirements 1.2, 4.2, 7.2**

- [ ] 2. Implement core business logic services
  - [ ] 2.1 Create ApplicationService with approval/rejection methods
    - Implement approve_application() method with ledger integration
    - Implement reject_application() method with notification
    - Add KYC tier validation for eligibility checks
    - _Requirements: 2.4, 5.4, 8.4, 12.2_

  - [ ] 2.2 Create LoanService with calculation methods
    - Implement calculate_monthly_payment() using amortization formula
    - Implement generate_repayment_schedule() method
    - Implement process_loan_payment() with ledger integration
    - _Requirements: 2.3, 3.4, 3.5_

  - [ ]* 2.3 Write property tests for loan calculations
    - **Property 6: Repayment Schedule Generation**
    - **Property 7: Loan Payment Processing**
    - **Validates: Requirements 2.3, 3.4, 3.5**

- [ ] 3. Create Django REST Framework serializers and API endpoints
  - [ ] 3.1 Create serializers for all application models
    - LoanApplicationSerializer with nested document handling
    - GrantApplicationSerializer with program validation
    - TaxRefundClaimSerializer with tax year validation
    - ApplicationDocumentSerializer for file uploads
    - _Requirements: 1.1, 4.1, 7.1_

  - [ ] 3.2 Implement customer-facing API endpoints
    - POST /api/loans/applications/ - Submit loan application
    - POST /api/grants/applications/ - Submit grant application
    - POST /api/tax-refunds/claims/ - Submit tax refund claim
    - GET endpoints for listing customer applications
    - POST endpoints for document uploads
    - _Requirements: 1.2, 4.2, 7.2, 1.3, 4.3_

  - [ ] 3.3 Implement admin API endpoints
    - GET /api/admin/applications/ with filtering
    - PUT /api/admin/applications/{id}/approve/
    - PUT /api/admin/applications/{id}/reject/
    - PUT /api/admin/documents/{id}/verify/
    - _Requirements: 2.1, 5.1, 8.1, 5.3, 8.3_

  - [ ]* 3.4 Write property tests for API endpoints
    - **Property 2: Document Upload and Storage**
    - **Property 8: Document Verification Workflow**
    - **Validates: Requirements 1.3, 4.3, 10.1, 5.3, 8.3**

- [ ] 4. Checkpoint - Ensure backend API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Integrate with existing ledger system
  - [ ] 5.1 Create ledger posting methods for banking services
    - Add create_loan_disbursement_posting() method
    - Add create_grant_disbursement_posting() method
    - Add create_tax_refund_posting() method
    - Add create_loan_payment_posting() method
    - _Requirements: 3.1, 6.1, 9.1, 3.5_

  - [ ] 5.2 Update ApplicationService to use ledger integration
    - Modify approve_application() to create ledger postings
    - Add disbursement status tracking
    - Implement rollback mechanism for failed postings
    - _Requirements: 3.2, 6.2, 9.2_

  - [ ]* 5.3 Write property tests for ledger integration
    - **Property 3: Ledger Integration for All Transactions**
    - **Property 5: Disbursement Status Updates**
    - **Validates: Requirements 3.1, 3.5, 6.1, 9.1, 12.1, 3.2, 6.2, 9.2**

- [ ] 6. Implement email notification system
  - [ ] 6.1 Create email templates for banking services
    - loan_application_confirmation.html
    - grant_application_confirmation.html
    - tax_refund_confirmation.html
    - application_approved.html
    - application_rejected.html
    - _Requirements: 1.4, 4.4, 7.4, 2.4, 5.5, 8.5_

  - [ ] 6.2 Add email sending to ApplicationService
    - Integrate with existing Django email backend
    - Add send_confirmation_email() method
    - Add send_status_update_email() method
    - _Requirements: 11.1, 11.2, 12.4_

  - [ ]* 6.3 Write property test for notification system
    - **Property 4: Status Change Notifications**
    - **Validates: Requirements 1.4, 2.4, 4.4, 6.4, 7.4, 9.4, 11.1, 11.2**

- [ ] 7. Create customer UI components for snel-roi-bank
  - [ ] 7.1 Create application form components
    - LoanApplicationForm.tsx with React Hook Form + Zod validation
    - GrantApplicationForm.tsx with program selection
    - TaxRefundForm.tsx with tax year validation
    - DocumentUpload.tsx reusable component
    - _Requirements: 1.1, 4.1, 7.1_

  - [ ] 7.2 Create banking services dashboard
    - BankingServicesDashboard.tsx overview component
    - ApplicationStatus.tsx with real-time updates
    - ActiveLoans.tsx with payment functionality
    - ApplicationHistory.tsx for historical view
    - _Requirements: 3.3, 4.5, 7.5, 6.3, 9.3_

  - [ ] 7.3 Add banking services routes and navigation
    - Add routes to React Router configuration
    - Update main navigation to include banking services
    - Add route protection for authenticated users
    - _Requirements: 1.1, 4.1, 7.1_

- [ ] 8. Create admin UI components for snel-roi-admin
  - [ ] 8.1 Create application review components
    - ApplicationReviewDashboard.tsx with filtering
    - ApplicationDetailView.tsx for detailed review
    - DocumentVerificationPanel.tsx for document review
    - ApprovalInterface.tsx for approve/reject actions
    - _Requirements: 2.1, 5.1, 8.1, 2.2, 5.2, 8.2_

  - [ ] 8.2 Create service-specific management components
    - LoanManagement.tsx with repayment schedule display
    - GrantManagement.tsx with program management
    - TaxRefundManagement.tsx with tax document verification
    - _Requirements: 2.2, 5.2, 8.2_

  - [ ] 8.3 Add admin routes and navigation
    - Add banking services routes to admin router
    - Update admin navigation menu
    - Add role-based access controls
    - _Requirements: 2.1, 5.1, 8.1_

- [ ] 9. Create API service layers for frontend
  - [ ] 9.1 Create customer API services
    - loanService.ts for loan-related API calls
    - grantService.ts for grant-related API calls
    - taxRefundService.ts for tax refund API calls
    - documentService.ts for file upload handling
    - _Requirements: 1.2, 4.2, 7.2, 1.3, 4.3_

  - [ ] 9.2 Create admin API services
    - adminApplicationService.ts for application management
    - adminDocumentService.ts for document verification
    - Configure TanStack Query for server state management
    - _Requirements: 2.1, 5.1, 8.1, 5.3, 8.3_

- [ ]* 9.3 Write property tests for UI information display
  - **Property 9: Application Review Information Display**
  - **Property 10: KYC Integration**
  - **Validates: Requirements 2.2, 5.2, 8.2, 12.2**

- [ ] 10. Checkpoint - Ensure frontend integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add URL routing and wire everything together
  - [ ] 11.1 Update Django URL configuration
    - Add banking services URLs to backend/bank/urls.py
    - Configure proper URL namespacing
    - Add admin-specific URL patterns
    - _Requirements: All API endpoints_

  - [ ] 11.2 Configure file upload handling
    - Update Django settings for file uploads
    - Configure proper file storage paths
    - Add file type and size validation
    - _Requirements: 10.3, 10.4_

  - [ ] 11.3 Update database migrations and seed data
    - Create sample loan/grant programs for testing
    - Add banking services to admin interface
    - Update existing seed_system command if needed
    - _Requirements: 4.1, 7.1_

- [ ]* 11.4 Write integration tests for complete workflows
  - Test complete loan application to disbursement flow
  - Test complete grant application to disbursement flow
  - Test complete tax refund claim to disbursement flow
  - _Requirements: All requirements_

- [ ] 12. Final checkpoint - Complete system testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of functionality
- Property tests validate universal correctness properties using Hypothesis
- Unit tests validate specific examples and edge cases
- The implementation follows existing SnelROI patterns for consistency