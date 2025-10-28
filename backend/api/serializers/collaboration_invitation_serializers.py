from rest_framework import serializers
from ..models import CollaborationInvitation


class CollaborationInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationInvitation
        fields = ["id", "canva", "status", "created_at"]
        read_only_fields = ["id", "canva", "created_at"]


class CollaborationInvitationCreateSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        invitation = CollaborationInvitation.objects.create(canva=validated_data["canva"])
        return invitation

    class Meta:
        model = CollaborationInvitation
        fields = ["id", "canva"]
