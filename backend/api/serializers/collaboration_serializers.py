from rest_framework import serializers
from ..models import Collaboration


class CollaborationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collaboration
        fields = ["collaboration_invitation", "user", "created_at", "updated_at"]
        read_only_fields = ["collaboration_invitation", "user", "created_at", "updated_at"]


class CollaborationCreateSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        collaboration = Collaboration.objects.create(
            collaboration_invitation=validated_data["collaboration_invitation"],
            user=validated_data["user"],
        )
        return collaboration

    class Meta:
        model = Collaboration
        fields = ["collaboration_invitation", "user"]
