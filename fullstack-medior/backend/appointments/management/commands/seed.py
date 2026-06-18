"""
Seed the database with synthetic demo data so the frontend has something to
search against.

All names/emails are fabricated. Do NOT load real patient data here — this is
a throwaway exercise database.

    python manage.py seed                 # ~40 patients
    python manage.py seed --patients 5000 # stress-test (see Task 10)
"""
import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment, Patient

FIRST_NAMES = [
    "John", "Jane", "Alice", "Bob", "Carol", "David", "Emma", "Frank",
    "Grace", "Henry", "Ivy", "Jack", "Karen", "Liam", "Mia", "Noah",
    "Olivia", "Peter", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor",
]
LAST_NAMES = [
    "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
    "Miller", "Davis", "Martinez", "Lopez", "Wilson", "Anderson", "Taylor",
]


class Command(BaseCommand):
    help = "Seed the database with synthetic patients and appointments."

    def add_arguments(self, parser):
        parser.add_argument("--patients", type=int, default=40)
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing patients/appointments first.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            Appointment.objects.all().delete()
            Patient.objects.all().delete()
        elif Patient.objects.exists():
            self.stdout.write("Patients already present — skipping seed (use --flush to reset).")
            return

        count = options["patients"]
        now = timezone.now()
        patients = []
        for i in range(count):
            first = FIRST_NAMES[i % len(FIRST_NAMES)]
            last = LAST_NAMES[(i // len(FIRST_NAMES)) % len(LAST_NAMES)]
            patients.append(
                Patient(name=f"{first} {last}", email=f"{first.lower()}.{last.lower()}{i}@example.com")
            )
        Patient.objects.bulk_create(patients, ignore_conflicts=True)

        created = Patient.objects.all()[: min(count, 50)]
        appointments = []
        for n, patient in enumerate(created):
            appointments.append(
                Appointment(
                    patient=patient,
                    scheduled_at=now + datetime.timedelta(days=n + 1, hours=9),
                    status="scheduled",
                )
            )
        Appointment.objects.bulk_create(appointments)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {Patient.objects.count()} patients and "
                f"{Appointment.objects.count()} appointments."
            )
        )
