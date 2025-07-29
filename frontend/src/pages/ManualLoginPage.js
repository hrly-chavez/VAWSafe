import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ManualLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleManualLogin = async () => {
    setMessage('Logging in...');

    try {
      const response = await fetch('http://localhost:8000/api/social_worker/manual-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.match) {
        setMessage(`Welcome, ${data.name} (${data.role})`);

        if (data.role === 'Social Worker') {
          navigate('/social_worker/dashboard');
        } else if (data.role === 'VAWDesk') {
          navigate('/desk_officer');
        } else if (data.role === 'DSWD') {
          navigate('/dswd');
        } else {
          setMessage('Unrecognized role. Cannot redirect.');
        }
      } else {
        setMessage(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again later.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manual Login</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Username:</label><br />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Password:</label><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={handleManualLogin}>Login</button>

      <p style={{ marginTop: '1rem' }}>{message}</p>
    </div>
  );
};

export default ManualLoginPage;
