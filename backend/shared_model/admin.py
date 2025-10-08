from django.contrib import admin, messages
from .models import *
from django.db import transaction
from django.db.models import Prefetch
from django.utils.html import format_html
from django.urls import reverse  # ← add this
from .face_embeddings import compute_arcface_embedding
from django.db.models import IntegerField, Func, Q

class ArrayLength(Func):
    function = "array_length"
    template = "%(function)s(%(expressions)s, 1)"
    output_field = IntegerField()

class OfficialFaceSampleInline(admin.TabularInline):
    model = OfficialFaceSample
    extra = 0
    fields = ("photo", "has_embedding")
    readonly_fields = ("has_embedding",)

    def has_embedding(self, obj):
        return bool(obj.embedding)
    has_embedding.boolean = True
    has_embedding.short_description = "Embedding?"


@admin.action(description="Generate embeddings (ALL roles)")
def generate_embeddings(modeladmin, request, queryset):
    queryset = queryset.filter(status="approved")
    
    if not queryset.exists():
        messages.info(request, "No officials selected.")
        return

    computed = 0
    failed_ids = []
    skipped_no_sample = 0

    for official in queryset:
        samples = list(official.face_samples.all())
        if not samples:
            skipped_no_sample += 1
            continue

        for sample in samples:
            if sample.embedding or not sample.photo:
                continue
            try:
                emb = compute_arcface_embedding(sample.photo, detector_backend="opencv")
                sample.embedding = [float(x) for x in emb]
                sample.save(update_fields=["embedding"])
                computed += 1
            except Exception:
                failed_ids.append(sample.pk)

    if computed:
        messages.success(request, f"Computed embeddings for {computed} sample(s).")
    if failed_ids:
        messages.warning(request, f"Failed to compute embeddings for sample IDs: {failed_ids}")
    if skipped_no_sample:
        messages.info(request, f"Officials with no samples: {skipped_no_sample}")


@admin.register(Official)
class OfficialAdmin(admin.ModelAdmin):
    list_display = ("of_id", "full_name", "of_role", "status", "of_email", "has_embedding_badge")
    list_display_links = ("of_id", "full_name")
    list_filter = ("of_role", "status")
    search_fields = ("of_fname", "of_lname", "of_email", "of_contact")
    inlines = [OfficialFaceSampleInline]
    actions = [generate_embeddings]
    readonly_fields = ()

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Prefetch only the fields we need from samples
        return qs.prefetch_related(
            Prefetch(
                "face_samples",
                queryset=OfficialFaceSample.objects.only("id", "embedding")
            )
        )

    # def has_embedding_badge(self, obj):
    #     # Python-side check: any sample has a non-empty embedding list?
    #     samples = getattr(obj, "face_samples").all()
    #     has_emb = any(bool(s.embedding) and len(s.embedding) > 0 for s in samples)
    #     color = "#16a34a" if has_emb else "#ef4444"
    #     text = "Yes" if has_emb else "No"
    #     return format_html('<b style="color:{}">{}</b>', color, text)

    def has_embedding_badge(self, obj):
        """
        Hybrid check:
        - DB path: array_length(embedding, 1) > 0 OR embedding IS NOT NULL
        - Fallback: Python any(len(embedding) > 0)
        """
        try:
            qs = obj.face_samples.all().annotate(emb_len=ArrayLength("embedding"))
            has_db = qs.filter(Q(emb_len__gt=0) | Q(embedding__isnull=False)).exists()
            if not has_db:
                has = False
            else:
                # Extra-safe confirm using the prefetched objects
                samples = getattr(obj, "face_samples").all()
                has_py = any(s.embedding and len(s.embedding) > 0 for s in samples)
                has = has_py or has_db
        except Exception:
            # If DB func not supported, fall back to Python check
            samples = getattr(obj, "face_samples").all()
            has = any(s.embedding and len(s.embedding) > 0 for s in samples)

        color = "#16a34a" if has else "#ef4444"
        text = "Yes" if has else "No"
        return format_html('<b style="color:{}">{}</b>', color, text)

    has_embedding_badge.short_description = "Any embedding?"

    def save_model(self, request, obj: Official, form, change):
        """
        On admin save for DSWD: DO NOT create samples from of_photo.
        Only compute embeddings for existing OfficialFaceSample photos.
        """
        super().save_model(request, obj, form, change)

        if obj.status != "approved":
            return


        # if obj.of_role != "DSWD":
        #     return

        try:
            missing_qs = obj.face_samples.filter(
                embedding__isnull=True,
                photo__isnull=False
            ).exclude(photo="")

            if not missing_qs.exists():
                messages.info(request, "No pending face samples to embed for this DSWD official.")
                return

            computed = 0
            failed_ids = []
            for sample in missing_qs:
                try:
                    emb = compute_arcface_embedding(sample.photo, detector_backend="opencv")
                    sample.embedding = [float(x) for x in emb]  # ← ensure plain Python list[float]
                    sample.save(update_fields=["embedding"])
                    computed += 1
                except Exception:
                    failed_ids.append(sample.pk)


            if computed:
                messages.success(request, f"Computed embeddings for {computed} face sample(s).")
            if failed_ids:
                messages.warning(request, f"Failed to compute embeddings for face sample IDs: {failed_ids}")
            if not computed and not failed_ids:
                messages.info(request, "No pending face samples to embed for this DSWD official.")
        except Exception:
            messages.error(request, "Unexpected error while generating embeddings.")
            messages.error(request, "Unexpected error while generating embedding.")

@admin.register(OfficialFaceSample)
class OfficialFaceSampleAdmin(admin.ModelAdmin):
    list_display = ("official_link", "has_embedding")  # ← show link instead of plain text
    readonly_fields = ()
    search_fields = ("official__of_fname", "official__of_lname")

    def official_link(self, obj):
        # admin URL is: admin:<app_label>_<modelname>_change
        url = reverse("admin:shared_model_official_change", args=[obj.official.pk])
        return format_html('<a href="{}">{}</a>', url, obj.official.full_name)
    official_link.short_description = "Official"

    def has_embedding(self, obj):
        return bool(obj.embedding)
    has_embedding.boolean = True
    has_embedding.short_description = "Embedding?"


admin.site.register(Victim)
# admin.site.register(VictimFaceSample)
# admin.site.register(IncidentInformation)

admin.site.register(Session)
admin.site.register(SessionType)
admin.site.register(Question)

admin.site.register(Services)
admin.site.register(ServiceCategory)

admin.site.register(AuditLog)

# admin.site.register(Province)
# admin.site.register(Municipality)
# admin.site.register(Barangay)
# admin.site.register(Sitio)
# admin.site.register(Street)