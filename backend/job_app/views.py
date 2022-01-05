from job_app.models import Jobs, User
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import bcrypt
import requests
import sys
import dotenv
import os
from django.utils.html import strip_tags
from django.core.paginator import Paginator, EmptyPage
import bleach

from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.cache import cache

ensure_csrf_cookie('logout')
@api_view(['POST'])
def logout(request):
    request.session.clear()
    cache.clear()
    return Response("Session clear")

ensure_csrf_cookie('create_user')
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

        request.session['username'] = user.username

        return Response({"username":user.username, "id":user.id})

ensure_csrf_cookie('log_user')
@api_view(['POST'])
def log_user(request):
    print("request:")
    print(request.data)

    _username = request.data['username']
    _password = request.data['password']

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
            # check that hashed passwords match
            if bcrypt.checkpw(request.data['password'].encode(), logged_user.password.encode()):
                request.session['userid'] = logged_user.id
                request.session['username'] = request.data['username']

                if request.session['username']:
                    print("username save in sessions")
                    print(request)
                    cache.set('username', request.data['username'])

                return Response("user is log in")
        else:
            error = {"username":"You enter the wrong username or password. Try again"}
            return Response({"errors":error}, status=status.HTTP_400_BAD_REQUEST)

    # if we didn't find anything in the database by searching by username or if the passwords don't match,
    error = {"username":"You enter the wrong username or password. Try again"}
    return Response({"errors":error}, status=status.HTTP_400_BAD_REQUEST)

ensure_csrf_cookie('get_user')
@api_view(['GET'])
def get_user(request):
    print("inside get_user()")
    print(request)
    print(cache.get('username'))

    if cache.get('username'):
        _username = cache.get('username')
        user = User.objects.filter(username=_username)
        if user:
            print("user is authenticated")
            print("the user:")
            print(user)
            data = {"username": _username}
            print("user auth in get_user")
            return Response(data)
    else:
        print("user not authenticated")
        return Response("user not auth")
