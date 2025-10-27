from rest_framework import serializers
from ..models import Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        depth = 1
        fields = [
            "name",
            "position_x",
            "position_y",
            "has_notification",
            "notification_datetime",
            "created_at",
            "updated_at",
            "tasks",
        ]
        read_only_fields = ["created_at", "updated_at"]


class BlockCreateSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        block = Block.objects.create(
            canva=validated_data["canva"],
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
