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
import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { auth, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);


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
        { icon: "/images/dashboard.png", label: "Dashboard", path: "/social_worker" },
        { icon: "/images/edit.png", label: "Case Records", path: "/social_worker/case-records" },
        { icon: "/images/tools.png", label: "Sessions", path: "/social_worker/sessions" },
        { icon: "/images/high-value.png", label: "Services", path: "/social_worker/services" },
        { icon: "/images/hands.png", label: "VAWC Victims", path: "/social_worker/victims" },
        { icon: "/images/tools.png", label: "Log Out", path: "/login", action: logout },
      ];
    }

    if (role === "dswd") {
      return [
        { icon: "/images/dashboard.png", label: "Dashboard", path: "/dswd" },
        { icon: "/images/hands.png", label: "VAWC Victims", path: "/dswd/victims" },
        { icon: "/images/user.png", label: "Social Workers", path: "/dswd/social-workers" },
        { icon: "/images/edit.png", label: "VAW Desk Officer", path: "/dswd/vawdesk-officer" },
        { icon: "/images/high-value.png", label: "Services", path: "/dswd/services" },
        { icon: "/images/user.png", label: "Account Management", path: "/dswd/account-management" },
        { icon: "/images/tools.png", label: "Log Out", path: "/login", action: logout },
      ];
    }

    if (role === "vawdesk" || role === "desk officer") {
      return [
        { icon: "/images/dashboard.png", label: "Account Page", path: "/desk_officer" },
        { icon: "/images/tools.png", label: "Register Victim", path: "/desk_officer/register_victim" },
        { icon: "/images/tools.png", label: "Ongoing Sessions", path: "/desk_officer" },
        { icon: "/images/tools.png", label: "VAWC Victims", path: "/desk_officer/victims" },
        { icon: "/images/tools.png", label: "Log Out", path: "/login", action: logout },
      ];
    }

    return [];
  };

  const sidebarItems = getSidebarItems();

  const displayName = user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();
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
          <Link
            key={idx}
            to={item.path}
            className="no-underline"
            onClick={() => item.action && item.action()}
          >
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
