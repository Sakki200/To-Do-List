from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from ..serializers.user_serializers import (
    UserUpdateSerializer,
    UserUpdatePasswordSerializer,
)
from ..models import User


class AuthView(APIView):
    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "email and password sont obligatoires."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(request, username=email, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "User successfully connected.",
                    "user": UserSerializer(user).data,
                    "token": token.key,
                },
                status=status.HTTP_200_OK,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Incorrect password."}, status=status.HTTP_401_UNAUTHORIZED
            )

        user = User.objects.create_user(email=email, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "message": "Account created.",
                "user": UserSerializer(user).data,
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class ValidationActivateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_validated = True
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordPatchView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdatePasswordSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
                
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Mot de passe mis à jour avec succès."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
