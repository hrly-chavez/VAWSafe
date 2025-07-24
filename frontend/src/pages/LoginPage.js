import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const LoginPage = () => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  const handleLogin = async () => {
    const screenshot = webcamRef.current.getScreenshot();

    if (!screenshot) {
      setMessage("Webcam image not captured.");
      return;
    }

    const blob = base64ToBlob(screenshot);
    const formData = new FormData();
    formData.append('photo', blob, 'webcam.jpg');

    setLoading(true);
    setMessage("Verifying face...");

    try {
      const response = await fetch('http://localhost:8000/api/social_worker/face-login/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setUser(data);
        setMessage(`Welcome, ${data.name}!`);
      } else {
        setUser(null);
        setMessage(data.message || 'Face not recognized.');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessage('Server error. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login via Face Recognition</h2>
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
      <button onClick={handleLogin} style={{ marginTop: '1rem' }} disabled={loading}>
        {loading ? 'Logging in...' : 'Login with Face'}
      </button>
      <p>{message}</p>
      {user && <p>User ID: {user.user_id}</p>}
    </div>
  );
};

export default LoginPage;
