import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import api from "../../../api/axios";

export default function SearchVictimFacial({ onClose, onFound }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Lock scroll when modal opens
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const captureAndSearch = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("No image captured. Please try again.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Convert base64 → Blob
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });

      const formData = new FormData();
      formData.append("frame", blob, "capture.jpg");

      // 🔹 KEPT EXACTLY AS YOU SAID
      const res = await api.post("/api/social_worker/victims/search_face/", formData);

      const data = res.data;

      if (data.match) {
        onFound?.(data.victim_id);
      } else {
        setMessage(data.message || "No victim match found.");
      }

    } catch (err) {
      console.error("Search victim error:", err);

      if (err.response) {
        // If backend returns JSON error (like match:false), show it
        const backendMessage = err.response.data?.message;

        if (backendMessage) {
          setMessage(backendMessage);
        } else {
          setMessage("Server returned an error.");
        }
      } else {
        setMessage("Error connecting to server.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-[1001] w-[95%] max-w-xl rounded-2xl bg-white shadow-xl border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-[#292D96]">Search Victim by Face</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg border border-neutral-200 w-full h-[300px] object-cover"
            videoConstraints={{ facingMode: "user" }}
            mirrored
          />

          <div className="flex items-center gap-3">
            <button
              onClick={captureAndSearch}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-white transition ${
                loading ? "bg-emerald-600/70 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Searching..." : "Search Victim"}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>

          {message && <p className="text-sm text-red-600 font-medium">{message}</p>}

          <p className="text-xs text-neutral-500">
            Tip: camera access works on HTTPS or localhost. If the preview is blank,
            check the browser’s camera permission in the address bar.
          </p>
        </div>
      </div>
    </div>
  );
}
