// frontend/src/pages/desk_officer/RegisterVictim/VictimFullBody.js
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { CameraIcon } from "@heroicons/react/24/solid";

export default function VictimFullBody({ setFormDataState }) {
  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullBody, setIsFullBody] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) {
        setIsFullBody(false);
        return;
      }

      const lm = results.poseLandmarks;

      const head = lm[0];      // nose
      const ankleL = lm[27];   // left ankle
      const ankleR = lm[28];   // right ankle

      const visible =
        head?.visibility > 0.6 &&
        ankleL?.visibility > 0.6 &&
        ankleR?.visibility > 0.6;

      setIsFullBody(visible);
    });

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const capturePhoto = async () => {
    const screenshot = webcamRef.current.getScreenshot();
    const blob = await fetch(screenshot).then((r) => r.blob());

    const file = new File([blob], "victim_full_body.jpg", {
      type: "image/jpeg",
    });

    setPhoto(file);
    setFormDataState((prev) => ({
      ...prev,
      victimFullBodyPhoto: file,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-blue-800 mb-3 text-center">
        Capture Full Body Photo
      </h2>

      <p className="text-center text-gray-600 mb-4">
        Stand far enough so your <strong>head to feet</strong> are visible.
        Capture is enabled only when full body is detected.
      </p>

      <div className="flex justify-center mb-5">
        <div className="relative w-full max-w-lg border rounded-lg overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            className="w-full"
          />

          {/* Detection indicator */}
          <div
            className={`absolute inset-0 border-4 transition-all ${
              isFullBody
                ? "border-green-500 shadow-[0_0_15px_#22c55e]"
                : "border-red-400"
            }`}
          />
        </div>
      </div>

      {!photo && (
        <div className="flex justify-center">
          <button
            onClick={capturePhoto}
            disabled={!isFullBody}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition
              ${
                isFullBody
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
          >
            <CameraIcon className="h-5 w-5 text-white" />
            Capture Full Body
          </button>
        </div>
      )}

      {photo && (
        <div className="mt-6 flex flex-col items-center">
          <img
            src={URL.createObjectURL(photo)}
            alt="Full Body Preview"
            className="w-40 h-auto rounded border shadow"
          />
          <p className="mt-2 text-green-700 font-semibold">
            Full body photo captured ✔
          </p>
        </div>
      )}
    </div>
  );
}
