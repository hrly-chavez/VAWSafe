import cv2
import dlib
import numpy as np
from scipy.spatial import distance as dist
from imutils import face_utils
import os

PREDICTOR_PATH = os.path.join(os.path.dirname(__file__), "shape_predictor_68_face_landmarks.dat")

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(PREDICTOR_PATH)

(L_START, L_END) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(R_START, R_END) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def detect_blink(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 0)

    for rect in rects:
        shape = predictor(gray, rect)
        shape_np = face_utils.shape_to_np(shape)

        leftEye = shape_np[L_START:L_END]
        rightEye = shape_np[R_START:R_END]

        leftEAR = eye_aspect_ratio(leftEye)
        rightEAR = eye_aspect_ratio(rightEye)
        avg_ear = (leftEAR + rightEAR) / 2.0

        print(f"[DEBUG] EAR: {avg_ear:.3f}")  # Log EAR for testing

        if avg_ear < 0.23:  # ← Increase threshold slightly
            return True

    return False




#BETTER VERSION?
# PREDICTOR_PATH = os.path.join(os.path.dirname(__file__), "shape_predictor_68_face_landmarks.dat")

# # Initialize once (costly to load)
# detector = dlib.get_frontal_face_detector()
# predictor = dlib.shape_predictor(PREDICTOR_PATH)

# (L_START, L_END) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
# (R_START, R_END) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

# def eye_aspect_ratio(eye_pts: np.ndarray) -> float:
#     """
#     Compute the eye aspect ratio for a set of 6 eye landmarks (6x2).
#     Returns a scalar; lower means more closed.
#     """
#     # vertical distances
#     A = dist.euclidean(eye_pts[1], eye_pts[5])
#     B = dist.euclidean(eye_pts[2], eye_pts[4])
#     # horizontal distance
#     C = dist.euclidean(eye_pts[0], eye_pts[3])
#     if C == 0:
#         return 0.0
#     return (A + B) / (2.0 * C)

# def detect_blink(image_bytes: bytes, ear_threshold: float = 0.23, upsample: int = 0) -> bool:
#     """
#     Returns True if a blink (closed eyes) is detected in the image.
#     - ear_threshold: lower -> stricter (harder to trigger), higher -> looser (easier to trigger)
#     - upsample: try 1 if faces are small
#     """
#     # Decode image bytes to BGR
#     nparr = np.frombuffer(image_bytes, dtype=np.uint8)
#     frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#     if frame is None:
#         # corrupted bytes or unsupported image
#         return False

#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     rects = detector(gray, upsample)

#     # Optionally, pick the largest face only
#     if len(rects) > 1:
#         rects = sorted(rects, key=lambda r: r.width() * r.height(), reverse=True)
#         rects = [rects[0]]

#     for rect in rects:
#         # Landmark detection
#         shape = predictor(gray, rect)
#         shape_np = face_utils.shape_to_np(shape)  # (68,2)

#         left_eye = shape_np[L_START:L_END]
#         right_eye = shape_np[R_START:R_END]

#         left_ear = eye_aspect_ratio(left_eye)
#         right_ear = eye_aspect_ratio(right_eye)
#         avg_ear = (left_ear + right_ear) / 2.0

#         # Debugging hook
#         # print(f"[DEBUG] EAR left={left_ear:.3f} right={right_ear:.3f} avg={avg_ear:.3f}")

#         if avg_ear < ear_threshold:
#             return True

#     return False
