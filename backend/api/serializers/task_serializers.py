import rest_framework as serializers
from ..models import Task


class TaskSerializer(serializers.ModelSerializer):
    block = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), read_only=True
    )
    class Meta:
        model = Task
        depth = 1
        fields = [
            "block",
            "description",
            "position",
            "is_checked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["block", "created_at", "updated_at"]


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
        fields = ["block", "description", "position"]
