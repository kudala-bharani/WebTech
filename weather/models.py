from django.db import models

# Create your models here.

class User(models.Model):
    name = models.CharField(max_length=100)  # Required field
    email = models.EmailField(max_length=100, unique=True)  # Required and unique field
    password = models.CharField(max_length=100)  # Required field

    city1 = models.CharField(max_length=100, blank=True, null=True)  # Optional field
    city2 = models.CharField(max_length=100, blank=True, null=True)  # Optional field
    city3 = models.CharField(max_length=100, blank=True, null=True)  # Optional field
    city4 = models.CharField(max_length=100, blank=True, null=True)  # Optional field
    city5 = models.CharField(max_length=100, blank=True, null=True)  # Optional field

    def __str__(self):
        return self.name 