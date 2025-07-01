import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DeskOfficerPage from './pages/desk_officer/DeskOfficerPage';
import SocialWorkerPage from './pages/social_worker/SocialWorkerPage';
import DSWDPage from './pages/dswd/DSWDPage';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/desk_officer" element={<DeskOfficerPage />} />
        <Route path="/social_worker" element={<SocialWorkerPage />} />
        <Route path="/dswd" element={<DSWDPage />} />
        
      </Routes>
    </Router>
  );
}
