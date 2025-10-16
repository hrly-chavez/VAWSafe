// src/App.js
import React, { Suspense, lazy } from "react";
import {BrowserRouter as Router,Routes,Route,Navigate,} from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./layout/SidebarLayout";
import Unauthorized from "./pages/Unauthorized";
// import pages (same as you have)
import LoginPage from "./pages/LoginPage";
import RegisterUser from "./pages/RegisterUser";
import ManualLoginPage from "./pages/ManualLoginPage";
import ResetPasswordPage from "./pages/ResetPassword";


//Landing Page
const LandingLayout = lazy(() => 
  import("./pages/landing/LandingLayout")
);

//Desk officer
const BPOApplication = lazy(() =>import("./pages/desk_officer/RegisterVictim/BPOApplication"));
const DeskOfficerPage = lazy(() =>import("./pages/desk_officer/DeskOfficer/Dashboard"));
const VictimFacial = lazy(() =>import("./pages/desk_officer/RegisterVictim/VictimFacial"));
const RegisterVictim = lazy(() =>import("./pages/desk_officer/RegisterVictim/RegisterVictim"));
const Session = lazy(() => import("./pages/desk_officer/Session/Session"));
const StartSession = lazy(() =>import("./pages/desk_officer/Session/StartSession"));
const DOVictims = lazy(() => import("./pages/desk_officer/Victims/Victims"));
const DOVictimDetail = lazy(() =>import("./pages/desk_officer/Victims/VictimDetails"));
const DOVictimSearch = lazy(() =>import("./pages/desk_officer/Victims/SearchVictim"));
const DOSocialWorkers = lazy(() =>import("./pages/desk_officer/SocialWorker/SocialWorker"));
const DOServices = lazy(() => import("./pages/desk_officer/Services/Services"));
const DOCaseRecords = lazy(() =>import("./pages/desk_officer/CaseRecords/CaseRecords"));
// const DOAccountManagement = lazy(() =>import("./pages/desk_officer/AccountManage/AccountManagement"));
// const DOPendingAccount = lazy(() =>import("./pages/desk_officer/AccountManage/PendingAccount"));
// const ViewOfficials = lazy(() => import("./pages/desk_officer/AccountManage/ViewOfficials"));

// Social Worker Pages (lazy loaded)
const DashboardPage = lazy(() =>import("./pages/social_worker/Dashboard/Dashboard"));
const CaseRecords = lazy(() =>import("./pages/social_worker/CaseRecords/CaseRecords"));
const Sessions = lazy(() => import("./pages/social_worker/Sessions/Sessions"));
const Services = lazy(() => import("./pages/social_worker/Services/Services"));
const Victims = lazy(() => import("./pages/social_worker/Victims/Victims"));
const VictimDetailPage = lazy(() =>import("./pages/social_worker/Victims/VictimDetailPage"));
const SearchVictimFacial = lazy(() =>import("./pages/social_worker/Victims/SearchVictimFacial"));
const ViewSessions = lazy(() =>import("./pages/social_worker/Sessions/ViewSessions"));
const SocialWorkerStartSession = lazy(() =>import("./pages/social_worker/Sessions/StartSession"));
const Schedule = lazy(() => import("./pages/social_worker/Schedule/Schedule"));

