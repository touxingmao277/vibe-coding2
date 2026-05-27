from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


from .models import Score, GameHistory, User
from .serializers import (
    RegisterSerializer, UserSerializer,
    ScoreSerializer, SubmitScoreSerializer, GameHistorySerializer
)


def _get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ─── Auth ─────────────────────────────────────────────────────

@api_view(['POST'])
def register(request):
    ser = RegisterSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    user = ser.save()
    tokens = _get_tokens(user)
    return Response({
        'user': UserSerializer(user).data,
        **tokens,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({'error': '用户名或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
    tokens = _get_tokens(user)
    return Response({
        'user': UserSerializer(user).data,
        **tokens,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            RefreshToken(refresh_token).blacklist()
    except Exception:
        pass
    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)


# ─── Scores ───────────────────────────────────────────────────

@api_view(['GET'])
def leaderboard(request):
    scores = Score.objects.all()[:10]
    return Response({'scores': ScoreSerializer(scores, many=True).data})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_score(request):
    ser = SubmitScoreSerializer(data=request.data, context={'request': request})
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
    score = ser.save()
    return Response({
        'status': 'ok',
        'score': ScoreSerializer(score).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_history(request):
    limit = request.GET.get('limit', 10)
    try:
        limit = min(int(limit), 50)
    except ValueError:
        limit = 10
    history = GameHistory.objects.filter(player=request.user)[:limit]
    return Response({
        'history': GameHistorySerializer(history, many=True).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_rank(request):
    user = request.user
    best = Score.objects.filter(player=user).first()
    if best is None:
        return Response({
            'rank': None,
            'best_score': 0,
            'total_players': 0,
        })
    higher_count = Score.objects.filter(
        score__gt=best.score
    ).values('player').distinct().count()
    total = Score.objects.values('player').distinct().count()
    return Response({
        'rank': higher_count + 1,
        'best_score': best.score,
        'total_players': total,
    })