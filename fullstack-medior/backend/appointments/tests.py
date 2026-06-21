"""
TASK 7 — Backend test

Write a test verifying that appointments cannot be created in the past.

You may use Django's TestCase (below) or pytest — both are accepted. A starter
is left here; replace/extend it with your implementation.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from rest_framework import status

from .models import Patient, Appointment

class AppointmentValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.patient = Patient.objects.create(
            name = "Shravan Sukumar",
            email="shravan@example.com"
        )
    
    def test_cannot_create_appointment_in_the_past(self):
        # TODO: implement (Task 7)
        past_datetime = timezone.now() - timedelta(days=2)
        
        payload = {
            "patient": self.patient.id,
            "scheduled_at": past_datetime.isoformat().replace("+00:00", "Z")
        }
        
        response = self.client.post(
            "/api/appointments",
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scheduled_at", response.data)
        self.assertEqual(Appointment.objects.count(), 0)
