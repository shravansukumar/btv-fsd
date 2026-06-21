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


## TASK 12 - Authentication & Authorization Scope

### Auth Question

I would say all of these APIs should require authentication. These endpoints contain sensitive healthcare and patient-related information, which should not be publicly accessible. Since all of the given endpoints either expose patient data or modify appointment information, I do not see a strong reason for any of them to remain public. Therefore, I would require authentication for all endpoints.

### Authorization Question 

In a multi-clinic setup, I would enforce clinic-level authorization. A user should only be able to access data belonging to their own clinic.

For example:

* `GET /api/patients`

  * Users should only be able to view patients that belong to their clinic.

* `GET /api/appointments`

  * Users should only be able to view appointments associated with their clinic.

* `POST /api/appointments`

  * Users should only be able to create appointments for patients within their clinic.

* `POST /api/appointments/update-status`

  * Users should only be able to update appointments belonging to their clinic.

Additionally, role-based authorization could be introduced within a clinic. For example:

* Receptionists may be allowed to create appointments.
* Medical staff may be allowed to view appointments and patient information.
* Administrators may be allowed to update appointment statuses and perform administrative actions.

This ensures that users can only access the data and actions required for their role.

### Product Owner Questions

Before implementing authentication and authorization, I would clarify the following requirements:

* In a multi-clinic setup, can the same patient belong to multiple clinics? For example, a patient may receive different treatments from different clinics.
* Are there different user roles within a clinic (e.g. receptionist, medical staff, administrator)? If so, what permissions should each role have?
* Should all authenticated users be able to view patient information, or should access be restricted based on role?
* Who is allowed to create appointments and who is allowed to update appointment statuses?
* Are there any regulatory or compliance requirements (e.g. GDPR or healthcare-specific regulations) that affect access to patient data?
* Should clinic administrators be able to access data across multiple clinics, or should all access remain strictly clinic-scoped?


