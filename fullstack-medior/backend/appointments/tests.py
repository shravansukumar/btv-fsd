"""
TASK 7 — Backend test

Write a test verifying that appointments cannot be created in the past.

You may use Django's TestCase (below) or pytest — both are accepted. A starter
is left here; replace/extend it with your implementation.
"""
from django.test import TestCase


class AppointmentValidationTests(TestCase):
    def test_cannot_create_appointment_in_the_past(self):
        # TODO: implement (Task 7)
        pass
