// import React, { Suspense, lazy } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { ROUTES } from "./routes/routes";

// // Login/Register Pages
// import LoginPage from "./pages/LoginPage";
// import RegisterUser from "./pages/RegisterUser";
// import ManualLoginPage from "./pages/ManualLoginPage";

// // Desk Officer Pages (lazy loaded)
// const DeskOfficerPage = lazy(() =>
//   import("./pages/desk_officer/DeskOfficer/DeskOfficerPage")
// );
// const VictimFacial = lazy(() =>
//   import("./pages/desk_officer/RegisterVictim/VictimFacial")
// );
// const RegisterVictim = lazy(() =>
//   import("./pages/desk_officer/RegisterVictim/RegisterVictim")
// );
// const Session = lazy(() => import("./pages/desk_officer/Session/Session"));
// const DOVictims = lazy(() => import("./pages/desk_officer/Victims/Victims"));
// const DOVictimDetail = lazy(() =>
//   import("./pages/desk_officer/Victims/VictimDetails")
// );
// const DOVictimSearch = lazy(() =>
//   import("./pages/desk_officer/Victims/SearchVictim")
// );

// // DSWD Pages (lazy loaded)
// const DSWDDashboard = lazy(() =>
//   import("./pages/dswd/Dashboard/DSWDDashboard")
// );
// const DSWDVAWCVictims = lazy(() =>
//   import("./pages/dswd/Victim/DSWDVAWCVictims")
// );
// const DSWDVictimDetail = lazy(() =>
//   import("./pages/dswd/Victim/VictimDetails")
// );
// const DSWDSearchVictim = lazy(() => import("./pages/dswd/Victim/SearchVictim"));
// const DSWDSocialWorkers = lazy(() =>
//   import("./pages/dswd/SocialWorker/DSWDSocialWorkers")
// );
// const DSWDSocialWorkerDetail = lazy(() =>
//   import("./pages/dswd/SocialWorker/SocialWorkerDetails")
// );
// const DSWD_VAWDESK_OFFICER = lazy(() =>
//   import("./pages/dswd/VawDeskOfficer/DSWDVawDeskOfficer")
// );
// const DSWDServices = lazy(() =>
//   import("./pages/dswd/ServiceDSWD/DSWDServices")
// );

// // Social Worker Pages (lazy loaded)
// // const SidebarLayout = lazy(() => import("./pages/social_worker/SidebarLayout"));
// // const SidebarLayout = lazy(() => import("./pages/Sidebar"));
// const DashboardPage = lazy(() =>
//   import("./pages/social_worker/Dashboard/Dashboard")
// );
// const CaseRecords = lazy(() =>
//   import("./pages/social_worker/CaseRecords/CaseRecords")
// );
// const Sessions = lazy(() => import("./pages/social_worker/Sessions/Sessions"));
// const Services = lazy(() => import("./pages/social_worker/Services/Services"));
// const Victims = lazy(() => import("./pages/social_worker/Victims/Victims"));
// const VictimDetailPage = lazy(() =>
//   import("./pages/social_worker/Victims/VictimDetailPage")
// );
// const SearchVictimFacial = lazy(() =>
//   import("./pages/social_worker/Victims/SearchVictimFacial")
// );

// export default function App() {
//   return (
//     <Router>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Routes>
//           {/* Default route: redirect to login */}
//           <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

//           {/* LOGIN & REGISTER PAGES */}
//           <Route path={ROUTES.LOGIN} element={<LoginPage />} />
//           <Route path={ROUTES.MANUAL_LOGIN} element={<ManualLoginPage />} />
//           <Route path={ROUTES.REGISTER} element={<RegisterUser />} />

//           {/* DESK OFFICER */}
//           <Route path={ROUTES.DESK_OFFICER} element={<DeskOfficerPage />} />
//           <Route
//             path={ROUTES.DESK_OFFICER_REGISTER_VICTIM}
//             element={<RegisterVictim />}
//           />
//           <Route
//             path={ROUTES.DESK_OFFICER_VICTIM_FACIAL}
//             element={<VictimFacial />}
//           />
//           <Route path={ROUTES.DESK_OFFICER_SESSION} element={<Session />} />

