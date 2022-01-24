from rest_framework import serializers
from job_app.models import User, Jobs

# Serializers converts the Django model instance to JSON so that frontend can work with the data

class UserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'created_at', 'updated_at']

class JobModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jobs
        fields = ['status', 'title', 'company', 'url', 'location', 'date_submitted', 'user_jobs', 'note', 'created_at', 'updated_at']
