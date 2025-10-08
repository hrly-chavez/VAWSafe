#backend/dswd/utils/logging.py
from shared_model.models import ChangeLog


def log_change(user, model_name, record_id, action, description="", old_data=None, new_data=None):
    """Generic helper to record a ChangeLog entry."""
    official_user = getattr(user, "official", None)  # safely get related Official

    ChangeLog.objects.create(
        user=official_user,
        model_name=model_name,
        record_id=record_id,
        action=action,
        description=description,
        old_data=old_data or {},
        new_data=new_data or {},
    )

