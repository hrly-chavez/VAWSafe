from django.db import models
from django.contrib.postgres.fields import ArrayField

class Account(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)  

    def __str__(self):
        return self.username

class Official(models.Model):

    ROLE_CHOICES ={
    ('DSWD','DSWD'),
    ('VAWDesk','VAWDesk'),
    ('Social Worker','Social Woker'),
    }
    of_id = models.AutoField(primary_key=True)
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    of_fname = models.CharField(max_length=50)
    of_lname = models.CharField(max_length=50)
    of_m_initial = models.CharField(max_length=50, null=True, blank=True)
    of_suffix = models.CharField(max_length=50, null=True, blank=True)
    of_sex = models.CharField(max_length=1, null=True, blank=True)
    of_dob = models.DateField( null=True, blank=True)
    of_pob = models.CharField(max_length=255, null=True, blank=True)
    of_address = models.TextField( null=True, blank=True)
    of_contact = models.CharField(max_length=20, null=True, blank=True)
    of_role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='DSWD')
    of_brgy_assigned = models.CharField(max_length=100, null=True, blank=True)
    of_specialization = models.CharField(max_length=100, null=True, blank=True)
    of_photo = models.ImageField(upload_to='photos/')
    of_embedding = ArrayField(models.FloatField(), null=True, blank=True)

    def __str__(self):
        return f"{self.of_fname}, {self.of_lname}"
    @property
    def full_name(self):
        return f"{self.of_fname} {self.of_m_initial}. {self.of_lname} {self.of_suffix}".strip()