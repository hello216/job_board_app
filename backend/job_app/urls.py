from django.urls import path, include
from job_app import views
from rest_framework import routers
from job_app.views import UserView

router = routers.DefaultRouter()
router.register('users', UserView)
# router.register('login', LoginView)

# https://www.django-rest-framework.org/api-guide/routers/
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/log_user', views.log_user)
]
