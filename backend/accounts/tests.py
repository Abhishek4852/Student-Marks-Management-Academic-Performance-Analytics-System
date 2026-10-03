import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

# APIClient ko as a fixture define kar rahe hain taaki ise kisi bhi test function me easily use kar sakein
@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_faculty_registration(api_client):
    # 1. Nayi faculty ka data payload banaya
    payload = {
        'username': 'new_faculty',
        'password': 'StrongPassword123',
        'email': 'test@example.com',
        'first_name': 'Arjun',
        'last_name': 'Singh'
    }
    
    # 2. Register API par POST request bheji
    response = api_client.post('/api/auth/faculty/register/', payload, format='json')
    
    # 3. Status Code 201 (Created) aur Success message verify kiya
    assert response.status_code == 201
    assert 'Waiting for admin approval' in response.data['message']
    
    # 4. Database me check kiya ki user successfully save hua hai aur uski approval status False (Pending) hai
    user = User.objects.get(username='new_faculty')
    assert user.role == 'FACULTY'
    assert user.is_approved == False  # Nayi faculty by default unapproved honi chahiye

@pytest.mark.django_db
def test_login_api(api_client):
    # 1. Pehle database me ek dummy user save kar diya
    User.objects.create_user(
        username='admin_test', 
        password='adminpassword123', 
        role='ADMIN', 
        is_approved=True
    )
    
    # 2. GALAT password daalkar check kiya (Negative Testing)
    bad_payload = {'username': 'admin_test', 'password': 'wrongpassword'}
    bad_response = api_client.post('/api/auth/login/', bad_payload, format='json')
    
    # 401 Unauthorized aana chahiye
    assert bad_response.status_code == 401
    
    # 3. SAHI credentials daalkar check kiya (Positive Testing)
    good_payload = {'username': 'admin_test', 'password': 'adminpassword123'}
    good_response = api_client.post('/api/auth/login/', good_payload, format='json')
    
    # 200 OK aana chahiye, aur response me token aur user data return hona chahiye
    assert good_response.status_code == 200
    assert 'token' in good_response.data
    assert good_response.data['user']['role'] == 'ADMIN'
