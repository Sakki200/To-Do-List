from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=150, unique=True )
    email = models.EmailField(max_length=150, unique=True)
    is_validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "user"
        ordering = ["-created_at", "-updated_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"


class Canva(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    is_collaborative = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "canva"
        ordering = ["-updated_at", "-created_at"]
        verbose_name = "Canva"
        verbose_name_plural = "Canvas"


class Block(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    canva = models.ForeignKey(Canva, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    position_x = models.FloatField()
    position_y = models.FloatField()
    has_notification = models.BooleanField(default=False)
    notification_datetime = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "block"
        ordering = ["-created_at"]
        verbose_name = "Block"
        verbose_name_plural = "Blocks"


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    block = models.ForeignKey(Block, on_delete=models.CASCADE)
    description = models.TextField()
    position = models.IntegerField()
    is_checked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "task"
        ordering = ["position"]
        verbose_name = "Task"
        verbose_name_plural = "Tasks"

class Collaboration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    canva = models.ForeignKey(Canva, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        db_table = "collaboration"
        ordering = ["-canva__updated_at", "-created_at"]
        verbose_name = "Collaboration"
        verbose_name_plural = "Collaborations"

class CollaborationInvitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    canva = models.ForeignKey(Canva, on_delete=models.CASCADE)
    status = models.CharField(max_length=25, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        db_table = "collaboration_invitation"
        ordering = ["-created_at"]
        verbose_name = "Collaboration Invitation"
        verbose_name_plural = "Collaboration Invitations"
