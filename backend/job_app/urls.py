from django.urls import path, include
from job_app import views

# https://www.django-rest-framework.org/api-guide/routers/
urlpatterns = [
    path('api/log_user', views.log_user),
    path('api/get_user', views.get_user),
    path('api/create_user', views.create_user)
]
