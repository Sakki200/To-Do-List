from django.urls import path
from .views import user_views

urlpatterns = [
    path("auth/", user_views.AuthView.as_view(), name="auth"),
]
