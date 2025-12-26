import bleach

ALLOWED_TAGS = []  # no HTML allowed
ALLOWED_ATTRIBUTES = {}

def sanitize_text(value):
    if not isinstance(value, str):
        return value

    return bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )