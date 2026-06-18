from rest_framework import generics

from .models import Appointment, Patient
from .serializers import AppointmentSerializer, PatientSerializer


class PatientListView(generics.ListAPIView):
    """GET /api/patients

    Currently returns all patients. See TASK 1 below.
    """

    serializer_class = PatientSerializer

    def get_queryset(self):
        queryset = Patient.objects.all().order_by("name")

        # ------------------------------------------------------------------
        # TASK 1 — Search endpoint
        #
        # Support an optional ?q= query parameter that filters patients by a
        # partial match on name OR email. With no `q`, the current behaviour
        # (return everything) is fine for this exercise.
        # ------------------------------------------------------------------
        return queryset


class AppointmentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/appointments

    Used by Task 2 (validation). The list side is also a good place to think
    about the N+1 issue described in Task 3.
    """

    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