//           <Route path={ROUTES.DESK_OFFICER_VICTIMS} element={<DOVictims />} />
//           <Route
//             path={ROUTES.DESK_OFFICER_VICTIM_DETAIL}
//             element={<DOVictimDetail />}
//           />
//           <Route
//             path={ROUTES.DESK_OFFICER_VICTIM_SEARCH}
//             element={<DOVictimSearch />}
//           />

//           {/* DSWD */}
//           <Route path={ROUTES.DSWD} element={<DSWDDashboard />} />
//           <Route
//             path={ROUTES.DSWD_VAWC_VICTIMS}
//             element={<DSWDVAWCVictims />}
//           />
//           <Route
//             path={ROUTES.DSWD_VICTIM_DETAIL}
//             element={<DSWDVictimDetail />}
//           />
//           <Route
//             path={ROUTES.DSWD_SEARCH_VICTIM}
//             element={<DSWDSearchVictim />}
//           />
//           <Route
//             path={ROUTES.DSWD_SOCIAL_WORKERS}
//             element={<DSWDSocialWorkers />}
//           />
//           <Route
//             path={ROUTES.DSWD_SOCIAL_WORKERS_DETAILS}
//             element={<DSWDSocialWorkerDetail />}
//           />
//           <Route
//             path={ROUTES.DSWD_VAWDESK_OFFICER}
//             element={<DSWD_VAWDESK_OFFICER />}
//           />
//           <Route path={ROUTES.DSWD_SERVICES} element={<DSWDServices />} />

//           {/* SOCIAL WORKER (nested routes under sidebar layout)
//           <Route path={ROUTES.SOCIAL_WORKER} element={<SidebarLayout />}>
//             <Route
//               path={ROUTES.SOCIAL_WORKER_DASHBOARD}
//               element={<DashboardPage />}
//             />
//             <Route
//               path={ROUTES.SOCIAL_WORKER_CASE_RECORDS}
//               element={<CaseRecords />}
//             />
//             <Route
//               path={ROUTES.SOCIAL_WORKER_SESSIONS}
//               element={<Sessions />}
//             />
//             <Route
//               path={ROUTES.SOCIAL_WORKER_SERVICES}
//               element={<Services />}
//             />
//             <Route path={ROUTES.SOCIAL_WORKER_VICTIMS} element={<Victims />} />
//             <Route
//               path={ROUTES.SOCIAL_WORKER_VICTIM_DETAIL}
//               element={<VictimDetailPage />}
//             />
//             <Route
//               path={ROUTES.SOCIAL_WORKER_SEARCH_FACIAL}
//               element={<SearchVictimFacial />}
//             />
//           </Route> */}

//           {/* SOCIAL WORKER (no sidebar) */}
//           <Route
//             path={ROUTES.SOCIAL_WORKER_DASHBOARD}
//             element={<DashboardPage />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_CASE_RECORDS}
//             element={<CaseRecords />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_SESSIONS}
//             element={<Sessions />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_SERVICES}
//             element={<Services />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_VICTIMS} element={<Victims />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_VICTIM_DETAIL}
//             element={<VictimDetailPage />}
//           />
//           <Route
//             path={ROUTES.SOCIAL_WORKER_SEARCH_FACIAL}
//             element={<SearchVictimFacial />}
//           />


//           {/* Catch-all: if no route matches, redirect to login */}
//           <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
//         </Routes>
//       </Suspense>
//     </Router>
//   );
// }
















// import React, { Suspense, lazy } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { ROUTES } from "./routes/routes";
// import { AuthProvider } from "./context/AuthContext";
// import SidebarLayout from "./pages/Sidebar"; // ✅ Sidebar with dynamic role links

// // Login/Register Pages
// import LoginPage from "./pages/LoginPage";
// import RegisterUser from "./pages/RegisterUser";
// import ManualLoginPage from "./pages/ManualLoginPage";

