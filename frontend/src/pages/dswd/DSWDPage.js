import './DSWDPageCSS.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

export default function DeskOfficerPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/Dswd_Dashboard');
  }
  return (
    <div className="background-img">
      <Navbar/>
      <div className="content-wrapper">
        <p className="intro">WELCOME TO VAWSAFE</p>

        <div className="login-container">
          <p className='login-instruction'>Please Sign in</p>

          <input type='text' placeholder='Email' className='email-ph'></input>
          <br />
          <input type='text' placeholder='Password' className='pass-ph'></input>
          <br />

          <div className='Checkbox'>
            <input type='checkbox'></input>
            <p>Remember me</p>
          </div>

          <button className="login-btn" onClick={handleLogin}>LOGIN</button>

          <div className="opt-act">
            <p>Forgot password</p>
            <p>Create Account</p>
          </div>
        </div>
      </div>

    </div>
  );
}