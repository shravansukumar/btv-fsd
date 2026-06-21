## TASK 3 - API Performance Review

### The Issue

This block has the **N + 1 query problem**. Since we are accessing `patient` through `appointment.patient.name`, this may trigger an additional database query for each appointment. So, for `N` appointments, there could be up to `N` extra queries in addition to the initial query used to fetch the appointments. Hence, the problem we are facing here is the **N + 1 query problem**.

### The Why

This happens because Django lazily loads related objects. Since `patient` is a foreign key inside the `Appointment` model, accessing `appointment.patient` can result in a separate database query for each appointment.

### The Fix

Use `select_related("patient")` to fetch appointments and their related patients in a single database query. Along with this, we can also use serializers to construct our response object rather than building the dictionary manually. Here is the improved code:

```python
class AppointmentListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True,
    )

    class Meta:
        model = Appointment
        fields = ["patient_name", "scheduled_at"]


class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentListSerializer

    def get_queryset(self):
        return Appointment.objects.select_related(
            "patient"
        )
```

An additional issue that could arise when the dataset becomes very large is increased response times due to the number of records being returned. Looking into pagination could be a good idea to avoid sending all appointments in a single response.
