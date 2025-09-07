// src/pages/desk_officer/RegisterVictim/VictimFacial.js
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { CameraIcon, ArrowPathIcon, TrashIcon } from "@heroicons/react/24/solid";

const MAX_PHOTOS = 3;

export default function CaptureVictimFacial({ victimPhotos = [], setFormDataState }) {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState(victimPhotos);
  const [currentIndex, setCurrentIndex] = useState(photos.length || 0);

  // 📸 Capture photo
  const capturePhoto = async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      alert("Unable to capture photo. Please try again.");
      return;
    }

    const blob = await fetch(screenshot).then((res) => res.blob());
    const photoFile = new File([blob], `victim_photo_${currentIndex + 1}.jpg`, {
      type: "image/jpeg",
    });

    const updated = [...photos];
    updated[currentIndex] = photoFile;
    setPhotos(updated);
    setFormDataState((prev) => ({ ...prev, victimPhotos: updated }));

    if (currentIndex < MAX_PHOTOS - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 🔄 Retake a specific photo
  const retakePhoto = (index) => {
    setCurrentIndex(index);
  };

  // ❌ Remove a photo
  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setFormDataState((prev) => ({ ...prev, victimPhotos: updated }));

    if (updated.length < MAX_PHOTOS) {
      setCurrentIndex(updated.length);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-blue-800 mb-4 text-center tracking-wide">
        Capture Victim Facial Photos
      </h2>

      {/* Camera */}
      <div className="flex justify-center mb-6">
        <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm w-full max-w-lg">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-auto"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
        </div>
      </div>

      {/* Capture Button */}
      {photos.length < MAX_PHOTOS && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={capturePhoto}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-700 transition"
          >
            <CameraIcon className="h-5 w-5 text-white" />
            Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
          </button>
        </div>
      )}

      {/* Previews */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 justify-center">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-gray-50 p-3 rounded-lg shadow-sm border"
          >
            <img
              src={URL.createObjectURL(photo)}
              alt={`Face ${index + 1}`}
              className="w-24 h-24 object-cover rounded border mb-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => retakePhoto(index)}
                className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
              >
                <ArrowPathIcon className="h-4 w-4 text-white" />
                Retake
              </button>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
              >
                <TrashIcon className="h-4 w-4 text-white" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
