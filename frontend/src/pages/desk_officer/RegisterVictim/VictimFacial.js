// src/pages/desk_officer/RegisterVictim/VictimFacial.js
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "../../Navbar";

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
    navigate("/desk_officer/register_victim", {
      state: { victimPhotos: photos },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <div className="w-full p-6">
          <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Capture Victim Photos
            </h1>

            {/* Webcam fills available middle space */}
            <div className="flex-1 my-6 rounded-xl overflow-hidden border shadow-md flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 1920,
                  height: 1080,
                  facingMode: "user",
                }}
              />
            </div>

            {/* Buttons + previews stacked at bottom */}
            <div className="space-y-6">
              {/* Capture button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl shadow transition"
              >
                📸 Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
              </button>

              {/* Photos preview */}
              <div className="flex gap-4 justify-center flex-wrap">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center bg-gray-50 p-3 rounded-lg shadow-sm"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Face ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border shadow"
                    />
                    <button
                      type="button"
                      onClick={() => retakePhoto(index)}
                      className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                    >
                      🔄 Retake #{index + 1}
                    </button>
                  </div>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Webcam from "react-webcam";
// import Navbar from "../../Navbar";
// import api from "../../../api/axios"; // <- import global axios

// const MAX_PHOTOS = 3;

// export default function VictimFacial() {
//   const webcamRef = useRef(null);
//   const [photos, setPhotos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const capturePhoto = async () => {
//     const screenshot = webcamRef.current?.getScreenshot();
//     if (!screenshot) {
//       alert("Unable to capture photo. Please try again.");
//       return;
//     }

//     const blob = await fetch(screenshot).then((res) => res.blob());
//     const photoFile = new File([blob], `victim_photo_${currentIndex + 1}.jpg`, {
//       type: "image/jpeg",
//     });

//     const updated = [...photos];
//     updated[currentIndex] = photoFile;
//     setPhotos(updated);

//     if (currentIndex < MAX_PHOTOS - 1) setCurrentIndex(currentIndex + 1);
//   };

//   const retakePhoto = (index) => {
//     setCurrentIndex(index);
//   };

//   const handleNext = async () => {
//     if (photos.length < MAX_PHOTOS || photos.some((p) => !p)) {
//       alert(`Please capture all ${MAX_PHOTOS} photos before proceeding.`);
//       return;
//     }

//     try {
//       setLoading(true);
//       const formData = new FormData();
//       photos.forEach((file) => formData.append("photos", file));

//       // Example: upload immediately or just store globally
//       const res = await api.post("/desk_officer/victims/upload-photos/", formData);
//       console.log("Upload response:", res.data);

//       // Navigate to registration page and pass photos
//       navigate("/desk_officer/register_victim", { state: { victimPhotos: photos } });
//     } catch (err) {
//       console.error("Photo upload failed:", err);
//       alert("Failed to upload photos. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />
//       <div className="flex flex-row flex-1">
//         <div className="w-full p-6">
//           <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg h-[calc(100vh-4rem)] flex flex-col">
//             <h1 className="text-3xl font-bold text-gray-800 text-center">
//               Capture Victim Photos
//             </h1>

//             <div className="flex-1 my-6 rounded-xl overflow-hidden border shadow-md flex items-center justify-center">
//               <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 className="w-full h-full object-cover"
//                 videoConstraints={{ width: 1920, height: 1080, facingMode: "user" }}
//               />
//             </div>

//             <div className="space-y-6">
//               <button
//                 type="button"
//                 onClick={capturePhoto}
//                 disabled={loading}
//                 className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl shadow transition"
//               >
//                 📸 Capture Photo {currentIndex + 1}/{MAX_PHOTOS}
//               </button>

//               <div className="flex gap-4 justify-center flex-wrap">
//                 {photos.map((photo, index) => (
//                   <div key={index} className="flex flex-col items-center bg-gray-50 p-3 rounded-lg shadow-sm">
//                     <img
//                       src={URL.createObjectURL(photo)}
//                       alt={`Face ${index + 1}`}
//                       className="w-24 h-24 object-cover rounded-lg border shadow"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => retakePhoto(index)}
//                       className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
//                     >
//                       🔄 Retake #{index + 1}
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={handleNext}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition"
//               >
//                 Next ➡️
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
