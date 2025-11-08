from django.core.exceptions import ValidationError
import re

class UppercaseValidator:
    def __init__(self, min_uppercase=1):
        self.min_uppercase = min_uppercase

    def validate(self, password, user=None):
        if len(re.findall(r'[A-Z]', password)) < self.min_uppercase:
            raise ValidationError("Password must contain at least one uppercase letter.")

class LowercaseValidator:
    def __init__(self, min_lowercase=1):
        self.min_lowercase = min_lowercase

    def validate(self, password, user=None):
        if len(re.findall(r'[a-z]', password)) < self.min_lowercase:
            raise ValidationError("Password must contain at least one lowercase letter.")

class SpecialCharacterValidator:
    def __init__(self, min_special=1):
        self.min_special = min_special

    def validate(self, password, user=None):
        if len(re.findall(r'[^a-zA-Z0-9]', password)) < self.min_special:
            raise ValidationError("Password must contain at least one special character.")
