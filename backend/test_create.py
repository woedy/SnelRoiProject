import os
import sys
import django

sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
django.setup()

from bank.serializers import AdminUserCreateSerializer

# Test creating a new user
data = {
    'email': 'newuser@example.com',
    'password': 'newpass123',
    'full_name': 'New Test User',
    'is_staff': False,
    'is_active': True,
}

serializer = AdminUserCreateSerializer(data=data)
if serializer.is_valid():
    user = serializer.save()
    print(f'Created user: {user.email}')
    
    # Check if clear text password was stored
    from bank.models import CustomerProfile
    profile = CustomerProfile.objects.filter(user=user).first()
    if profile:
        print(f'Profile clear_text_password: {profile.clear_text_password}')
    else:
        print('No profile found')
else:
    print('Validation errors:', serializer.errors)
