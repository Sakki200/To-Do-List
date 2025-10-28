from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from ..serializers.user_serializers import (
    UserUpdateSerializer,
    UserUpdatePasswordSerializer,
    UserSerializer,
)
from ..models import User


class AuthView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user

        if user and user.is_authenticated:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "User is authenticated.",
                    "user": UserSerializer(user).data,
                    "token": token.key,
                },
                status=200,
            )

        return Response(
            {"error": "User is not authenticated."},
            status=401,
        )

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
            user = User.objects.get(email=email)
            if not user.is_validated:
                return Response(
                    {"error": "Account not validated. Please check your email."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
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

        send_mail(
            subject="To-Do List | Activate your account !",
            message=f"Use this link to activate your account: http://localhost:5173/validation&id={user.id}/",
            from_email="todo.list@djgango.com",
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "message": "Account created please check your verification email.",
            },
            status=status.HTTP_201_CREATED,
        )


class ValidationActivateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    lookup_field = "id"

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_validated = True
        user.save()
        serializer = self.get_serializer(user)
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Account successfully activated.",
                "token": token.key,
            },
            status=status.HTTP_200_OK,
        )


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
