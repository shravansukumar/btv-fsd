from django.urls import path

from .views import AppointmentListCreateView, PatientListView

urlpatterns = [
    path("patients", PatientListView.as_view(), name="patient-list"),
    path("appointments", AppointmentListCreateView.as_view(), name="appointment-list"),
]
