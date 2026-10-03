from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import UserSerializer, RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        if user.role == 'FACULTY' and not user.is_approved:
            return Response({'error': 'Faculty account is pending approval by admin.'}, status=status.HTTP_403_FORBIDDEN)
        
        token, _ = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        return Response({'user': serializer.data, 'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_faculty(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'Registration successful. Waiting for admin approval.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def faculty_list(request):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    faculties = User.objects.filter(role='FACULTY')
    serializer = UserSerializer(faculties, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def approve_faculty(request, pk):
    if request.user.role != 'ADMIN':
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    try:
        faculty = User.objects.get(pk=pk, role='FACULTY')
        is_approved = request.data.get('is_approved', True)
        faculty.is_approved = is_approved
        faculty.save()
        serializer = UserSerializer(faculty)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
