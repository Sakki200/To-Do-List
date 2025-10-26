from rest_framework import serializers
from ..models import Canva, User


class CanvaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Canva
        fields = ["id", "name", "is_collaborative", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class CanvaCreateSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        user = self.context["request"].user
        canva = Canva.objects.create(
            user=user,
            name=validated_data["name"],
            is_collaborative=validated_data.get("is_collaborative", False),
        )
        return canva

    class Meta:
        model = Canva
        fields = ["name", "is_collaborative"]
