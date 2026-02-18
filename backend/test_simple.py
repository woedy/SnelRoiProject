import os
import sys
import django

# Set up Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
django.setup()

from django.contrib.auth import get_user_model
from bank.models import CustomerProfile
from bank.serializers import AdminUserSerializer

User = get_user_model()

# Get existing user
user = User.objects.first()
if user:
    print(f'Found user: {user.email}')
    profile = CustomerProfile.objects.filter(user=user).first()
    if profile:
        print(f'Profile clear_text_password: {profile.clear_text_password}')
    
    # Test serializer
    serializer = AdminUserSerializer(user)
    data = serializer.data
    has_password = 'clear_text_password' in data
    print(f'Serializer includes clear_text_password: {has_password}')
    if has_password:
        print(f'Password in serialized data: {data["clear_text_password"]}')
    else:
        print('Password field missing from serializer')
        print('Available fields:', list(data.keys()))
else:
    print('No users found')
