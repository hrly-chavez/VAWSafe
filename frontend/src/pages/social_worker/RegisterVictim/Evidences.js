import React, { useState, useRef, useEffect } from "react";

export default function Evidences({ files, setFiles, isLocked }) {
  const [error, setError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // --- Camera capture functions ---
  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "❌ Unable to access camera. Make sure you allowed camera permissions."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `evidence_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const preview = URL.createObjectURL(file);

        setFiles((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}`, file, preview },
        ]);
      },
      "image/jpeg",
      0.9
    );

    stopCamera();
  };

  // --- File upload function ---
  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="p-4 bg-white rounded-lg shadow w-full">
      <h2 className="text-lg font-semibold mb-3">Evidences (Photo & Files)</h2>

      {!isLocked && (
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            📸 Open Camera
          </button>
          <label className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
            📁 Upload Files
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {isCameraOpen && (
        <div className="relative mb-3">
          <video ref={videoRef} className="w-full rounded border" />
          <div className="flex gap-2 mt-2">
            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✔ Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ✖ Cancel
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Display uploaded/captured files */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative">
              {/* Show image preview if available, else generic file icon */}
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="w-full h-24 object-cover rounded border"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center border rounded bg-gray-100 text-sm">
                  {f.file.name}
                </div>
              )}
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => handleRemove(f.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
