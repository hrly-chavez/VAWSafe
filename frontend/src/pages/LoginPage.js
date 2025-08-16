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

  const MAX_FRAMES = 10;
  const INTERVAL = 200;

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
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
    setLoading(true);
    setMessage("🧠 Preparing to detect blink... Look straight and be ready to blink.");
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
      const response = await fetch("http://localhost:8000/api/auth/face-login/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setLoading(false);

      if (response.ok && data.match) {
        localStorage.removeItem("loggedInUser");
        localStorage.setItem("vawsafeUser", JSON.stringify(data));
        alert(`✅ Welcome, ${data.fname ?? data.name ?? ""} ${data.lname ?? ""} (${data.role})`);

        const role = (data.role || "").toLowerCase();
        if (role === "social worker") navigate("/social_worker/dashboard");
        else if (role === "vawdesk") navigate("/desk_officer");
        else if (role === "dswd") navigate("/dswd");
      } else {
        setMessage(data.message || data.suggestion || "❌ Face or liveness check failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please try again.");
      setLoading(false);
    }
  };

  const statusClass =
    loading
      ? "text-[#007bff] animate-[blink_1s_infinite]"
      : message.includes("✅")
      ? "text-[#28a745] animate-[pulseSuccess_1s_ease-in-out]"
      : message.includes("❌")
      ? "text-[#dc3545] animate-[shake_.5s_ease-in-out]"
      : "text-neutral-800";

  return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/assets/images/16Days-Action-banner.webp)" }}
      >


      {/* keyframes for custom animations */}
      <style>{`
        @keyframes blink { 50% { opacity: 0.3; } }
        @keyframes pulseSuccess {
          0% { transform: scale(0.95); opacity: 0.7; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <Navbar />

      <div className="flex flex-col items-center gap-5 p-4 mt-2">
        <p className="font-[Imbue] text-[clamp(40px,10vw,120px)] leading-none font-semibold text-[#3A2B1E] text-center m-0 opacity-70 drop-shadow">
          WELCOME TO VAWSAFE
        </p>

        <div className="w-[400px] p-8 rounded-[10px] font-[Poppins] bg-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <p className="m-0 mb-3 text-left font-medium text-[16px] text-[#333] border-b border-[#333] shadow-[0_5px_5px_rgba(0,0,0,0.1)]">
            Face Recognition with Blink Detection
          </p>

          <div className="flex justify-center">
            <Webcam
              audio={false}
              height={240}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
              className="rounded-md shadow"
            />
          </div>

          {countdown !== null && (
            <h3 className="text-[#ff5050] mt-4 text-center">Capturing in... {countdown}</h3>
          )}

          <button
            onClick={handleFaceLogin}
            disabled={loading}
            className="mt-4 w-full h-[50px] rounded-[10px] border border-white bg-gradient-to-r from-[#9c9ef1] to-[#7B6BF4] text-white font-bold cursor-pointer transition hover:from-[#7B6BF4] hover:to-[#9c9ef1] disabled:opacity-60"
          >
            {loading ? "Checking liveness..." : "Login with Face"}
          </button>

          <button
            onClick={() => navigate('/login/manual')}
            className="mt-3 w-full h-[50px] rounded-[10px] border border-white bg-gradient-to-r from-[#9c9ef1] to-[#7B6BF4] text-white font-bold cursor-pointer transition hover:from-[#7B6BF4] hover:to-[#9c9ef1]"
          >
            Use Other Login
          </button>

          <div className="mt-3 flex justify-center">
            <p onClick={() => navigate('/register')} className="text-[#2793FF] text-xs cursor-pointer hover:underline">
              Register New User
            </p>
          </div>

          {message && <p className={`mt-4 text-center text-sm font-bold ${statusClass}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

