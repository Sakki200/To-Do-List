import rest_framework as serializers
from ..models import Block


class BlockSerializer(serializers.ModelSerializer):
    canva = serializers.PrimaryKeyRelatedField(
        queryset=Block.objects.all(), read_only=True
    )

    class Meta:
        model = Block
        depth = 1
        fields = [
            "canva",
            "name",
            "position_x",
            "position_y",
            "has_notification",
            "notification_datetime",
            "created_at",
            "updated_at",
            "tasks",
        ]
        read_only_fields = ["canva", "created_at", "updated_at"]


class BlockCreateSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        canva = self.context["canva"]
        block = Block.objects.create(
            canva=canva,
            name=validated_data["name"],
            position_x=validated_data["position_x"],
            position_y=validated_data["position_y"],
        )
        return block

    class Meta:
        model = Block
        fields = [
            "canva",
            "name",
            "position_x",
            "position_y",
        ]
