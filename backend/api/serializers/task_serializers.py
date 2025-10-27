from rest_framework import serializers
from ..models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "description",
            "position",
            "is_checked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TaskCreateSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        block = self.context["block"]
        task = Task.objects.create(
            block=block,
            description=validated_data["description"],
            position=validated_data["position"],
        )
        return task

    class Meta:
        model = Task
        fields = ["id", "description", "position"]
