from django.urls import path
from .views import user_views

urlpatterns = [
    path("auth/", user_views.AuthView.as_view(), name="auth"),
    path("auth/validation/<uuid:id>/", user_views.ValidationActivateView.as_view(), name="validation"),
    path("auth/password/", user_views.PasswordPatchView.as_view(), name="password_patch"),
]
