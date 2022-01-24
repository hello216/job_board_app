from django.test import SimpleTestCase, Client
from django.urls import reverse, resolve
from job_app.views import *

#   ./manage.py test job_board_app

client = Client()

class TestUrls(SimpleTestCase):

    # test url by: checking the url name resolves to the views method
    def test_logout_url(self):
        url = reverse('logout')
        self.assertEquals(resolve(url).func, logout, 'logout url does not resolve to the method [logout] in views.py')

    def test_create_user_url(self):
        url = reverse('create_user')
        self.assertEquals(resolve(url).func, create_user, 'create_user url does not resolve to the method [create_user] in views')

    def test_log_user_url(self):
        url = reverse('log_user')
        self.assertEquals(resolve(url).func, log_user, 'log_user url does not resolve to the method [log_user] in views')

    def test_get_user_url(self):
        url = reverse('get_user')
        self.assertEquals(resolve(url).func, get_user, 'get_user url does not resolve to the method [get_user] in views')

    def test_create_job_url(self):
        url = reverse('create_job')
        self.assertEquals(resolve(url).func, create_job, 'create_job url does not resolve to the method [create_job] in views')

    def test_get_jobs_url(self):
        url = reverse('get_jobs')
        self.assertEquals(resolve(url).func, get_jobs, 'get_jobs url does not resolve to the method [get_jobs] in views')

    def test_edit_job_url(self):
        url = reverse('edit_job')
        self.assertEquals(resolve(url).func, edit_job, 'edit_job url does not resolve to the method [edit_job] in views')

    def test_delete_job_url(self):
        url = reverse('delete_job')
        self.assertEquals(resolve(url).func, delete_job, 'delete_job url does not resolve to the method [delete_job] in views')
