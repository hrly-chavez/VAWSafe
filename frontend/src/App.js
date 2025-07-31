import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DeskOfficerPage from './pages/desk_officer/DeskOfficerPage';
import RegisterUser from './pages/RegisterUser';
import DSWDPage from './pages/dswd/DSWDPage';
import DSWDProfile from './pages/dswd/DSWDProfile';


import ManualLoginPage from './pages/ManualLoginPage';
import SidebarLayout from './pages/social_worker/SidebarLayout';
import DashboardPage from './pages/social_worker/Dashboard/Dashboard';
import CaseRecords from './pages/social_worker/CaseRecords/CaseRecords';
import Sessions from './pages/social_worker/Sessions/Sessions';
import Services from './pages/social_worker/Services/Services';
import Victims from './pages/social_worker/Victims/Victims';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN & REGISTER  PAGES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/manual" element={<ManualLoginPage />} />
        <Route path="/register" element={<RegisterUser />} />

        <Route path="/desk_officer" element={<DeskOfficerPage />} />

        {/* DSWD  PAGES */}
        <Route path="/dswd" element={<DSWDPage />} />
        <Route path="/Dswd_profile" element={<DSWDProfile />} />
        
          {/* SOCIAL WORKER PAGES */}
         <Route path="/social_worker" element={<SidebarLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="case-records" element={<CaseRecords />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="services" element={<Services />} />
          <Route path="victims" element={<Victims />} />
        </Route>
        
         
      </Routes>
    </Router>
  );
}
