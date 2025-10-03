# import os
# import tempfile
# import traceback
# from PIL import Image, ImageOps
# from deepface import DeepFace

#mao ni ang mo work sa create_official
# # def compute_arcface_embedding(file_or_path):
# #     """
# #     Accepts an InMemoryUploadedFile/FileField or a filesystem path.
# #     Returns a list[float] embedding.
# #     """
# #     tmp_path = None
# #     try:
# #         # If it's a file-like (uploaded) object, persist to a temp JPEG
# #         if hasattr(file_or_path, "read"):
# #             with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
# #                 img = Image.open(file_or_path).convert("RGB")
# #                 img.save(tmp, format="JPEG")
# #                 tmp_path = tmp.name
# #         else:
# #             # Assume it's a path
# #             tmp_path = file_or_path

# #         result = DeepFace.represent(
# #             img_path=tmp_path,
# #             model_name="ArcFace",
# #             enforce_detection=True
# #         )

# #         # Normalize DeepFace output
# #         if isinstance(result, list):
# #             if result and isinstance(result[0], dict) and "embedding" in result[0]:
# #                 embedding = result[0]["embedding"]
# #             elif all(isinstance(x, float) for x in result):
# #                 embedding = result
# #             else:
# #                 raise ValueError("Unexpected list format from DeepFace.")
# #         elif isinstance(result, dict) and "embedding" in result:
# #             embedding = result["embedding"]
# #         else:
# #             raise ValueError("Unexpected format from DeepFace.represent().")

# #         return embedding

# #     finally:
# #         try:
# #             # Clean up temp file only if we created one
# #             if hasattr(file_or_path, "read") and tmp_path and os.path.exists(tmp_path):
# #                 os.remove(tmp_path)
# #         except Exception:
# #             traceback.print_exc()



# mao ni ang mo work sa admin
# def compute_arcface_embedding(file_or_path, detector_backend="opencv"):
#     """
#     Mirror your API view behavior for embeddings:
#       - ArcFace
#       - OpenCV detector (no downloads)
#       - enforce_detection=True
#       - align=True (DeepFace default; keeps it consistent)
#     Returns: list[float] embedding (same normalization as your view)
#     """
#     tmp_path = None
#     try:
#         # Persist uploaded file to a temp JPEG with safe preprocessing
#         if hasattr(file_or_path, "read"):
#             with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
#                 img = Image.open(file_or_path)
#                 try:
#                     # Handle EXIF orientation like phones
#                     img = ImageOps.exif_transpose(img)
#                 except Exception:
#                     pass
#                 img = img.convert("RGB")
#                 # optional: downscale very large images to stabilize detection speed
#                 max_side = 1024
#                 w, h = img.size
#                 if max(w, h) > max_side:
#                     scale = max_side / float(max(w, h))
#                     img = img.resize((int(w*scale), int(h*scale)), Image.BILINEAR)
#                 img.save(tmp, format="JPEG", quality=92)
#                 tmp_path = tmp.name
#         else:
#             # Already a filesystem path
#             tmp_path = file_or_path

#         # Match your view: ArcFace + strict detection; NO retinaface download
#         embeddings = DeepFace.represent(
#             img_path=tmp_path,
#             model_name="ArcFace",
#             detector_backend=detector_backend,  # default "opencv"
#             enforce_detection=True,
#             align=True,
#             prog_bar=False
#         )

#         # ---- Normalize like your view ----
#         if isinstance(embeddings, list):
#             if embeddings and isinstance(embeddings[0], dict) and "embedding" in embeddings[0]:
#                 embedding_vector = embeddings[0]["embedding"]
#             elif embeddings and all(isinstance(x, float) for x in embeddings):
#                 embedding_vector = embeddings
#             else:
#                 raise ValueError("Unexpected list format from DeepFace.")
#         elif isinstance(embeddings, dict) and "embedding" in embeddings:
#             embedding_vector = embeddings["embedding"]
#         else:
#             raise ValueError("Unexpected format from DeepFace.represent()")

#         return embedding_vector

#     finally:
#         # Cleanup temp file if we created it
#         try:
#             if hasattr(file_or_path, "read") and tmp_path and os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#         except Exception:
#             traceback.print_exc()


# shared_model/face_embeddings.py
import os
import tempfile
import traceback
from typing import Optional, Sequence, Union
from PIL import Image, ImageOps
from deepface import DeepFace

FileLikeOrPath = Union[str, "django.core.files.File", "django.core.files.uploadedfile.InMemoryUploadedFile"]

def compute_arcface_embedding(
    file_or_path: FileLikeOrPath,
    detector_backend: Optional[str] = None,
    *,
    preprocess: bool = True,
    align: bool = True,
    enforce_detection: bool = True,
) -> Sequence[float]:
    """
    Unified helper for /admin + signals (and compatible with your API):
    - detector_backend=None -> DeepFace default (like your API view)
    - detector_backend="opencv" -> no extra downloads (use in admin)
    Returns a plain list[float].
    """
    tmp_path = None
    try:
        # Persist uploaded file to a temp JPEG with safe preprocessing
        if hasattr(file_or_path, "read"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                img = Image.open(file_or_path)
                if preprocess:
                    try:
                        img = ImageOps.exif_transpose(img)
                    except Exception:
                        pass
                    img = img.convert("RGB")
                    max_side = 1024
                    w, h = img.size
                    if max(w, h) > max_side:
                        scale = max_side / float(max(w, h))
                        img = img.resize((int(w * scale), int(h * scale)), Image.BILINEAR)
                else:
                    img = img.convert("RGB")
                img.save(tmp, format="JPEG", quality=92)
                tmp_path = tmp.name
        else:
            tmp_path = file_or_path

        kwargs = dict(
            img_path=tmp_path,
            model_name="ArcFace",
            enforce_detection=enforce_detection,
            align=align,
        )
        if detector_backend:
            kwargs["detector_backend"] = detector_backend

        # Backward-compatible call: some DeepFace versions don’t support prog_bar
        try:
            result = DeepFace.represent(**kwargs, prog_bar=False)  # newer versions
        except TypeError:
            result = DeepFace.represent(**kwargs)  # older versions

        # Normalize to list[float]
        if isinstance(result, list):
            if result and isinstance(result[0], dict) and "embedding" in result[0]:
                embedding = result[0]["embedding"]
            elif result and all(isinstance(x, (float, int)) for x in result):
                embedding = result
            else:
                raise ValueError("Unexpected list format from DeepFace.represent().")
        elif isinstance(result, dict) and "embedding" in result:
            embedding = result["embedding"]
        else:
            raise ValueError("Unexpected format from DeepFace.represent().")

        return [float(x) for x in embedding]

    finally:
        try:
            if hasattr(file_or_path, "read") and tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            traceback.print_exc()
