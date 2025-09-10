import requests
from django.core.management.base import BaseCommand
from shared_model.models import City, Municipality, Barangay  # adjust import

PSGC_BASE = "https://psgc.gitlab.io/api"

class Command(BaseCommand):
    help = "Seed Region 7 cities/municipalities/barangays into DB"

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching Region 7 data from PSGC...")
        provinces = requests.get(f"{PSGC_BASE}/regions/070000000/provinces/").json()

        for prov in provinces:
            prov_code = prov["code"]
            cities = requests.get(f"{PSGC_BASE}/provinces/{prov_code}/cities-municipalities/").json()

            for city_data in cities:
                city, _ = City.objects.get_or_create(name=city_data["name"])

                municipalities = requests.get(f"{PSGC_BASE}/cities-municipalities/{city_data['code']}/barangays/").json()

                # Note: PSGC doesn't have "municipality" under "city" separately,
                # so you might merge City + Municipality concept depending on usage.
                # For now, treat each PSGC city/municipality as Municipality under City.
                municipality, _ = Municipality.objects.get_or_create(
                    name=city_data["name"], city=city
                )

                for brgy_data in municipalities:
                    Barangay.objects.get_or_create(
                        name=brgy_data["name"],
                        municipality=municipality
                    )

        self.stdout.write(self.style.SUCCESS("Region 7 data seeded successfully."))
