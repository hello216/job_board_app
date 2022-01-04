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
from rest_framework.decorators import api_view
from rest_framework.response import Response
from job_app.models import User

@api_view(['GET'])
def get_user(request):
    print("inside get_user()")
    user = User.objects.get(username="test3")

    data = {"username": user.username, "password": user.password}

    return Response(data)

@api_view(['POST'])
def log_user(request):
    print("yay!!!!!!!!!!!!!!!!!!!!!!!!!! " + "\n")
    print("request:")
    print(request.data)
    return Response("response from log_user method")

@api_view(['POST'])
def create_user(request):
    print("inside create_user")
    print(request.data)

    errors = User.objects.user_register_val(request.data)
    # check if the errors dictionary has anything in it
    if len(errors) > 0:
        print("error messages:")
        print(errors)
        # redirect the user back to the form to fix the errors
        return Response({"errors":errors})

    else:
        _username = request.data['username']
        _password = request.data['password']

        pw_hash = bcrypt.hashpw(_password.encode(), bcrypt.gensalt()).decode()

        user = User.objects.create(username=_username, password=pw_hash)

        print("User Created:")
        print(User.objects.last().username)

        # request.session['userid'] = user.id

        return Response("User created")
