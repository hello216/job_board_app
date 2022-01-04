from django.shortcuts import render, redirect
from job_app.models import ValidatorManager, User, Jobs
from django.contrib import messages
import bcrypt
import requests
import sys
import dotenv
import os
from django.utils.html import strip_tags
from django.core.paginator import Paginator, EmptyPage
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
import bleach
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from job_app.models import User
from job_app.serializers import UserModelSerializer, JobModelSerializer

class UserView(viewsets.ModelViewSet):
    serializer_class = UserModelSerializer
    queryset = User.objects.all()
    print("user view queryset:")
    print(queryset)

class JobView(viewsets.ModelViewSet):
    print("inside JobView")
    serializer_class = JobModelSerializer

@api_view(['POST'])
def log_user(request):
    print("yay!!!!!!!!!!!!!!!!!!!!!!!!!! " + "\n")
    return Response("response from log_user method")
