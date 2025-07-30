import './nav-bar.css';
import { useEffect, useState } from 'react';
export default function Navbar () {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
        setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
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
    );
}