// // Desk Officer Pages (lazy loaded)
// const DeskOfficerPage = lazy(() =>
//   import("./pages/desk_officer/DeskOfficer/DeskOfficerPage")
// );
// const VictimFacial = lazy(() =>
//   import("./pages/desk_officer/RegisterVictim/VictimFacial")
// );
// const RegisterVictim = lazy(() =>
//   import("./pages/desk_officer/RegisterVictim/RegisterVictim")
// );
// const Session = lazy(() => import("./pages/desk_officer/Session/Session"));
// const DOVictims = lazy(() => import("./pages/desk_officer/Victims/Victims"));
// const DOVictimDetail = lazy(() =>
//   import("./pages/desk_officer/Victims/VictimDetails")
// );
// const DOVictimSearch = lazy(() =>
//   import("./pages/desk_officer/Victims/SearchVictim")
// );

// // DSWD Pages (lazy loaded)
// const DSWDDashboard = lazy(() =>
//   import("./pages/dswd/Dashboard/DSWDDashboard")
// );
// const DSWDVAWCVictims = lazy(() =>
//   import("./pages/dswd/Victim/DSWDVAWCVictims")
// );
// const DSWDVictimDetail = lazy(() =>
//   import("./pages/dswd/Victim/VictimDetails")
// );
// const DSWDSearchVictim = lazy(() => import("./pages/dswd/Victim/SearchVictim"));
// const DSWDSocialWorkers = lazy(() =>
//   import("./pages/dswd/SocialWorker/DSWDSocialWorkers")
// );
// const DSWDSocialWorkerDetail = lazy(() =>
//   import("./pages/dswd/SocialWorker/SocialWorkerDetails")
// );
// const DSWD_VAWDESK_OFFICER = lazy(() =>
//   import("./pages/dswd/VawDeskOfficer/DSWDVawDeskOfficer")
// );
// const DSWDServices = lazy(() =>
//   import("./pages/dswd/ServiceDSWD/DSWDServices")
// );

// // Social Worker Pages (lazy loaded)
// const DashboardPage = lazy(() =>
//   import("./pages/social_worker/Dashboard/Dashboard")
// );
// const CaseRecords = lazy(() =>
//   import("./pages/social_worker/CaseRecords/CaseRecords")
// );
// const Sessions = lazy(() => import("./pages/social_worker/Sessions/Sessions"));
// const Services = lazy(() => import("./pages/social_worker/Services/Services"));
// const Victims = lazy(() => import("./pages/social_worker/Victims/Victims"));
// const VictimDetailPage = lazy(() =>
//   import("./pages/social_worker/Victims/VictimDetailPage")
// );
// const SearchVictimFacial = lazy(() =>
//   import("./pages/social_worker/Victims/SearchVictimFacial")
// );

// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Suspense fallback={<div>Loading...</div>}>
//           <Routes>
//             {/* Default route: redirect to login */}
//             <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

//             {/* LOGIN & REGISTER (no sidebar) */}
//             <Route path={ROUTES.LOGIN} element={<LoginPage />} />
//             <Route path={ROUTES.MANUAL_LOGIN} element={<ManualLoginPage />} />
//             <Route path={ROUTES.REGISTER} element={<RegisterUser />} />

//             {/* DESK OFFICER (with sidebar) */}
//             <Route element={<SidebarLayout />}>
//               <Route path={ROUTES.DESK_OFFICER} element={<DeskOfficerPage />} />
//               <Route
//                 path={ROUTES.DESK_OFFICER_REGISTER_VICTIM}
//                 element={<RegisterVictim />}
//               />
//               <Route
//                 path={ROUTES.DESK_OFFICER_VICTIM_FACIAL}
//                 element={<VictimFacial />}
//               />
//               <Route
//                 path={ROUTES.DESK_OFFICER_SESSION}
//                 element={<Session />}
//               />
//               <Route
//                 path={ROUTES.DESK_OFFICER_VICTIMS}
//                 element={<DOVictims />}
//               />
//               <Route
//                 path={ROUTES.DESK_OFFICER_VICTIM_DETAIL}
//                 element={<DOVictimDetail />}
//               />
//               <Route
//                 path={ROUTES.DESK_OFFICER_VICTIM_SEARCH}
//                 element={<DOVictimSearch />}
//               />

