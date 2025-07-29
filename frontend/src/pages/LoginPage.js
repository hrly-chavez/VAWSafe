import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      if (response.ok && data.match) {
        setUser(data);
        setMessage(`✅ Welcome, ${data.fname} ${data.lname} (${data.role})`);

       // Role-based redirect
        const role = data.role.toLowerCase();

        if (role === 'social worker') {
          navigate('/social_worker/dashboard');
        } else if (data.role === 'VAWDesk') {
          navigate('/desk_officer');
        } else if (role === 'admin' || role === 'dswd') {
          navigate('/dswd');
        } else {
          setMessage('Unrecognized role. Cannot redirect.');
        }

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

      <button
        onClick={() => navigate('/login/manual')}
        style={{ marginLeft: '1rem', marginTop: '1rem' }}
      >
        Use Other Login
      </button>

      <button
        onClick={() => navigate('/register')}
        style={{ marginLeft: '1rem', marginTop: '1rem' }}
      >
        Register New User
      </button>

      <p style={{ marginTop: '1rem' }}>{message}</p>

      {user && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Official ID:</strong> {user.official_id}</p>
          <p><strong>Name:</strong> {user.fname} {user.lname}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
