// src/pages/desk_officer/components/VictimFacial.js
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "./navBar";
import Sidebar from "./sideBar";

const MAX_PHOTOS = 3;

export default function VictimFacial() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const capturePhoto = async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      alert("Unable to capture photo. Please try again.");
      return;
    }

    // FIX: res.blob(), not =ares.blob()
    const blob = await fetch(screenshot).then((res) => res.blob());
    const photoFile = new File([blob], `victim_photo_${currentIndex + 1}.jpg`, {
      type: "image/jpeg",
    });

    const updated = [...photos];
    updated[currentIndex] = photoFile;
    setPhotos(updated);

    if (currentIndex < MAX_PHOTOS - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const retakePhoto = (index) => {
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (photos.length < MAX_PHOTOS || photos.some((p) => !p)) {
      alert(`Please capture all ${MAX_PHOTOS} photos before proceeding.`);
      return;
    }
    navigate("/desk_officer/register_victim", { state: { victimPhotos: photos } });
  };

  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
            <h1 className="text-2xl font-semibold mb-4">Capture Victim Photos</h1>

            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            />

            <button
              type="button"
              onClick={capturePhoto}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
            >
              Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
            </button>

            <div className="flex gap-2 mt-4 justify-center flex-wrap">
              {photos.map((photo, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Face ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => retakePhoto(index)}
                    className="mt-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Retake #{index + 1}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
