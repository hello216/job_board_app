from rest_framework import serializers
from job_app.models import User

# Serializers converts the Django model instance to JSON so that frontend can work with the data

class UserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'created_at', 'updated_at']
