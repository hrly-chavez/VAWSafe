from django.db import models
from datetime import date

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
    civil_status = models.CharField(max_length=100)
    educational_attainment = models.CharField(max_length=100)
    nationality = models.CharField(max_length=50)
    specific_nationality = models.CharField(max_length=50, blank=True, null=True)
    ethnicity = models.CharField(max_length=100, blank=True, null=True)
    main_occupation = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2)
    migratory_status = models.CharField(max_length=100)
    religion = models.CharField(max_length=100)
    specific_religion = models.CharField(max_length=100, blank=True, null=True)
    # address
    is_displaced = models.BooleanField(default=False)
    pwd = models.CharField(max_length=10)
    contact = models.CharField(max_length=20)

    # if victim survivor is minor, guardian name and contact info should be recorded
    is_minor = models.BooleanField(editable=False)
    guardian_first_name = models.CharField(max_length=100)
    guardian_middle_name = models.CharField(max_length=100, null=True, blank=True)
    guardian_last_name = models.CharField(max_length=100)
    guardian_contact = models.CharField(max_length=20)
    child_category = models.CharField(max_length=100, blank=True, null=True)

    employment_status = models.CharField(max_length=50)
    # if employment status is "employed"
    employed_type = models.CharField(max_length=100, blank=True, null=True)
    employer_name = models.CharField(max_length=100, blank=True, null=True)
    employer_address = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        today = date.today()
        age = today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )
        self.is_minor = age < 18
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

class IncidentDetail(models.Model):
    victim = models.ForeignKey(VictimSurvivor, on_delete=models.CASCADE, related_name='incidents')
    informantName = models.CharField(max_length=100, blank=True, null=True)
    informantRelationship = models.CharField(max_length=100, blank=True, null=True)
    informantContact = models.CharField(max_length=100, blank=True, null=True)