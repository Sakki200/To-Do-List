from rest_framework import serializers
from ..models import CollaborationInvitation, Canva


class CollaborationInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationInvitation
        fields = ["uuid", "canva", "status", "created_at"]
        read_only_fields = ["uuid", "canva", "created_at"]

class CollaborationInvitationCreateSerializer(serializers.ModelSerializer):
    def create(self):
        canva = self.context["canva"]
        invitation = CollaborationInvitation.objects.create(
            canva=canva,
        )
        return invitation

    class Meta:
        model = CollaborationInvitation
        fields = ["canva"]