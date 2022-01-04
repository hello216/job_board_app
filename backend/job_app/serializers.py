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

    # status = models.CharField(max_length=20, default="Viewed")
    # title = models.CharField(max_length=50)
    # company = models.CharField(max_length=50)
    # url = models.CharField(max_length=255)
    # location = models.CharField(max_length=255)
    # date_submitted = models.DateField(default=date.today)
    # user_jobs = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE)
    # note = models.TextField(default="Enter text here")
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
