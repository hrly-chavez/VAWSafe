from django.core.management.base import BaseCommand
from shared_model.models import Province, Municipality, Barangay
import requests

PSGC_BASE = "https://psgc.gitlab.io/api"

class Command(BaseCommand):
    help = "Seed Region 7 provinces, municipalities, and barangays into DB"

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching Region 7 data from PSGC...")

        # Fetch provinces of Region VII (070000000)
        provinces = requests.get(f"{PSGC_BASE}/regions/070000000/provinces/").json()

        for prov in provinces:
            prov_obj, _ = Province.objects.get_or_create(name=prov["name"])
            prov_code = prov["code"]

            # Get cities/municipalities for this province
            cities = requests.get(f"{PSGC_BASE}/provinces/{prov_code}/cities-municipalities/").json()

            for city_data in cities:
                municipality, _ = Municipality.objects.get_or_create(
                    name=city_data["name"],
                    province=prov_obj
                )

                # Get barangays for this municipality
                barangays = requests.get(f"{PSGC_BASE}/cities-municipalities/{city_data['code']}/barangays/").json()

                for brgy_data in barangays:
                    Barangay.objects.get_or_create(
                        name=brgy_data["name"],
                        municipality=municipality
                    )

        self.stdout.write(self.style.SUCCESS("✅ Region 7 data seeded successfully."))
