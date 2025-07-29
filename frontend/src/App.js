import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DeskOfficerPage from './pages/desk_officer/DeskOfficerPage';
import RegisterUser from './pages/RegisterUser';
import DSWDPage from './pages/dswd/DSWDPage';
import DSWDProfile from './pages/dswd/DSWDProfile';

import UserForm from './pages/social_worker/UserForm';
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
        <Route path="/dswd" element={<DSWDPage />} />

        <Route path="/Dswd_profile" element={<DSWDProfile />} />
          {/* SOCIAL WORKER PAGES */}
         <Route path="/social_worker" element={<SidebarLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="user" element={<UserForm />} />
        </Route>
        
         
      </Routes>
    </Router>
  );
}
