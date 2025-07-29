import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const RegisterUser = () => {
  const webcamRef = useRef(null);
  const [of_fname, setFname] = useState('');
  const [of_lname, setLname] = useState('');
  const [of_role, setRole] = useState('DSWD');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      setStatus('Unable to capture photo from webcam.');
      return;
    }

    const blob = await fetch(screenshot).then(res => res.blob());
    const photoFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('of_fname', of_fname);
    formData.append('of_lname', of_lname);
    formData.append('of_role', of_role);
    formData.append('of_photo', photoFile);

    setLoading(true);
    setStatus('');
    setCredentials(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/social_worker/add-user/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setStatus('✅ Registration successful!');
      setCredentials({
        username: response.data.username,
        password: response.data.password, // Make sure backend returns this
        role: response.data.role
      });

      setFname('');
      setLname('');
      setRole('DSWD');
    } catch (err) {
      console.error(err);
      setStatus('❌ Registration failed. Please check the data or camera.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Register Official (Facial Recognition)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input type="text" value={of_fname} onChange={(e) => setFname(e.target.value)} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" value={of_lname} onChange={(e) => setLname(e.target.value)} required />
        </div>
        <div>
          <label>Role:</label>
          <select value={of_role} onChange={(e) => setRole(e.target.value)} required>
            <option value="DSWD">DSWD</option>
            <option value="VAWDesk">VAWDesk</option>
            <option value="Social Worker">Social Worker</option>
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: 'user'
            }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {status && <p style={{ marginTop: '15px' }}>{status}</p>}

      {credentials && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid green', background: '#eaffea' }}>
          <h4>Generated Credentials:</h4>
          <p><strong>Username:</strong> {credentials.username}</p>
          <p><strong>Password:</strong> {credentials.password}</p>
          <p><strong>Role:</strong> {credentials.role}</p>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
