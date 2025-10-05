# from django.core.management.base import BaseCommand
# from django.apps import apps
# from fernet_fields import EncryptedField

# class Command(BaseCommand):
#     help = "Re-encrypt all Fernet-encrypted fields using the latest FERNET_KEYS[0]."

#     def handle(self, *args, **options):
#         encrypted_models = []

#         # Loop through all models in all installed apps
#         for model in apps.get_models():
#             # Check if model has at least one EncryptedField
#             encrypted_fields = [
#                 field.name for field in model._meta.get_fields()
#                 if isinstance(field, EncryptedField)
#             ]
#             if encrypted_fields:
#                 encrypted_models.append((model, encrypted_fields))

#         if not encrypted_models:
#             self.stdout.write(self.style.WARNING("No models found with EncryptedField."))
#             return

#         self.stdout.write(self.style.SUCCESS("Starting Fernet key rotation..."))

#         # Iterate through each model and re-save all rows
#         for model, fields in encrypted_models:
#             count = model.objects.count()
#             if count == 0:
#                 continue

#             self.stdout.write(f"Re-encrypting {count} records in {model.__name__}...")

#             for obj in model.objects.all():
#                 # Re-save to trigger encryption with new key
#                 obj.save(update_fields=fields)

#         self.stdout.write(self.style.SUCCESS("✅ All encrypted fields re-encrypted with the latest Fernet key!"))

import os
import json
from datetime import datetime
from django.core.management.base import BaseCommand
from django.apps import apps
from fernet_fields import EncryptedField
from django.core.serializers import serialize


class Command(BaseCommand):
    help = "Re-encrypt all Fernet-encrypted fields using the latest FERNET_KEYS[0], with a JSON backup."

    def handle(self, *args, **options):
        encrypted_models = []

        # Find all models containing at least one EncryptedField
        for model in apps.get_models():
            encrypted_fields = [
                field.name for field in model._meta.get_fields()
                if isinstance(field, EncryptedField)
            ]
            if encrypted_fields:
                encrypted_models.append((model, encrypted_fields))

        if not encrypted_models:
            self.stdout.write(self.style.WARNING("No models found with EncryptedField."))
            return

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(os.getcwd(), "backups")
        os.makedirs(backup_dir, exist_ok=True)

        backup_file = os.path.join(backup_dir, f"backup_before_rotation_{timestamp}.json")

        self.stdout.write(self.style.NOTICE("🔄 Creating encrypted data backup before rotation..."))

        # Backup data
        all_data = {}
        for model, _ in encrypted_models:
            queryset = model.objects.all()
            if queryset.exists():
                all_data[model.__name__] = json.loads(serialize("json", queryset))

        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(all_data, f, indent=2)

        self.stdout.write(self.style.SUCCESS(f"✅ Backup created at: {backup_file}"))

        # Start re-encryption
        self.stdout.write(self.style.NOTICE("Re-encrypting all Fernet fields using the latest key..."))

        for model, fields in encrypted_models:
            count = model.objects.count()
            if count == 0:
                continue

            self.stdout.write(f" - {model.__name__}: {count} records")

            for obj in model.objects.all():
                obj.save(update_fields=fields)

        self.stdout.write(self.style.SUCCESS("✅ All encrypted fields successfully re-encrypted with the latest Fernet key!"))
        self.stdout.write(self.style.SUCCESS("💾 Backup file retained for rollback safety."))
