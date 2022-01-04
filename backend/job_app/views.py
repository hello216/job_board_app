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
from rest_framework import status
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

    errors = User.objects.user_login_validator(request.data)
    # check if the errors dictionary has anything in it
    if len(errors) > 0:
        print("error messages:")
        print(errors)
        # return a 400 error to the client if the input does not pass validations
        return Response({"errors":errors}, status=status.HTTP_400_BAD_REQUEST)

    else:
        # see if the username provided exists in the database
        user = User.objects.filter(username=request.data['username'])

        if len(user) > 0:
            logged_user = user[0]

            if bcrypt.checkpw(request.data['password'].encode(), logged_user.password.encode()):
                request.session['userid'] = logged_user.id
                request.session['username'] = request.data['username']

                return Response("user logged")
            else:
                error = {"username":"You enter the wrong username or password. Try again"}
                return Response({"errors":error}, status=status.HTTP_400_BAD_REQUEST)

    # if we didn't find anything in the database by searching by username or if the passwords don't match,
    return redirect('/')


@api_view(['POST'])
def create_user(request):
    print("inside create_user")
    print(request.data)

    errors = User.objects.user_register_val(request.data)
    # check if the errors dictionary has anything in it
    if len(errors) > 0:
        print("error messages:")
        print(errors)
        # return a 400 error to the client if the input does not pass validations
        return Response({"errors":errors} ,status=status.HTTP_400_BAD_REQUEST)

    else:
        _username = request.data['username']
        _password = request.data['password']

        pw_hash = bcrypt.hashpw(_password.encode(), bcrypt.gensalt()).decode()

        user = User.objects.create(username=_username, password=pw_hash)

        print("User Created:")
        print(User.objects.last().username)

        request.session['userid'] = user.id

        return Response({"username":user.username, "id":user.id})
