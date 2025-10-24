from django.shortcuts import render

# Create your views here.
from django.http import FileResponse, Http404

def serve_encrypted_file(request, instance, file_field, content_type='application/octet-stream'):
    """
    Generic helper to serve decrypted files from any model instance.
    """
    try:
        file = file_field.storage.open(file_field.name)
        return FileResponse(file, content_type=content_type)
    except Exception:
        raise Http404("File not found or unreadable")
