from django.urls import path, include
from job_app import views

urlpatterns = [
    path('api/logout', views.logout),
    path('api/create_user', views.create_user),
    path('api/log_user', views.log_user),
    path('api/get_user', views.get_user),
    path('api/create_job', views.create_job)
]
