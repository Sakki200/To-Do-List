from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from ..serializers.collaboration_serializers import (
    CollaborationSerializer,
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
