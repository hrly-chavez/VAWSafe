#para ni sa /admin nga embeddings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Official, OfficialFaceSample
from .face_embeddings import compute_arcface_embedding
from django.db import transaction

# @receiver(post_save, sender=OfficialFaceSample)
# def compute_embedding_on_sample_save(sender, instance: OfficialFaceSample, created, **kwargs):
#     """
#     When a DSWD sample is added/updated (e.g., via admin inline),
#     compute the embedding if it's missing.
#     """
#     try:
#         if instance.official.of_role == "DSWD" and not instance.embedding and instance.photo:
#             emb = compute_arcface_embedding(instance.photo)
#             OfficialFaceSample.objects.filter(pk=instance.pk).update(embedding=emb)
#     except Exception:
#         # Leave it NULL if detection fails
#         pass

# @receiver(post_save, sender=OfficialFaceSample)
# def compute_embedding_on_sample_save(sender, instance: OfficialFaceSample, created, **kwargs):
#     """
#     When ANY sample is added/updated (inline or its own page),
#     compute the embedding if it's missing. Runs after commit so the file is available.
#     """
#     if instance.embedding or not instance.photo:
#         return
#     if instance.official.status != "approved":  # ← embed only after approval
#         return

#     def _do():
#         try:
#             emb = compute_arcface_embedding(instance.photo, detector_backend="opencv")
#             emb = [float(x) for x in emb]  # ensure plain list[float]
#             OfficialFaceSample.objects.filter(pk=instance.pk).update(embedding=emb)
#         except Exception:
#             pass  # keep admin UX smooth

#     transaction.on_commit(_do)

@receiver(post_save, sender=OfficialFaceSample)
def compute_embedding_on_sample_save(sender, instance: OfficialFaceSample, created, **kwargs):
    # guards
    if instance.embedding or not instance.photo:
        return
    # if you only want after approval, uncomment:
    if instance.official.status != "approved":
        return

    def _do():
        try:
            emb = compute_arcface_embedding(instance.photo, detector_backend="opencv")
            emb = [float(x) for x in emb]  # store plain list[float]
            # avoid recursive signal:
            OfficialFaceSample.objects.filter(pk=instance.pk).update(embedding=emb)
        except Exception:
            pass  # don't crash admin

    transaction.on_commit(_do)

@receiver(post_save, sender=Official)
def backfill_embeddings_on_official_save(sender, instance: Official, created, **kwargs):
    """
    Whenever an Official is saved with status == 'approved',
    compute embeddings for any existing samples that don't have one yet.
    This covers the case where samples were uploaded while pending and the
    status is flipped to approved via the /dswd PendingOfficials.approve view.
    """
    if instance.status != "approved":
        return

    def _do():
        try:
            missing = OfficialFaceSample.objects.filter(
                official=instance,
                embedding__isnull=True,
                photo__isnull=False,
            ).exclude(photo="")
            for s in missing:
                try:
                    emb = compute_arcface_embedding(s.photo, detector_backend="opencv")
                    OfficialFaceSample.objects.filter(pk=s.pk).update(
                        embedding=[float(x) for x in emb]
                    )
                except Exception:
                    # skip failing samples; others will still embed
                    pass
        except Exception:
            # never crash the request
            pass

    # ensure the Official + files are committed before reading
    transaction.on_commit(_do)