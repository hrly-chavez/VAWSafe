import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import api from "../../../../api/axios";

export default function ForgotPasswordModal({ onClose }) {
  const webcamRef = useRef(null);
  const [step, setStep] = useState("capture"); // capture → email → reset → done
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [officialData, setOfficialData] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  

  const [email, setEmail] = useState("");

  // Step 1: Capture face and verify
  const captureAndVerify = async () => {
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

      //change pass
      const res = await api.post("/api/dswd/change-pass/", formData);
      const data = res.data;

      if (data.success) {
        setOfficialData(data.official || {});
        setStep("email"); // ✅ go to email verification step
      } else {
        setMessage(data.message || "No matching account found.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      if (err.response?.data?.message) {
        const raw = err.response.data.message;

        // if message contains "Face could not be detected", show cleaner text
        if (raw.includes("Face could not be detected")) {
          setMessage("Face could not be detected. Please confirm that the picture is a face photo.");
        } else {
          setMessage(raw);
        }
      } else {
        setMessage("Error connecting to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email & get reset token
  const handleVerifyEmail = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/api/dswd/verify-email/", {
        official_id: officialData.id,
        email: email,
      });



      if (res.data.success) {
        setResetToken(res.data.reset_token);
        setStep("reset"); // ✅ now proceed to reset step
        onClose();
      } else {
        setMessage(res.data.message || "Email verification failed.");
      }
    } catch (err) {
      console.error("Email verification error:", err);
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-[1001] w-[95%] max-w-md rounded-2xl bg-white shadow-xl border border-neutral-200 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[#292D96]">
          Change Password (Face Verification)
        </h3>

        {message && (
          <div className="p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
            {message}
          </div>
        )}

        {/* Step 1: Capture Face */}
        {step === "capture" && (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg border border-neutral-200 w-full h-[300px] object-cover"
              videoConstraints={{ facingMode: "user" }}
              mirrored
            />
            <button
              onClick={captureAndVerify}
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2 text-white transition ${
                loading
                  ? "bg-emerald-600/70 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify Face"}
            </button>
          </>
        )}

        {/* Step 2: Enter Email */}
        {step === "email" && (
          <>
            <p className="text-sm text-neutral-700">
              Face matched: <strong>{officialData.full_name}</strong>
            </p>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2 text-white transition ${
                loading
                  ? "bg-blue-600/70 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
