// import { Link } from 'react-router-dom';
// import './css/sidebarCSS.css';

// export default function Sidebar() {
//   const sidebarItems = [
//     { icon: "/images/dashboard.png", label: "Dashboard", path: "/dswd" },
//     {
//       icon: "/images/hands.png",
//       label: "VAWC Victims",
//       path: "/Dswd_vawc_victims",
//     },
//     {
//       icon: "/images/user.png",
//       label: "Social Workers",
//       path: "/Dswd_social_workers",
//     },
//     {
//       icon: "/images/edit.png",
//       label: "Case Records",
//       path: "/Dswd_case_records",
//     },
//     {
//       icon: "/images/high-value.png",
//       label: "Services",
//       path: "/Dswd_services",
//     },
//     {
//       icon: "/images/bell.png",
//       label: "Notification",
//       path: "/Dswd_notification",
//     },
//     {
//       icon: "/images/tools.png",
//       label: "File Maintenance",
//       path: "/Dswd_file_maintenance",
//     },
//   ];

//   return (
//     <div className="sidebar">
//       <div className="profile">
//         <img src="/images/bussiness-man.png" className="pfp"></img>
//         <div className="profile-title-container">
//           <h1 className="profile-title">DSWD OFFICER</h1>
//         </div>
//       </div>

//       <div className="choices">
//         {sidebarItems.map((item, index) => (
//           <Link
//             to={item.path}
//             key={index}
//             style={{ textDecoration: "none", color: "inherit" }}
//           >
//             <div className="row">
//               <img
//                 src={item.icon}
//                 className="dashboard-icons"
//                 alt={item.label}
//               />
//               <p>{item.label}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import "./css/sidebarCSS.css";

// export default function Sidebar() {
//   const [user, setUser] = useState(null);

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

//   const sidebarItems = [
//     { icon: "/images/dashboard.png", label: "Dashboard", path: "/dswd" },
//     {
//       icon: "/images/hands.png",
//       label: "VAWC Victims",
//       path: "/Dswd_vawc_victims",
//     },
//     {
//       icon: "/images/user.png",
//       label: "Social Workers",
//       path: "/Dswd_social_workers",
//     },
//     {
//       icon: "/images/edit.png",
//       label: "Case Records",
//       path: "/Dswd_case_records",
//     },
//     {
//       icon: "/images/high-value.png",
//       label: "Services",
//       path: "/Dswd_services",
//     },
//     {
//       icon: "/images/bell.png",
//       label: "Notification",
//       path: "/Dswd_notification",
//     },
//     {
//       icon: "/images/tools.png",
//       label: "File Maintenance",
//       path: "/Dswd_file_maintenance",
//     },
//   ];

//   // Safe name fallback
//   const displayName = user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();

//   // Safe profile photo fallback
//   const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

//   return (
//     <div className="sidebar">
//       <div className="profile">
//         <img src={profilePhoto} className="pfp" alt="Profile" />
//         <div className="profile-title-container">
//           <h1 className="profile-title">{displayName || "DSWD OFFICER"}</h1>
//         </div>
//       </div>

//       <div className="choices">
//         {sidebarItems.map((item, index) => (
//           <Link
//             to={item.path}
//             key={index}
//             style={{ textDecoration: "none", color: "inherit" }}
//           >
//             <div className="row">
//               <img
//                 src={item.icon}
//                 className="dashboard-icons"
//                 alt={item.label}
//               />
//               <p>{item.label}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("vawsafeUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Failed to parse stored user data.");
      }
    }
  }, []);

  const sidebarItems = [
    { icon: "/images/dashboard.png", label: "Dashboard", path: "/dswd" },
    { icon: "/images/hands.png", label: "VAWC Victims", path: "/dswd/victims" },
    {
      icon: "/images/user.png",
      label: "Social Workers",
      path: "/dswd/social-workers",
    },
    {
      icon: "/images/edit.png",
      label: "VAW Desk Officer",
      path: "/dswd/vawdesk-officer",
    },
    {
      icon: "/images/high-value.png",
      label: "Services",
      path: "/dswd/services",
    },
    { icon: "/images/tools.png", label: "Logout", path: "/login" },
  ];

  // Safe name + photo fallbacks
  const displayName =
    user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();
  const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

  return (
    <aside
      className="
        h-screen w-[200px] shrink-0 overflow-hidden
        bg-[#48486E] text-white
        font-[Poppins]
        sticky top-0
      "
    >
      {/* Profile */}
      <div
        className="
          flex flex-col items-center justify-center
          px-2 py-3 text-center
          border-b border-[#2C2C46]
          shadow-[0_2px_0_rgba(0,0,0,0.2)]
          mx-[10px]
        "
      >
        <img
          src={profilePhoto}
          alt="Profile"
          className="h-[100px] w-[100px] object-cover rounded-full"
        />
        <div
          className="
            mt-2 rounded-full
            px-[15px] py-[5px]
            bg-[rgba(244,58,250,0.7)]
          "
        >
          <h1 className="text-[15px] leading-none">
            {displayName || "DSWD OFFICER"}
          </h1>
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-2 text-base font-medium">
        {sidebarItems.map((item, idx) => (
          <Link key={idx} to={item.path} className="no-underline">
            <div
              className="
                flex items-center gap-[15px]
                px-5 py-2 cursor-pointer
                hover:bg-[#3F3F64] hover:shadow-lg
                transition-colors
              "
            >
              <img
                src={item.icon}
                alt={item.label}
                className="h-[25px] w-[25px] object-contain"
              />
              <p className="m-0 font-normal">{item.label}</p>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
