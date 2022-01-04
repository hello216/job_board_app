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
from rest_framework import viewsets, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from job_app.models import User

@api_view(['GET'])
def get_user(request):
    print("inside get_user()")
    user = User.objects.get(username="test")

    data = {"username": user.username, "password": user.password}

    return Response(data)

@api_view(['POST'])
def log_user(request):
    print("yay!!!!!!!!!!!!!!!!!!!!!!!!!! " + "\n")
    return Response("response from log_user method")
