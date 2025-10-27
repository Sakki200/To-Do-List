from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from ..serializers.collaboration_serializers import (
    CollaborationCreateSerializer,
)
from ..serializers.collaboration_invitation_serializers import (
    CollaborationInvitationSerializer,
    CollaborationInvitationCreateSerializer,
)
from ..models import Collaboration, CollaborationInvitation, Canva


class CollaborationInvitationCreateView(generics.CreateAPIView):
    queryset = CollaborationInvitation.objects.all()
    serializer_class = CollaborationInvitationCreateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        canva_id = request.data.get("canva_id")
        if not canva_id:
            return Response({"detail": "Canva ID is required."}, status=400)

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        if not canva.is_collaborative:
            return Response({"detail": "This canva is not collaborative."}, status=400)

        serializer = self.get_serializer(data={"canva": canva.id})
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()

        return Response(self.get_serializer(invitation).data, status=201)


class CollaborationInvitationView(generics.CreateAPIView):
    queryset = Collaboration.objects.all()
    serializer_class = CollaborationCreateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def create(self, request, *args, **kwargs):
        collaboration_invitation = get_object_or_404(
            CollaborationInvitation,
            id=self.kwargs[self.lookup_field],
            canva=request.data.get("canva_id"),
        )
        canva = get_object_or_404(Canva, id=collaboration_invitation.canva.id)

        if canva.user == request.user:
            serializer = CollaborationInvitationSerializer(
                collaboration_invitation, data={"status": "declined"}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {"detail": "You cannot accept an invitation to your own canva."},
                status=400,
            )

        if collaboration_invitation.created_at + timedelta(days=1) < timezone.now():
            serializer = CollaborationInvitationSerializer(
                collaboration_invitation, data={"status": "declined"}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"detail": "This invitation has expired."}, status=400)

        if not canva.is_collaborative:
            serializer = CollaborationInvitationSerializer(
                collaboration_invitation, data={"status": "declined"}, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"detail": "This canva is not collaborative."}, status=400)

        if collaboration_invitation.status != "pending":
            return Response(
                {"detail": "This invitation is no longer available."}, status=400
            )

        serializer = self.get_serializer(
            data={
                "collaboration_invitation": collaboration_invitation.id,
                "user": request.user.id,
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        collaboration_invitation_serializer = CollaborationInvitationSerializer(
            collaboration_invitation, data={"status": "accepted"}, partial=True
        )
        collaboration_invitation_serializer.is_valid(raise_exception=True)
        collaboration_invitation_serializer.save()

        return Response(status=201)