//               {/* DSWD (with sidebar) */}
//               <Route path={ROUTES.DSWD} element={<DSWDDashboard />} />
//               <Route
//                 path={ROUTES.DSWD_VAWC_VICTIMS}
//                 element={<DSWDVAWCVictims />}
//               />
//               <Route
//                 path={ROUTES.DSWD_VICTIM_DETAIL}
//                 element={<DSWDVictimDetail />}
//               />
//               <Route
//                 path={ROUTES.DSWD_SEARCH_VICTIM}
//                 element={<DSWDSearchVictim />}
//               />
//               <Route
//                 path={ROUTES.DSWD_SOCIAL_WORKERS}
//                 element={<DSWDSocialWorkers />}
//               />
//               <Route
//                 path={ROUTES.DSWD_SOCIAL_WORKERS_DETAILS}
//                 element={<DSWDSocialWorkerDetail />}
//               />
//               <Route
//                 path={ROUTES.DSWD_VAWDESK_OFFICER}
//                 element={<DSWD_VAWDESK_OFFICER />}
//               />
//               <Route
//                 path={ROUTES.DSWD_SERVICES}
//                 element={<DSWDServices />}
//               />

//               {/* SOCIAL WORKER (with sidebar) */}
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_DASHBOARD}
//                 element={<DashboardPage />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_CASE_RECORDS}
//                 element={<CaseRecords />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_SESSIONS}
//                 element={<Sessions />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_SERVICES}
//                 element={<Services />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_VICTIMS}
//                 element={<Victims />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_VICTIM_DETAIL}
//                 element={<VictimDetailPage />}
//               />
//               <Route
//                 path={ROUTES.SOCIAL_WORKER_SEARCH_FACIAL}
//                 element={<SearchVictimFacial />}
//               />
//             </Route>

//             {/* Catch-all: if no route matches, redirect to login */}
//             <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
//           </Routes>
//         </Suspense>
//       </Router>
//     </AuthProvider>
//   );
// }


// src/App.js  (update as shown below)
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./layout/SidebarLayout";
import Unauthorized from "./pages/Unauthorized";
// import pages (same as you have)
import LoginPage from "./pages/LoginPage";
import RegisterUser from "./pages/RegisterUser";
import ManualLoginPage from "./pages/ManualLoginPage";

//Desk officer
const DeskOfficerPage = lazy(() => import("./pages/desk_officer/DeskOfficer/DeskOfficerPage"));
const VictimFacial = lazy(() =>
  import("./pages/desk_officer/RegisterVictim/VictimFacial")
);
const RegisterVictim = lazy(() =>
  import("./pages/desk_officer/RegisterVictim/RegisterVictim")
);
const Session = lazy(() => import("./pages/desk_officer/Session/Session"));

const DOVictims = lazy(() => import("./pages/desk_officer/Victims/Victims"));
const DOVictimDetail = lazy(() =>
  import("./pages/desk_officer/Victims/VictimDetails")
);
const DOVictimSearch = lazy(() =>
  import("./pages/desk_officer/Victims/SearchVictim")
);
const DOTest = lazy(() => import("./pages/desk_officer/Test"));

// Social Worker Pages (lazy loaded)
const SidebarLayout = lazy(() => import("./pages/social_worker/SidebarLayout"));
const DashboardPage = lazy(() =>
  import("./pages/social_worker/Dashboard/Dashboard")
);
const CaseRecords = lazy(() =>
  import("./pages/social_worker/CaseRecords/CaseRecords")
);
const Sessions = lazy(() => import("./pages/social_worker/Sessions/Sessions"));
const Services = lazy(() => import("./pages/social_worker/Services/Services"));
const Victims = lazy(() => import("./pages/social_worker/Victims/Victims"));
const VictimDetailPage = lazy(() =>
  import("./pages/social_worker/Victims/VictimDetailPage")
);
const SearchVictimFacial = lazy(() =>
  import("./pages/social_worker/Victims/SearchVictimFacial")
);

