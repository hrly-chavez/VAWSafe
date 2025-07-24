from django.db import models
from django.contrib.postgres.fields import ArrayField


class User(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='photos/')
    embedding = ArrayField(models.FloatField(), null=True, blank=True)
    
    def __str__(self):
        return self.name