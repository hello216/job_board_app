from django.urls import path, include
from job_app import views


urlpatterns = [
    path('api/log_user', views.log_user),
    path('api/get_user', views.get_user),
    path('api/create_user', views.create_user)
]
