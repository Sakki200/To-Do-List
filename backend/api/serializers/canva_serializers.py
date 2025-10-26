import rest_framework as serializers
from django.contrib.auth.models import User
from ..models import Canva


class CanvaSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), read_only=True
    )

    class Meta:
        model = Canva
        fields = ["user", "name", "is_collaborative", "created_at", "updated_at"]
        read_only_fields = ["user", "created_at", "updated_at"]


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
        fields = ["user", "name", "is_collaborative"]
