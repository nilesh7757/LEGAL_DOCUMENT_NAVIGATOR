from django.urls import path
from .views import chat, download_pdf

urlpatterns = [
    path('chat/', chat, name='chat'),
    path('download-pdf/', download_pdf, name='download_pdf'),
]