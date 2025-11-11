from django.core.exceptions import ValidationError
import re

class UppercaseValidator:
    def __init__(self):
        self.message = "Password must contain at least one uppercase letter."

    def __call__(self, password):
        # This will be used by Django's validation mechanism
        self.validate(password)

    def validate(self, password, user=None):
        # Perform the validation
        if not any(char.isupper() for char in password):
            raise ValidationError(self.message)

    def get_help_text(self):
        return self.message

class LowercaseValidator:
    def __init__(self):
        self.message = "Password must contain at least one lowercase letter."

    def __call__(self, password):
        # This will be used by Django's validation mechanism
        self.validate(password)

    def validate(self, password, user=None):
        # Perform the validation
        if not any(char.islower() for char in password):
            raise ValidationError(self.message)

    def get_help_text(self):
        return self.message

class SpecialCharacterValidator:
    def __init__(self):
        self.message = "Password must contain at least one special character."

    def __call__(self, password):
        # This will be used by Django's validation mechanism
        self.validate(password)

    def validate(self, password, user=None):
        # Perform the validation
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(self.message)

    def get_help_text(self):
        return self.message
