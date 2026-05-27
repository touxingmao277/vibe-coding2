from rest_framework import serializers
from .models import User, Score, GameHistory


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'date_joined')


class ScoreSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.username', read_only=True)

    class Meta:
        model = Score
        fields = ('id', 'player_name', 'score', 'level', 'lines', 'created_at')


class SubmitScoreSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=0)
    level = serializers.IntegerField(min_value=0)
    lines = serializers.IntegerField(min_value=0)
    duration_seconds = serializers.IntegerField(min_value=0, default=0)

    def create(self, validated_data):
        player = self.context['request'].user
        score = Score.objects.create(
            player=player,
            score=validated_data['score'],
            level=validated_data['level'],
            lines=validated_data['lines'],
        )
        GameHistory.objects.create(
            player=player,
            score=validated_data['score'],
            level=validated_data['level'],
            lines=validated_data['lines'],
            duration_seconds=validated_data.get('duration_seconds', 0),
        )
        return score


class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ('id', 'score', 'level', 'lines', 'duration_seconds', 'created_at')