//DSWD
const DSWDDashboard = lazy(() => import("./pages/dswd/Dashboard/DSWDDashboard"));
const DSWDVAWCVictims = lazy(() =>
  import("./pages/dswd/Victim/DSWDVAWCVictims")
);
const DSWDVictimDetail = lazy(() =>
  import("./pages/dswd/Victim/VictimDetails")
);
const DSWDSearchVictim = lazy(() => import("./pages/dswd/Victim/SearchVictim"));
const DSWDSocialWorkers = lazy(() =>
  import("./pages/dswd/SocialWorker/DSWDSocialWorkers")
);
const DSWDSocialWorkerDetail = lazy(() =>
  import("./pages/dswd/SocialWorker/SocialWorkerDetails")
);
const DSWD_VAWDESK_OFFICER = lazy(() =>
  import("./pages/dswd/VawDeskOfficer/DSWDVawDeskOfficer")
);
const DSWD_VAWDESK_OFFICER_Detail = lazy(() => 
  import("./pages/dswd/VawDeskOfficer/VAWDeskOfficerDetail")
);
const DSWDServices = lazy(() =>
  import("./pages/dswd/ServiceDSWD/DSWDServices")
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

            {/* Public routes */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.MANUAL_LOGIN} element={<ManualLoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterUser />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* DESK OFFICER group (Sidebar + protected) */}
            <Route
              element={
                <ProtectedRoute roles={["VAWDesk"]}>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.DESK_OFFICER} element={<DeskOfficerPage />} />
              <Route path={ROUTES.DESK_OFFICER_REGISTER_VICTIM} element={<RegisterVictim />} />
              <Route path={ROUTES.DESK_OFFICER_VICTIM_FACIAL} element={<VictimFacial />} />
              <Route path={ROUTES.DESK_OFFICER_SESSION} element={<Session />} />
              <Route path={ROUTES.DESK_OFFICER_VICTIMS} element={<DOVictims />} />
              <Route path={ROUTES.DESK_OFFICER_VICTIM_DETAIL} element={<DOVictimDetail />} />
              <Route path={ROUTES.DESK_OFFICER_VICTIM_SEARCH} element={<DOVictimSearch />} />
            </Route>

            {/* DSWD group */}
            <Route
              element={
                <ProtectedRoute roles={["DSWD"]}>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.DSWD} element={<DSWDDashboard />} />
              <Route path={ROUTES.DSWD_VAWC_VICTIMS} element={<DSWDVAWCVictims/>} />
              <Route path={ROUTES.DSWD_VICTIM_DETAIL} element={<DSWDVictimDetail/>} />
              <Route path={ROUTES.DSWD_SEARCH_VICTIM} element={<DSWDSearchVictim/>} />
              <Route path={ROUTES.DSWD_SOCIAL_WORKERS} element={<DSWDSocialWorkers/>} />
              <Route path={ROUTES.DSWD_SOCIAL_WORKERS_DETAILS} element={<DSWDSocialWorkerDetail/>} />
              <Route path={ROUTES.DSWD_VAWDESK_OFFICER} element={<DSWD_VAWDESK_OFFICER/>} />
              <Route path={ROUTES.DSWD_VAWDESK_OFFICER_DETAILS} element={<DSWD_VAWDESK_OFFICER_Detail />} />
              <Route path={ROUTES.DSWD_SERVICES} element={<DSWDServices/>} />
            </Route>

            {/* SOCIAL WORKER group */}
            <Route
              element={
                <ProtectedRoute roles={["Social Worker"]}>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.SOCIAL_WORKER_DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.SOCIAL_WORKER_CASE_RECORDS} element={<CaseRecords />} />
              <Route path={ROUTES.SOCIAL_WORKER_SESSIONS} element={<Sessions />} />
              <Route path={ROUTES.SOCIAL_WORKER_SERVICES} element={<Services />} />
              <Route path={ROUTES.SOCIAL_WORKER_VICTIMS} element={<Victims />} />
              <Route path={ROUTES.SOCIAL_WORKER_VICTIM_DETAIL} element={<VictimDetailPage />} />
              <Route path={ROUTES.SOCIAL_WORKER_SEARCH_FACIAL} element={<SearchVictimFacial />} />
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
