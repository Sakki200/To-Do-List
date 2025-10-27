from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Collaboration, Canva


class CollaborationSerializer(serializers.ModelSerializer):
    canva = serializers.PrimaryKeyRelatedField(
        queryset=Canva.objects.all(), read_only=True
    )
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), read_only=True
    )

    class Meta:
        model = Collaboration
        fields = ["canva", "user", "created_at", "updated_at"]
        read_only_fields = ["user", "canva", "created_at", "updated_at"]


class CollaborationCreateSerializer(serializers.ModelSerializer):

    def create(self):
        canva = self.context["canva"]
        user = self.context["user"]
        collaboration = Collaboration.objects.create(
            canva=canva,
            user=user,
        )
        return collaboration

    class Meta:
        model = Collaboration
        fields = ["canva", "user"]