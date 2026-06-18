from rest_framework import serializers

from .models import Appointment, Patient


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "name", "email"]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "patient", "scheduled_at", "status"]
        # `status` defaults to "scheduled" on create; not required from clients.
        extra_kwargs = {"status": {"required": False, "default": "scheduled"}}

    # ------------------------------------------------------------------
    # TASK 2 — Appointment validation
    #
    # Appointments must not be created in the past. Implement validation here
    # (or wherever you judge correct) so the API rejects past `scheduled_at`
    # values with a meaningful error, following DRF best practices.
    #
    #   def validate_scheduled_at(self, value):
    #       ...
    # ------------------------------------------------------------------
