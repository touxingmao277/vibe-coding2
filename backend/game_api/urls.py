from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('scores/leaderboard/', views.leaderboard, name='leaderboard'),
    path('scores/submit/', views.submit_score, name='submit_score'),
    path('scores/history/', views.my_history, name='my_history'),
    path('scores/rank/', views.my_rank, name='my_rank'),
]