from django.urls import path, include
from job_app import views

urlpatterns = [
    path('api/logout', views.logout, name='logout'),
    path('api/create_user', views.create_user, name='create_user'),
    path('api/log_user', views.log_user, name='log_user'),
    path('api/get_user', views.get_user, name='get_user'),
    path('api/create_job', views.create_job, name='create_job'),
    path('api/get_jobs', views.get_jobs, name='get_jobs'),
    path('api/edit_job', views.edit_job, name='edit_job'),
    path('api/delete_job', views.delete_job, name='delete_job')
]
