// import React, { useRef, useState } from 'react';
// import Webcam from 'react-webcam';
// import { useNavigate } from 'react-router-dom';
// import './dswd/css/DSWDPageCSS.css';
// import './LoginPage.css';
// import Navbar from './dswd/Navbar';

// const LoginPage = () => {
//   const webcamRef = useRef(null);
//   const navigate = useNavigate();
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [countdown, setCountdown] = useState(3);

//   const MAX_FRAMES = 10;
//   const INTERVAL = 200;

//   const base64ToBlob = (base64) => {
//     const byteString = atob(base64.split(',')[1]);
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: 'image/jpeg' });
//   };

//   const delay = (ms) => new Promise((res) => setTimeout(res, ms));

//   const captureBurstFrames = async () => {
//     const frames = [];
//     for (let i = 0; i < MAX_FRAMES; i++) {
//       const screenshot = webcamRef.current.getScreenshot();
//       if (screenshot) frames.push(screenshot);
//       await delay(INTERVAL);
//     }
//     return frames;
//   };

//   const handleFaceLogin = async () => {
//     setLoading(true);
//     setMessage('🧠 Preparing to detect blink... Look straight and be ready to blink.');

//     // Countdown
//     for (let i = 3; i > 0; i--) {
//       setCountdown(i);
//       await delay(1000);
//     }
//     setCountdown(null);
//     setMessage('📸 Capturing frames... Please blink now!');

//     const frames = await captureBurstFrames();

//     if (frames.length === 0) {
//       setMessage('❌ Failed to capture webcam images.');
//       setLoading(false);
//       return;
//     }

//     const formData = new FormData();
//     frames.forEach((frame, i) => {
//       const blob = base64ToBlob(frame);
//       formData.append(`frame${i + 1}`, blob, `frame${i + 1}.jpg`);
//     });

//     try {
//       const response = await fetch('http://localhost:8000/api/auth/face-login/', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
//       setLoading(false);
//       // inside the success branch after `const data = await response.json();
//       if (response.ok && data.match) {
//       // Migrate old key (just in case)
//       localStorage.removeItem("loggedInUser");
//       // Save with the unified key the sidebar uses
//       localStorage.setItem("vawsafeUser", JSON.stringify(data));

//       alert(`✅ Welcome, ${data.fname ?? data.name ?? ''} ${data.lname ?? ''} (${data.role})`);

//       const role = (data.role || '').toLowerCase();
//       if (role === "social worker") navigate("/social_worker/dashboard");
//       else if (role === "vawdesk") navigate("/desk_officer");
//       else if (role === "dswd") navigate("/dswd");
//     } else {
//       setMessage(data.message || data.suggestion || '❌ Face or liveness check failed.');
//     }
//     } catch (err) {
//       console.error(err);
//       setMessage('❌ Server error. Please try again.');
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="background-img">
//       <Navbar />
//       <div className="contents-wrapper">
//         <p className="intro">WELCOME TO VAWSAFE</p>

//         <div className="login-container">
//           <p className="login-instruction">Face Recognition with Blink Detection</p>

//           <Webcam
//             audio={false}
//             height={240}
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             width={320}
//             videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
//           />

//           {countdown !== null && <h3 style={{ color: '#ff5050', marginTop: '1rem' }}>Capturing in... {countdown}</h3>}

//           <button onClick={handleFaceLogin} className="login-btn" style={{ marginTop: '1rem', backgroundColor: '#6C63FF' }} disabled={loading}>
//             {loading ? 'Checking liveness...' : 'Login with Face'}
//           </button>

//           <button className="login-btn" onClick={() => navigate('/login/manual')}>Use Other Login</button>

//           <div className="opt-act">
//             <p onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Register New User</p>
//           </div>

//           {message && (
//             <p className={`status-message ${loading ? 'status-loading' : message.includes('✅') ? 'status-success' : message.includes('❌') ? 'status-fail' : ''}`}>
//               {message}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import Navbar from "./dswd/Navbar";

