from django.urls import path
from .views import generate_document, download_pdf

urlpatterns = [
    path('generate/', generate_document, name='generate_document'),
    path('download-pdf/', download_pdf, name='download_pdf'),
]
