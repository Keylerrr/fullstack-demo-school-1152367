from django.db import models

class Student(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=50, unique=True)
    group = models.ForeignKey('students.StudentGroup', on_delete=models.CASCADE, related_name='students')
    group = models.ForeignKey('students.StudentGroup', on_delete=models.CASCADE, related_name='students', blank=True, null=True, default=None)

    def __str__(self):
        return f"{self.full_name} ({self.code})"
