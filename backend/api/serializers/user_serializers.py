from rest_framework import serializers
from ..models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "is_validated"]
        read_only_fields = ["id"]


class UserUpdatePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def update(self, instance, validated_data):
        password = validated_data.get("password")
        if password:
            instance.set_password(validated_data["password"])
            instance.save()
        return instance

    class Meta:
        model = User
        fields = ["password"]
