import './SocialWorkerPageCSS.css';
import { useEffect, useState } from 'react';

export default function SocialWorkerPage() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-img">
      <div className="navbar">
        <div className="navbar-section left-section">
          <img src="/images/DSWD.webp" alt="DSWD" className="DSWD-img" />
          <img src="/images/iacat.jpg" alt="IACAT" className="iacat-img" />
          <img src="/images/iacvawc-logo.png" alt="IACVAWC" className="iacvawc-img" />
        </div>

        <div className="navbar-section center-section">
          <p className="title">VAWC Case Monitoring and Profiling System</p>
        </div>

        <div className="navbar-section right-section">
          <p className="date-time">
            {dateTime.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            | {dateTime.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <p className="intro">WELCOME TO VAWSAFE</p>

      <div className="login-container">
          <p className='login-instruction'>Please Sign in</p>

          <input type='text' placeholder='Email' className='email-ph'></input>
          <br/>
          <input type='text' placeholder='Password' className='pass-ph'></input>
          <br/>

          <div className='Checkbox'>
            <input type='checkbox'></input>
            <p>Remember me</p>
          </div>

          <button className="login-btn">LOGIN</button>

          <div className="opt-act">
            <p>Forgot password</p>
            <p>Create Account</p>
          </div>
      </div>
    </div>
  );
}
