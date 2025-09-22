// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";

// export default function Sidebar() {
//   const [user, setUser] = useState(null);
//   const { auth, logout } = useContext(AuthContext);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("vawsafeUser");
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         console.error("Failed to parse stored user data.");
//       }
//     }
//   }, []);

//   // Generate sidebar items based on role
//   const getSidebarItems = () => {
//     const role = user?.role?.toLowerCase();

//     if (role === "social worker") {
//       return [
//         { icon: '/images/dashboard.png', label: 'Dashboard', path: '/social_worker' },
//         { icon: '/images/edit.png', label: 'Case Records', path: '/social_worker/case-records' },
//         { icon: '/images/tools.png', label: 'Sessions', path: '/social_worker/sessions' },
//         { icon: '/images/high-value.png', label: 'Services', path: '/social_worker/services' },
//         { icon: '/images/hands.png', label: 'VAWC Victims', path: '/social_worker/victims' },
//       ];
//     }

//     if (role === "dswd") {
//       return [
//         { icon: "/images/dashboard.png", label: "Dashboard", path: "/dswd" },
//         { icon: "/images/hands.png", label: "VAWC Victims", path: "/dswd/victims" },
//         { icon: "/images/user.png", label: "Social Workers", path: "/dswd/social-workers" },
//         { icon: "/images/edit.png", label: "VAW Desk Officer", path: "/dswd/vawdesk-officer" },
//         { icon: "/images/high-value.png", label: "Services", path: "/dswd/services" },
//         { icon: "/images/tools.png", label: "Logout", path: "/login" },
//       ];
//     }

//     if (role === "vawdesk" || role === "desk officer") {
//       return [
//         { icon: "/images/dashboard.png", label: "Account Page", path: "/desk_officer" },
//         { icon: "/images/tools.png", label: "Register Victim", path: "/desk_officer/victim_facial" },
//         { icon: "/images/tools.png", label: "Ongoing Sessions", path: "/desk_officer" },
//         { icon: "/images/tools.png", label: "VAWC Victims", path: "/desk_officer/victims" },
//         { icon: "/images/tools.png", label: "Log Out", path: "/login" },
//       ];
//     }

//     // fallback if no user or role
//     return [];
//   };

//   const sidebarItems = getSidebarItems();

//   // Safe name + photo fallbacks
//   const displayName =
//     user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();
//   const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

//   return (
//     <aside
//       className="
//         h-screen w-[200px] shrink-0 overflow-hidden
//         bg-[#48486E] text-white
//         font-[Poppins]
//         sticky top-0
//       "
//     >
//       {/* Profile */}
//       <div
//         className="
//           flex flex-col items-center justify-center
//           px-2 py-3 text-center
//           border-b border-[#2C2C46]
//           shadow-[0_2px_0_rgba(0,0,0,0.2)]
//           mx-[10px]
//         "
//       >
//         <img
//           src={profilePhoto}
//           alt="Profile"
//           className="h-[100px] w-[100px] object-cover rounded-full"
//         />
//         <div
//           className="
//             mt-2 rounded-full
//             px-[15px] py-[5px]
//             bg-[rgba(244,58,250,0.7)]
//           "
//         >
//           <h1 className="text-[15px] leading-none">
//             {displayName || "DSWD OFFICER"}
//           </h1>
//         </div>
//       </div>

//       {/* Menu */}
//       <nav className="mt-2 text-base font-medium">
//         {sidebarItems.map((item, idx) => (
//           <Link key={idx} to={item.path} className="no-underline">
//             <div
//               className="
//                 flex items-center gap-[15px]
//                 px-5 py-2 cursor-pointer
//                 hover:bg-[#3F3F64] hover:shadow-lg
//                 transition-colors
//               "
//             >
//               <img
//                 src={item.icon}
//                 alt={item.label}
//                 className="h-[25px] w-[25px] object-contain"
//               />
//               <p className="m-0 font-normal">{item.label}</p>
//             </div>
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// }

