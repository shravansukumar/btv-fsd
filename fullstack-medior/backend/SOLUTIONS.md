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


## TASK 10 - Production Maintenance Scenario

### Investigation

I would start by understanding where the slowness is coming from. The issue could be in different places, such as the database query, the backend API response time, the amount of data being transferred, or the frontend rendering too many records at once.

Since the patient list has around 50,000 patients, I would first check whether the API is returning all patients in one response. If that is the case, then both the backend and frontend can become slow. The backend has to fetch and serialize a large amount of data, the network has to transfer a large response, and the frontend has to render a large list.

I would inspect metrics such as:

* API response time
* Database query time
* Number of database queries per request
* Size of the API response
* Time spent serializing the response
* Frontend rendering time
* Browser network timing
* Error rates and slow request logs

I would also check whether there are any N + 1 query problems, similar to Task 3. If related objects are being accessed for each patient without using `select_related` or `prefetch_related`, then the number of database queries could grow quickly.

### Backend Optimizations

The first backend improvement I would make is pagination. The API should not return all 50,000 patients in one response. Instead, it should return a limited number of records per request, for example 25, 50, or 100 patients at a time.

For example, the API could support:

```text
GET /api/patients?page=1&page_size=50
```

This keeps the response smaller and makes the API faster.

I would also look at the database queries. If the patient list is ordered by name or searched by name/email, then the database should have suitable indexes on the fields being searched or sorted. For example, if the endpoint supports searching patients by name or email, indexes on those fields could improve lookup performance.

I would also check whether the API is fetching only the fields that are needed for the list page. If the frontend only needs `id`, `name`, and `email`, then the backend should avoid loading unnecessary data. This can be done by keeping the serializer small for list views.

If the endpoint includes related data, I would use query optimizations such as:

```python
select_related()
```

for foreign key relationships, or:

```python
prefetch_related()
```

for many-to-many or reverse relationships.

Caching could also be useful, but I would add it after checking pagination and query performance first. For example, if the first page of patients or common search results are requested frequently, we could cache those responses using something like Redis. This would avoid hitting the database repeatedly for the same data.

### Frontend Optimizations

On the frontend, I would also avoid rendering all 50,000 patients at once. Even if the backend becomes faster, rendering a very large list in the browser can still make the page slow.

The frontend should work with the paginated API. It could either show normal pagination controls or implement infinite scrolling. With infinite scrolling, the frontend fetches the next page only when the user scrolls near the bottom of the list.

I would also consider virtualized rendering if the UI needs to display a long scrollable list. This means only the visible rows are rendered in the DOM, instead of rendering thousands of rows at the same time.

I would also avoid making unnecessary API requests. For example, if the patient list has a search box, I would debounce the search input so the API is not called on every key press.

### Monitoring

For monitoring and troubleshooting, I would use logs and metrics from both the backend and frontend.

On the backend, I would monitor slow API requests, database query time, number of queries per request, response size, and error rates. Django Debug Toolbar can be useful locally to inspect queries, while production tools like Sentry, Datadog, or application logs can help identify slow endpoints.

On the database side, I would inspect slow queries and use query analysis tools such as `EXPLAIN` to understand whether indexes are being used properly.

On the frontend, I would use the browser DevTools Network tab to check request time and response size. I would also use the Performance tab to check whether the page is slow because of rendering too many DOM elements.

### Final Approach

So, my approach would be:

1. First identify where the time is being spent.
2. Add backend pagination so the API does not return all 50,000 patients at once.
3. Optimize database queries and add indexes where needed.
4. Keep the serializer small for list responses.
5. Add frontend pagination, infinite scrolling, or virtualized rendering.
6. Add caching only after the main query and pagination issues are understood.
7. Monitor the API and frontend continuously to catch slow requests early.

This approach makes the fix more reliable because it first identifies the real bottleneck instead of adding caching before understanding the actual cause.



