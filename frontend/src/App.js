import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DeskOfficerPage from './pages/desk_officer/DeskOfficerPage';
import SocialWorkerPage from './pages/social_worker/SocialWorkerPage';
import DSWDPage from './pages/dswd/DSWDPage';
import DSWDProfile from './pages/dswd/DSWDProfile';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/desk_officer" element={<DeskOfficerPage />} />

        <Route path="/social_worker" element={<SocialWorkerPage />} />
        
        <Route path="/dswd" element={<DSWDPage />} />

        <Route path="/Dswd_profile" element={<DSWDProfile />} />
         
      </Routes>
    </Router>
  );
}
