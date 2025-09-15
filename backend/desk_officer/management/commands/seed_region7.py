from django.core.management.base import BaseCommand
from shared_model.models import Province, Municipality, Barangay
import requests

PSGC_BASE = "https://psgc.gitlab.io/api"

class Command(BaseCommand):
    help = "Seed Region 7 provinces, municipalities, and barangays into DB"

    def handle(self, *args, **kwargs):
        self.stdout.write("📥 Fetching Region 7 data from PSGC...")

        # Region VII code = 070000000
        provinces = requests.get(f"{PSGC_BASE}/regions/070000000/provinces/").json()

        for prov in provinces:
            prov_obj, _ = Province.objects.get_or_create(
                name=prov["name"]
            )
            prov_code = prov["code"]

            self.stdout.write(f"➡️ Province: {prov['name']}")

            # Get municipalities/cities under this province
            municipalities = requests.get(
                f"{PSGC_BASE}/provinces/{prov_code}/cities-municipalities/"
            ).json()

            for city_data in municipalities:
                muni_obj, _ = Municipality.objects.get_or_create(
                    name=city_data["name"],
                    province=prov_obj
                )

                self.stdout.write(f"   🏙 Municipality: {city_data['name']}")

                # Get barangays under this municipality
                barangays = requests.get(
                    f"{PSGC_BASE}/cities-municipalities/{city_data['code']}/barangays/"
                ).json()

                for brgy_data in barangays:
                    brgy_obj, _ = Barangay.objects.get_or_create(
                        name=brgy_data["name"],
                        municipality=muni_obj
                    )

                self.stdout.write(f"      ✅ {len(barangays)} barangays added under {city_data['name']}")

        self.stdout.write(self.style.SUCCESS("🎉 Region 7 provinces, municipalities, and barangays seeded successfully."))
