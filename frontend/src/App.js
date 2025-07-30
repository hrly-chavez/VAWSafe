import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DeskOfficerPage from './pages/desk_officer/DeskOfficerPage';
import RegisterUser from './pages/RegisterUser';

//DSWD
import DSWDDashboard from './pages/dswd/DSWDDashboard';
import DSWDVAWCVictims from './pages/dswd/DSWDVAWCVictims';
import DSWDSocialWorkers from './pages/dswd/DSWDSocialWorkers';
import DSWDCaseRecord from './pages/dswd/DSWDCaseRecord';
import DSWDServices from './pages/dswd/DSWDServices';
import DSWDNotification from './pages/dswd/DSWDNotification';
import DSWDFileMaintenance from './pages/dswd/DSWDFileMaintenance';


import ManualLoginPage from './pages/ManualLoginPage';
import SidebarLayout from './pages/social_worker/SidebarLayout';
import DashboardPage from './pages/social_worker/DashboardPage';
import ProfilePage from './pages/social_worker/ProfilePage';
import CasesPage from './pages/social_worker/CasesPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* LOGIN & REGISTER  PAGES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/manual" element={<ManualLoginPage />} />
        <Route path="/register" element={<RegisterUser />} />

        <Route path="/desk_officer" element={<DeskOfficerPage />} />

        {/* DSWD Page */}
        {/* <Route path="/dswd" element={<DSWDPage />} /> */}
        <Route path="/dswd" element={<DSWDDashboard />} />
        <Route path="/Dswd_vawc_victims" element={<DSWDVAWCVictims />} />
        <Route path="/Dswd_social_workers" element={<DSWDSocialWorkers />} />
        <Route path="/Dswd_case_records" element={<DSWDCaseRecord />} />
        <Route path="/Dswd_services" element={<DSWDServices />} />
        <Route path="/Dswd_notification" element={<DSWDNotification />} />
        <Route path="/Dswd_file_maintenance" element={<DSWDFileMaintenance />} />


          {/* SOCIAL WORKER PAGES */}
         <Route path="/social_worker" element={<SidebarLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cases" element={<CasesPage />} />
          
        </Route>
        
         
      </Routes>
    </Router>
  );
}