//DSWD
const DSWDDashboard = lazy(() =>import("./pages/dswd/Dashboard/DSWDDashboard"));
const DSWDVAWCVictims = lazy(() =>import("./pages/dswd/Victim/DSWDVAWCVictims"));
const DSWDVictimDetail = lazy(() =>import("./pages/dswd/Victim/VictimDetails"));
const DSWDSearchVictim = lazy(() => import("./pages/dswd/Victim/SearchVictim"));
const DSWDViewOfficials = lazy(() =>import("./pages/dswd/AccountManagement/ViewOfficials"));
const DSWDPendingAccount = lazy(() =>import("./pages/dswd/AccountManagement/PendingAccount"));
const DSWDSocialWorkers = lazy(() =>import("./pages/dswd/SocialWorker/DSWDSocialWorkers"));
const DSWDSocialWorkerDetail = lazy(() =>import("./pages/dswd/SocialWorker/SocialWorkerDetails"));
const DSWD_VAWDESK_OFFICER = lazy(() =>import("./pages/dswd/VawDeskOfficer/DSWDVawDeskOfficer"));
const DSWD_VAWDESK_OFFICER_Detail = lazy(() =>import("./pages/dswd/VawDeskOfficer/VAWDeskOfficerDetail"));
const DSWDServices = lazy(() =>import("./pages/dswd/ServiceDSWD/DSWDServices"));
const DSWDAccountManagement = lazy(() =>import("./pages/dswd/AccountManagement/DSWDAccountManagement"));
const DSWDQuestions = lazy(() => import("./pages/dswd/Questions/Questions"));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.LANDING} replace />} />

            {/* Public routes */}
            <Route path={ROUTES.LANDING + "/*"} element={<LandingLayout />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.MANUAL_LOGIN} element={<ManualLoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterUser />} />
            <Route path={ROUTES.RESET_PASSWORD}element={<ResetPasswordPage />}/>
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* DESK OFFICER group (Sidebar + protected) */}
            <Route
              element={
                <ProtectedRoute roles={["VAWDesk"]}>
                  <SidebarLayout />
                </ProtectedRoute>}>
              <Route path={ROUTES.DESK_OFFICER} element={<DeskOfficerPage />} />
              <Route path={ROUTES.DESK_OFFICER_REGISTER_VICTIM}element={<RegisterVictim />}/>
              <Route path={ROUTES.DESK_OFFICER_BPO_APPLICATION}element={<BPOApplication />}/>
              <Route path={ROUTES.DESK_OFFICER_VICTIM_FACIAL}element={<VictimFacial />}/>
              <Route path={ROUTES.DESK_OFFICER_SESSION} element={<Session />} />
              <Route path={ROUTES.DESK_OFFICER_VICTIMS}element={<DOVictims />}/>
              <Route path={ROUTES.DESK_OFFICER_VICTIM_DETAIL}element={<DOVictimDetail />}/>
              <Route path={ROUTES.DESK_OFFICER_VICTIM_SEARCH}element={<DOVictimSearch />}/>
              <Route path={ROUTES.DESK_OFFICER_START_SESSION}element={<StartSession />}/>
              <Route path={ROUTES.DESK_OFFICER_SOCIAL_WORKERS}element={<DOSocialWorkers />}/>
              <Route path={ROUTES.DESK_OFFICER_SERVICES} element={<DOServices />}/>
              {/* <Route path={ROUTES.DESK_OFFICER_CASE_RECORDS}element={<DOCaseRecords />}/>
              <Route path={ROUTES.DESK_OFFICER_ACCOUNT_MANAGEMENT}element={<DOAccountManagement />}/>
              <Route path={ROUTES.DESK_OFFICER_VIEW_OFFICIAL} element={<ViewOfficials />} /> */}
            </Route>

            {/* DSWD group */}
            <Route element={
                <ProtectedRoute roles={["DSWD"]}>
                  <SidebarLayout />
                </ProtectedRoute>}>
              <Route path={ROUTES.DSWD} element={<DSWDDashboard />} />
              <Route path={ROUTES.DSWD_VAWC_VICTIMS} element={<DSWDVAWCVictims />}/>
              <Route path={ROUTES.DSWD_VICTIM_DETAIL}element={<DSWDVictimDetail />}/>
              <Route path={ROUTES.DSWD_SEARCH_VICTIM}element={<DSWDSearchVictim />}/>
              <Route path={ROUTES.DSWD_SOCIAL_WORKERS} element={<DSWDSocialWorkers />}/>
              <Route path={ROUTES.DSWD_SOCIAL_WORKERS_DETAILS}element={<DSWDSocialWorkerDetail />}/>
              <Route path={ROUTES.DSWD_VAWDESK_OFFICER}element={<DSWD_VAWDESK_OFFICER />}/>
              <Route path={ROUTES.DSWD_VAWDESK_OFFICER_DETAILS}element={<DSWD_VAWDESK_OFFICER_Detail />}/>
              <Route path={ROUTES.DSWD_SERVICES} element={<DSWDServices />} />
              <Route path={ROUTES.DSWD_ACCOUNT_MANAGEMENT}element={<DSWDAccountManagement />}/>
              <Route path={ROUTES.DSWD_QUESTIONS} element={<DSWDQuestions />} />
              <Route path={ROUTES.DSWD_VIEW_OFFICIALS} element={<DSWDViewOfficials />} />
              <Route path={ROUTES.DSWD_PENDING_ACCOUNT} element={<DSWDPendingAccount />}/>
            </Route>

            {/* SOCIAL WORKER group */}
            <Route element={<ProtectedRoute roles={["Social Worker"]}>
                  <SidebarLayout />
                </ProtectedRoute>}>
              <Route path={ROUTES.SOCIAL_WORKER_DASHBOARD} element={<DashboardPage />}/>
              <Route path={ROUTES.SOCIAL_WORKER_CASE_RECORDS} element={<CaseRecords />}/>
              <Route path={ROUTES.SOCIAL_WORKER_SESSIONS} element={<Sessions />}/>
              <Route path={ROUTES.SOCIAL_WORKER_SERVICES} element={<Services />}/>
              <Route path={ROUTES.SOCIAL_WORKER_VICTIMS}element={<Victims />}/>
              <Route path={ROUTES.SOCIAL_WORKER_VICTIM_DETAIL}element={<VictimDetailPage />}/>
              <Route path={ROUTES.SOCIAL_WORKER_SEARCH_FACIAL}element={<SearchVictimFacial />}/>
              <Route path={ROUTES.SOCIAL_WORKER_VIEW_SESSION}element={<ViewSessions />}/>
              <Route path={ROUTES.SOCIAL_WORKER_START_SESSION}element={<SocialWorkerStartSession />}/>
              <Route path={ROUTES.SOCIAL_WORKER_SCHEDULE} element={<Schedule />} />

            </Route>

            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
