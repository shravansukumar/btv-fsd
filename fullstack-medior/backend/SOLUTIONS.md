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

## TASK 11 - Refactoring

The original function has multiple nested `if` statements, which makes it harder to read and maintain. It also silently returns `None` if validation fails, which makes error handling unclear.

I would refactor it by using early validation checks and raising meaningful validation errors. This makes the function easier to read and gives the API layer clear errors to return to the client.

```python
from django.utils import timezone
from rest_framework import serializers


def create_appointment(patient, scheduled_at):
    if not patient:
        raise serializers.ValidationError({
            "patient": "Patient is required."
        })

    if not scheduled_at:
        raise serializers.ValidationError({
            "scheduled_at": "Scheduled date and time is required."
        })

    if scheduled_at <= timezone.now():
        raise serializers.ValidationError({
            "scheduled_at": "You cannot create appointments for past dates!"
        })

    return Appointment.objects.create(
        patient=patient,
        scheduled_at=scheduled_at,
        status="scheduled",
    )
```

### Explanation

The main decision here is to replace the nested `if` statements with guard clauses. This improves readability because each invalid case is handled immediately, and the successful path is left at the bottom of the function.

I also changed the error handling so that the function raises `serializers.ValidationError` instead of returning a generic string like `"Check inputs"`. This follows DRF conventions and allows the API to return meaningful validation errors to the frontend.

The validation checks are also separated so the client can understand exactly what went wrong:

* If `patient` is missing, the API returns an error for `patient`.
* If `scheduled_at` is missing, the API returns an error for `scheduled_at`.
* If `scheduled_at` is in the past, the API returns a clear validation error.

This makes the function easier to maintain and makes the API behavior more predictable. Also, just like task #2, in a real world implementation, I would put this validation inside the serializer itself.


## TASK 9 - API Design Review

### Is this endpoint RESTful?

I would say this endpoint is not fully RESTful.

The current endpoint is:

```text
POST /api/appointments/update-status
```

The issue here is that the URL is action-based. It describes an operation, `update-status`, rather than identifying the resource being updated. In a more RESTful design, the endpoint should point to the appointment resource itself, and the HTTP method should describe the action.

A better endpoint would be something like:

```text
PATCH /api/appointments/123
```

or, if we only want to update the appointment status:

```text
PATCH /api/appointments/123/status
```

### Concerns With the Current Design and Implementation

There are a few concerns with the current implementation.

First, the code directly accesses values from `request.data`:

```python
appointment_id = request.data["appointment_id"]
status = request.data["status"]
```

If either `appointment_id` or `status` is missing from the request body, this will raise a `KeyError` and likely return a 500 error. This is not ideal because malformed client input should return a proper `400 Bad Request` response.

Second, the code uses:

```python
appointment = Appointment.objects.get(id=appointment_id)
```

If the appointment ID does not exist, Django will raise `Appointment.DoesNotExist`. Again, without proper handling, this can result in a 500 error instead of a clear `404 Not Found` response.

Third, there is no validation for the `status` value. This means the API may accept any value, even if the allowed statuses are only something like `"scheduled"`, `"completed"`, or `"cancelled"`. This can lead to invalid data being stored in the database.

Another issue is that there is no serializer being used here. In DRF, serializers are the better place to validate request data and return meaningful validation errors. This would make the endpoint cleaner and easier to maintain.

### How I Would Redesign It

I would redesign this by making the appointment ID part of the URL instead of passing it in the request body.

For example:

```text
PATCH /api/appointments/123/status
```

Request body:

```json
{
  "status": "completed"
}
```

This makes the API clearer because the URL identifies the appointment being updated, and the request body only contains the field that needs to change.

I would also add a serializer to validate the status value before saving it.

Example:

```python
class AppointmentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status"]

    def validate_status(self, value):
        allowed_statuses = ["scheduled", "completed", "cancelled"]

        if value not in allowed_statuses:
            raise serializers.ValidationError(
                "Invalid status value."
            )

        return value
```

Then the view could look like this:

```python
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["PATCH"])
def update_appointment_status(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)

    serializer = AppointmentStatusUpdateSerializer(
        appointment,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)
```

This is better because:

* Missing or malformed input returns a proper validation error.
* Unknown appointment IDs return `404 Not Found`.
* Invalid status values are rejected before saving.
* The validation logic is handled through a DRF serializer.
* The endpoint is more RESTful because it updates a specific appointment resource.

### Which HTTP Method Would I Use?

I would use `PATCH` here.

The reason is that we are only updating one field, which is the appointment status. `PATCH` is generally used for partial updates.

If the API was replacing the full appointment object, then `PUT` would make more sense. But for only updating the status, `PATCH` is the better choice.