const LoginPage = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCounter, setShowCounter] = useState(false);

  const MAX_FRAMES = 10;
  const INTERVAL = 200;

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: "image/jpeg" });
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const captureBurstFrames = async () => {
    const frames = [];
    for (let i = 0; i < MAX_FRAMES; i++) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) frames.push(screenshot);
      await delay(INTERVAL);
    }
    return frames;
  };

  const handleFaceLogin = async () => {
    setShowCounter(true);
    setLoading(true);
    setMessage(
      "🧠 Preparing to detect blink... Look straight and be ready to blink."
    );
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await delay(1000);
    }
    setCountdown(null);
    setMessage("📸 Capturing frames... Please blink now!");

    const frames = await captureBurstFrames();
    if (frames.length === 0) {
      setMessage("❌ Failed to capture webcam images.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    frames.forEach((frame, i) => {
      const blob = base64ToBlob(frame);
      formData.append(`frame${i + 1}`, blob, `frame${i + 1}.jpg`);
    });

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/face-login/",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setLoading(false);

      if (response.ok && data.match) {
        localStorage.removeItem("loggedInUser");
        localStorage.setItem("vawsafeUser", JSON.stringify(data));
        alert(
          `✅ Welcome, ${data.fname ?? data.name ?? ""} ${data.lname ?? ""} (${
            data.role
          })`
        );

        const role = (data.role || "").toLowerCase();
        if (role === "social worker") navigate("/social_worker/dashboard");
        else if (role === "vawdesk") navigate("/desk_officer");
        else if (role === "dswd") navigate("/dswd");
      } else {
        setMessage(
          data.message || data.suggestion || "❌ Face or liveness check failed."
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please try again.");
      setLoading(false);
    }
  };

  const statusClass = loading
    ? "text-[#ffffff] animate-[blink_1s_infinite]"
    : message.includes("✅")
    ? "text-[#ffffff] animate-[pulseSuccess_1s_ease-in-out]"
    : message.includes("❌")
    ? "text-[#ffffff] animate-[shake_.5s_ease-in-out]"
    : "text-neutral-800";

  return (
    <div
      className="min-h-screen bg-[#eae7e6] bg-cover bg-center bg-no-repeat"
      name="background"
      style={{
        backgroundImage:
          "url(/assets/images/istockphoto-1017190202-612x612.jpg)",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      <div className="relative">
        <Navbar />

        <div
          className="flex items-center justify-center min-h-[calc(100vh-80px)]"
          name="outside-login-container"
        >
          <div className=" w-[70%]" name="login-container">
            <div
              className="grid grid-cols-2 h-[550px]"
              name="inside-login-container"
            >
              <div
                className="flex justify-center items-center h-full"
                name="left-side"
              >
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="h-[600px] w-[600px] rounded-[50px] object-cover"
                />
              </div>
              <div
                className="flex flex-col justify-center items-center px-3 py-10"
                name="right-side"
              >
                <h1 className="font-[Imbue] font-bold text-white text-6xl drop-shadow-xl">
                  WELCOME TO VAWSAFE
                </h1>

                {showCounter && countdown !== null && (
                  <h3
                    className="text-xl font-[Poppins] mt-10 text-white"
                    name="counter"
                  >
                    Capturing in... {countdown}
                  </h3>
                )}

                <button
                  onClick={handleFaceLogin}
                  disabled={loading}
                  className="mt-10 bg-white/20 rounded-[10px] py-[10px] px-[60px] shadow-lg text-white font-[Poppins] text-2xl font-bold
                    transform transition-transform duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                >
                  {loading ? "Checking liveness..." : "Login with Face"}
                </button>

                <button
                  onClick={() => navigate("/login/manual")}
                  className="mt-10 bg-white/20 rounded-[10px] py-[10px] px-[60px] shadow-lg text-white font-[Poppins] text-2xl font-bold
                    transform transition-transform duration-200 hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                >
                  Use Other Login
                </button>

                <div className="mt-3 flex justify-center">
                  <p
                    onClick={() => navigate("/register")}
                    className="mt-4 text-white font-medium shadow-lg text-md cursor-pointer hover:underline"
                  >
                    Register New User
                  </p>
                </div>

                {message && (
                  <p
                    className={`mt-4 text-center text-lg font-bold ${statusClass}`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
