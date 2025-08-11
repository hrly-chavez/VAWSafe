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


import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./css/sidebarCSS.css";

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
    {
      icon: "/images/hands.png",
      label: "VAWC Victims",
      path: "/Dswd_vawc_victims",
    },
    {
      icon: "/images/user.png",
      label: "Social Workers",
      path: "/Dswd_social_workers",
    },
    {
      icon: "/images/edit.png",
      label: "Case Records",
      path: "/Dswd_case_records",
    },
    {
      icon: "/images/high-value.png",
      label: "Services",
      path: "/Dswd_services",
    },
    {
      icon: "/images/bell.png",
      label: "Notification",
      path: "/Dswd_notification",
    },
    {
      icon: "/images/tools.png",
      label: "File Maintenance",
      path: "/Dswd_file_maintenance",
    },
  ];

  // Safe name fallback
  const displayName = user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();

  // Safe profile photo fallback
  const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

  return (
    <div className="sidebar">
      <div className="profile">
        <img src={profilePhoto} className="pfp" alt="Profile" />
        <div className="profile-title-container">
          <h1 className="profile-title">{displayName || "DSWD OFFICER"}</h1>
        </div>
      </div>

      <div className="choices">
        {sidebarItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="row">
              <img
                src={item.icon}
                className="dashboard-icons"
                alt={item.label}
              />
              <p>{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

