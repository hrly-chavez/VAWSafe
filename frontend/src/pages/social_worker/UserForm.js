import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const UserForm = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

const capture = async () => {
  const screenshot = webcamRef.current.getScreenshot();

  if (!screenshot) {
    setMessage("Webcam image not captured.");
    return;
  }

  const blob = base64ToBlob(screenshot);
  const formData = new FormData();
  formData.append('name', name);
  formData.append('photo', blob, 'webcam.jpg');

  setMessage("Uploading...");
  try {
    const response = await fetch('http://localhost:8000/api/social_worker/add-user/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(`User ${data.name} added with image!`);
      setName('');
    } else {
      setMessage('Error uploading image.');
    }
  } catch (err) {
    console.error(err);
    setMessage('Server error.');
  }
};
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register Social Worker</h2>
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
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={capture}>Capture & Submit</button>
      <p>{message}</p>
    </div>
  );
};

export default UserForm;
