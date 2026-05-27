from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    class Meta:
        db_table = 'auth_user'


class Score(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    score = models.IntegerField()
    level = models.IntegerField()
    lines = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.player.username}: {self.score}"


class GameHistory(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_history')
    score = models.IntegerField()
    level = models.IntegerField()
    lines = models.IntegerField()
    duration_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.player.username} - {self.score}pts ({self.created_at:%Y-%m-%d %H:%M})"