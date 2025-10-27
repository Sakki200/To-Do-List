from django.urls import path
from .views import user_views, canva_views, block_views, collaboration_views

urlpatterns = [
    path("auth/", user_views.AuthView.as_view(), name="auth"),
    path("auth/validation/<uuid:id>/", user_views.ValidationActivateView.as_view(), name="validation"),
    path("auth/password/", user_views.PasswordPatchView.as_view(), name="password_patch"),
    path("canva/create/", canva_views.CanvaCreateView.as_view(), name="canva_create"),
    path("canva/user/", canva_views.CanvaUserView.as_view(), name="canva_user"),
    path("block/create/", block_views.BlockCreateView.as_view(), name="block_create"),
    path("block/user/", block_views.BlockUserView.as_view(), name="block_user"),
    path("collaboration/invitation/create/", collaboration_views.CollaborationInvitationCreateView.as_view(), name="collaboration_invitation_create"),
    # path("collaboration/invitation/<uuid:id>/", collaboration_views.CollaborationInvitationView.as_view(), name="collaboration_invitation"),
]
