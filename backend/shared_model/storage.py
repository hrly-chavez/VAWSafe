from django.core.files.storage import FileSystemStorage
from django.core.files.base import ContentFile
from django.conf import settings
from cryptography.fernet import Fernet
import io
import os

class EncryptedFileSystemStorage(FileSystemStorage):
    """
    Encrypts file contents before saving to disk
    and decrypts transparently when opening.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Use key from settings.py
        key = getattr(settings, "FERNET_KEY", None)
        if not key:
            raise ValueError("FERNET_KEY is not set in settings.py or .env file.")
        self.fernet = Fernet(key)

    #kani sya kay i save siya nga .jpg ang file instead of .enc
    # def _save(self, name, content):
    #     # Read file bytes
    #     content.seek(0)
    #     raw_data = content.read()
    #     # Encrypt data
    #     encrypted_data = self.fernet.encrypt(raw_data)
    #     encrypted_content = ContentFile(encrypted_data)
    #     # Save encrypted data to disk
    #     return super()._save(name, encrypted_content)

    def _save(self, name, content):
        # Force .enc extension for clarity
        base, ext = os.path.splitext(name)
        name = base + '.enc'

        content.seek(0)
        raw_data = content.read()
        encrypted_data = self.fernet.encrypt(raw_data)
        encrypted_content = ContentFile(encrypted_data)
        return super()._save(name, encrypted_content)

    def open(self, name, mode='rb'):
        # Open the stored file normally
        encrypted_file = super().open(name, mode)
        encrypted_data = encrypted_file.read()
        # Decrypt its contents
        decrypted_data = self.fernet.decrypt(encrypted_data)
        # Return a Django ContentFile (acts like a regular file)
        return ContentFile(decrypted_data)