// src/components/Sidebar.js
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { auth, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("vawsafeAuth"); // clear session
      window.location.href = "/login";        // redirect to login page
    }
  };



  // Load user from localStorage if auth context not available yet
  useEffect(() => {
    if (auth?.user) {
      setUser(auth.user);
    } else {
      const storedAuth = localStorage.getItem("vawsafeAuth");
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          setUser(parsed.user); // <-- make sure to grab the nested 'user'
        } catch {
          console.error("Failed to parse stored user data.");
        }
      }
    }
  }, [auth]);


  // Generate sidebar items based on role
  const getSidebarItems = () => {
    const role = user?.role?.toLowerCase();

    if (role === "social worker") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/social_worker" },
        { icon: "/images/heart.png", label: "VAWC Victims", path: "/social_worker/victims" },   
        { icon: "/images/case.png", label: "Case Records", path: "/social_worker/case-records" },
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/social_worker/sessions" },
        { icon: "/images/peace.png", label: "Services", path: "/social_worker/services" },
        { icon: "/images/logout.png", label: "Log Out", path: "/login", isLogout: true }
      ];
    }

    if (role === "dswd") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/dswd" },
        { icon: "/images/heart.png", label: "VAWC Victims", path: "/dswd/victims" },
        { icon: "/images/customer.png", label: "Social Workers", path: "/dswd/social-workers" },
        { icon: "/images/founder.png", label: "VAW Desk Officer", path: "/dswd/vawdesk-officer" },
        { icon: "/images/peace.png", label: "Services", path: "/dswd/services" },
        // { icon: "/images/account-settings.png", label: "Account Management", path: "/dswd/account-management" },
        { icon: "/images/account-settings.png", label: "Account Management", 
          children: [
            { label: "User Management", path: "/dswd/account-management"},
            { label: "Pending Account", path: "/dswd/account-management/pending"}
          ]
        },
        { icon: "/images/logout.png", label: "Log Out", path: "/login", isLogout: true }
      ];
    }

    if (role === "vawdesk" || role === "desk officer") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/desk_officer" },
        { icon: "/images/add.png", label: "Register Victim", path: "/desk_officer/register_victim" },
        { icon: "/images/heart.png", label: "VAWC Victims", path: "/desk_officer/victims" },
        { icon: "/images/customer.png", label: "Social Workers", path: "/desk_officer/social-workers" },
        { icon: "/images/peace.png", label: "Services", path: "/desk_officer/services" },
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/desk_officer/session" },
        { icon: "/images/case.png", label: "Case Records", path: "/desk_officer/case-records" },
        // {
        //   icon: "/images/account-settings.png",
        //   label: "Account Services",
        //   children: [
        //     { label: "User Management", path: "/desk_officer/account-management" },
        //     { label: "Pending Account", path: "/desk_officer/pending-account" }
        //   ]
        // },
        { icon: "/images/logout.png", label: "Log Out", path: "/login", isLogout: true }
      ];
    }

    return [];
  };

  const sidebarItems = getSidebarItems();

  const displayName = user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();
  const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

  return (
    <aside className="min-h-screen w-[220px] bg-[#2F2F4F] text-white font-poppins sticky top-[70px] shadow-lg z-10">
      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-[#1F1F35]">
        <img
          src={profilePhoto}
          alt="Profile"
          className="h-[90px] w-[90px] object-cover rounded-full shadow-md"
        />
        <div className="mt-3 text-center w-full px-2">
          <h1 className="text-sm font-bold text-white truncate uppercase">
            {displayName || "XYRON"}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {user?.role || "Desk Officer"}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 space-y-1 px-2 overflow-visible">
        {sidebarItems.map((item, idx) => {
          if (item.children) {
            return (
              <div key={idx} className="group">
                {/* Parent Item */}
                <button
                  onClick={() => setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md"
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                  />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <svg
                    className={`ml-auto h-4 w-4 transform transition-transform ${openDropdownIndex === idx ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dropdown Items */}
                {openDropdownIndex === idx && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((subItem, subIdx) => (
                      <Link key={subIdx} to={subItem.path} className="group block no-underline">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md">
                          <div className="h-[22px] w-[22px] flex items-center justify-center bg-[#44446A] rounded-full text-white text-xs font-bold">
                            {subItem.label.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white group-hover:text-white">
                            {subItem.label}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (item.isLogout) {
            return (
              <button
                key={idx}
                onClick={handleLogout}
                className="w-full text-left group block no-underline"
              >
                <div className="flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                  />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              </button>
            );
          }

          return (
            <Link key={idx} to={item.path} className="group block no-underline">
              <div className="flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                />
                <span className="text-sm font-medium text-white group-hover:text-white">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside >
  );
}
