from django.urls import path, include

urlpatterns = [
    path('api/', include('game_api.urls')),
]