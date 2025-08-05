import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import './dswd/css/DSWDPageCSS.css';
// import './dswd/DSWDPageCSS.css';
import './LoginPage.css'; // NEW import 

import Navbar from './dswd/Navbar';

const LoginPage = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const MAX_FRAMES = 10;
  const INTERVAL = 200;

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
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
    setUser(null);
    setMessage('🧠 Preparing to detect blink... Look straight and be ready to blink naturally.');

    // Countdown before capture starts
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await delay(1000);
    }
    setCountdown(null);
    setMessage('📸 Capturing frames... Please blink now!');

    const frames = await captureBurstFrames();

    if (frames.length === 0) {
      setMessage('❌ Failed to capture webcam images.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    frames.forEach((frame, i) => {
      const blob = base64ToBlob(frame);
      formData.append(`frame${i + 1}`, blob, `frame${i + 1}.jpg`);
    });

    try {
      const response = await fetch('http://localhost:8000/api/social_worker/face-login/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.match) {
        const welcomeMsg = `✅ Welcome, ${data.fname} ${data.lname} (${data.role})`;
        alert(welcomeMsg);
        setUser(data);

        const role = data.role.toLowerCase();
        if (role === 'social worker') navigate('/social_worker/dashboard');
        else if (role === 'vawdesk') navigate('/desk_officer');
        else if (role === 'admin' || role === 'dswd') navigate('/dswd');
        else setMessage('Unrecognized role. Cannot redirect.');
      } else {
        setUser(null);
        setMessage(data.message || data.suggestion || '❌ Face or liveness check failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server error. Please try again.');
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    navigate('/login/manual');
  };

  return (
    <div className="background-img">
      <Navbar />
      <div className="content-wrapper">
        <p className="intro">WELCOME TO VAWSAFE</p>

        <div className="login-container">
          <p className="login-instruction">Face Recognition with Blink Detection</p>

          <Webcam
            audio={false}
            height={240}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: 'user'
            }}
          />

          {countdown !== null && (
            <h3 style={{ color: '#ff5050', marginTop: '1rem' }}>
              Capturing in... {countdown}
            </h3>
          )}

          <button
            onClick={handleFaceLogin}
            className="login-btn"
            style={{ marginTop: '1rem', backgroundColor: '#6C63FF' }}
            disabled={loading}
          >
            {loading ? 'Checking liveness...' : 'Login with Face'}
          </button>

          <button className="login-btn" onClick={handleManualLogin}>
            Use Other Login
          </button>

          <div className="opt-act">
            <p onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
              Register New User
            </p>
          </div>

          {message && (
            <p
              className={`status-message ${
                loading ? 'status-loading' :
                message.includes('✅') ? 'status-success' :
                message.includes('❌') ? 'status-fail' : ''
              }`}
            >
              {message}
            </p>
          )}

          {user && (
            <div style={{ marginTop: '1rem', fontSize: '14px' }}>
              <p><strong>Official ID:</strong> {user.official_id}</p>
              <p><strong>Name:</strong> {user.fname} {user.lname}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
