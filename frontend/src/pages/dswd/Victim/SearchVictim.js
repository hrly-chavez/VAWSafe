
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const API_BASE = "http://127.0.0.1:8000/api/dswd";

export default function SearchVictim({ onClose, onFound }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Send to backend
      const formData = new FormData();
      formData.append("frame", blob, "capture.jpg");

      const res = await fetch(`${API_BASE}/victims/search-victim/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.match) {
        onFound(data.victim_id); //  callback to parent (Victims.js)
      } else {
        setMessage(data.message || "No victim match found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

        return (
        <div className="facial-modal-overlay">
      <div className="facial-modal">
        {/* Header row */}
        <div className="modal-header">
          <h3>Search Victim by Face</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam-preview w-[400px] h-[300px]"
        />

        <button onClick={captureAndSearch} disabled={loading}>
          {loading ? "Searching..." : "Search Victim"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
        );

}
