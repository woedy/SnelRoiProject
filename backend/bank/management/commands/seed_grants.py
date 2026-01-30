from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from bank.models import Grant

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample grant data'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@snelroi.com',
            defaults={
                'username': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )

        # Sample grants data
        grants_data = [
            {
                'title': 'Small Business Innovation Grant',
                'description': 'Supporting innovative small businesses with funding for research and development projects. This grant aims to foster entrepreneurship and technological advancement in emerging markets.',
                'category': 'BUSINESS',
                'provider': 'Department of Commerce',
                'amount': 50000.00,
                'deadline': date.today() + timedelta(days=45),
                'eligibility_requirements': [
                    'Small business owner',
                    'Less than 50 employees',
                    'Innovation focus',
                    'Business plan required'
                ]
            },
            {
                'title': 'Education Excellence Scholarship',
                'description': 'Merit-based scholarship for outstanding students pursuing higher education in STEM fields. Designed to support the next generation of innovators and researchers.',
                'category': 'EDUCATION',
                'provider': 'Education Foundation',
                'amount': 15000.00,
                'deadline': date.today() + timedelta(days=90),
                'eligibility_requirements': [
                    'GPA 3.5 or higher',
                    'Full-time student',
                    'STEM field focus',
                    'Financial need demonstration'
                ]
            },
            {
                'title': 'Community Health Initiative Grant',
                'description': 'Funding for community health programs and medical research initiatives. Supporting projects that improve public health outcomes and healthcare accessibility.',
                'category': 'HEALTHCARE',
                'provider': 'Health Department',
                'amount': 25000.00,
                'deadline': date.today() + timedelta(days=30),
                'eligibility_requirements': [
                    'Healthcare organization',
                    'Community impact focus',
                    'Non-profit status',
                    'Measurable outcomes plan'
                ]
            },
            {
                'title': 'Green Technology Development Fund',
                'description': 'Supporting sustainable technology development and environmental conservation projects. Focused on clean energy, waste reduction, and climate change mitigation.',
                'category': 'ENVIRONMENT',
                'provider': 'Environmental Agency',
                'amount': 75000.00,
                'deadline': date.today() + timedelta(days=120),
                'eligibility_requirements': [
                    'Environmental focus',
                    'Technology innovation',
                    'Sustainability plan',
                    'Environmental impact assessment'
                ]
            },
            {
                'title': 'Arts and Culture Preservation Grant',
                'description': 'Preserving local arts and cultural heritage through community programs. Supporting artists, cultural institutions, and heritage preservation projects.',
                'category': 'ARTS',
                'provider': 'Arts Council',
                'amount': 20000.00,
                'deadline': date.today() + timedelta(days=60),
                'eligibility_requirements': [
                    'Arts organization',
                    'Cultural preservation focus',
                    'Community engagement',
                    'Public benefit demonstration'
                ]
            },
            {
                'title': 'Digital Innovation Accelerator',
                'description': 'Fast-track funding for digital transformation projects and technology startups. Supporting the development of cutting-edge digital solutions.',
                'category': 'TECHNOLOGY',
                'provider': 'Tech Innovation Hub',
                'amount': 100000.00,
                'deadline': date.today() + timedelta(days=75),
                'eligibility_requirements': [
                    'Technology startup',
                    'Digital innovation focus',
                    'Scalable solution',
                    'Market validation'
                ]
            }
        ]

        created_count = 0
        for grant_data in grants_data:
            grant, created = Grant.objects.get_or_create(
                title=grant_data['title'],
                defaults={
                    **grant_data,
                    'created_by': admin_user,
                    'status': 'AVAILABLE'
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created grant: {grant.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Grant already exists: {grant.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} grants')
        )