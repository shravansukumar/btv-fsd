from django.urls import path

from .views import AppointmentListCreateView, PatientListView, update_status

urlpatterns = [
    path("patients", PatientListView.as_view(), name="patient-list"),
    path("appointments", AppointmentListCreateView.as_view(), name="appointment-list"),
    path("appointments/update-status", update_status, name="appointment-update-status"),
]
