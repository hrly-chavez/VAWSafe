from django.db import models
from datetime import date

SEX_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
]

CHILD_CATEGORY_CHOICES = [
    ('Orphan', 'Orphan'),
    ('Unaccompanied', 'Unaccompanied'),
    ('Separated', 'Separated'),
    ('Vulnerable', 'Vulnerable'),
]

# Create your models here.
class VictimSurvivor(models.Model):
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100)
    sex = models.CharField(max_length=50)
    is_sogie = models.CharField(max_length=50)
    specific_sogie = models.CharField(max_length=50, blank=True)
    birth_date = models.DateField()
    birth_place = models.CharField(max_length=100)
    
    is_minor = models.BooleanField(editable=False)
    # if victim survivor is minor, guardian name and contact info should be recorded
    guardian_first_name = models.CharField(max_length=100)
    guardian_middle_name = models.CharField(max_length=100, null=True, blank=True)
    guardian_last_name = models.CharField(max_length=100)
    guardian_contact = models.CharField(max_length=20)
    child_category = models.CharField(max_length=100, choices=CHILD_CATEGORY_CHOICES, blank=True, null=True)

    def save(self, *args, **kwargs):
        today = date.today()
        age = today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )
        self.is_minor = age < 18
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'