// src/components/Sidebar.js
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ sidebarOpen, toggleSidebar, notificationCount = 0 }) {
  // AuthContext in the cookie-based setup exposes { user, logout, bootstrapped }
  const { user, logout } = useContext(AuthContext);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      // call backend /api/auth/logout/ inside this logout()
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // Build sidebar items by role taken directly from context user
  const getSidebarItems = () => {
    const role = (user?.role || "").toLowerCase();

    if (role === "dswd") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/dswd" },
        { icon: "/images/heart.png", label: "Women Survivors", path: "/dswd/victims", },
        { icon: "/images/account-settings.png", label: "Account Management", path: "/dswd/account-management", },
        { icon: "/images/history.png", label: "Login Tracker", path: "/dswd/login-tracker", },
        // { icon: "/images/customer.png", label: "Social Workers", path: "/dswd/social-workers" },
        // { icon: "/images/founder.png", label: "VAW Desk Officer", path: "/dswd/vawdesk-officer" },
        // { icon: "/images/peace.png", label: "Services",path: "/dswd/services",},
        // { icon: "/images/peace.png",label: "Questions Management",path: "/dswd/questions",},
        // { icon: "/images/account-settings.png",label: "Account Management",
        //   children: [
        //     { label: "User Management", path: "/dswd/account-management" },
        //     { label: "Pending Account",path: "/dswd/account-management/pending",},
        //   ],
        // },
      ];
    }

    if (role === "psychometrician") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/psychometrician", },
        { icon: "/images/heart.png", label: "Women Survivors", path: "/psychometrician/victims", },
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/psychometrician/sessions", },
        { icon: "/images/question_mark.png", label: "Questions", path: "/psychometrician/questions" },
        // { icon: "/images/peace.png", label: "Services", path: "/psychometrician/services", },
        // { icon: "/images/case.png", label: "Case Records",path: "/psychometrician/case-records",},
        // { icon: "/images/calendar.png", label: "My Schedule",path: "/psychometrician/schedule",},
      ];
    }

    if (role === "social worker") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/social_worker", },
        { icon: "/images/add.png", label: "Register Victim", path: "/social_worker/register-victim", },
        { icon: "/images/heart.png", label: "Women Survivors", path: "/social_worker/victims", },
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/social_worker/sessions", },
        { icon: "/images/question_mark.png", label: "Questions", path: "/social_worker/questions" },
        // { icon: "/images/case.png", label: "Case Records",path: "/social_worker/case-records",},

        // { icon: "/images/calendar.png", label: "My Schedule",path: "/social_worker/schedule",},
        // { icon: "/images/peace.png", label: "Services", path: "/social_worker/services",},
      ];
    }

    if (role === "nurse") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/nurse", showBadge: true },
        { icon: "/images/heart.png", label: "Women Survivors", path: "/nurse/victims", },
        { icon: "/images/meeting.png", label: "Scheduled Consultations", path: "/nurse/sessions", },
        { icon: "/images/question_mark.png", label: "Questions", path: "/nurse/questions" },
        // { icon: "/images/case.png", label: "Case Records",path: "/nurse/case-records",},
        // { icon: "/images/peace.png",label: "Services", path: "/nurse/services",},
        // { icon: "/images/calendar.png", label: "My Schedule", path: "/nurse/schedule",},
      ];
    }

    if (role === "vawdesk" || role === "desk officer") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/desk_officer", },
        { icon: "/images/add.png", label: "Register Victim", path: "/desk_officer/register_victim", },
        { icon: "/images/heart.png", label: "Women Survivors", path: "/desk_officer/victims", },
        { icon: "/images/customer.png", label: "Social Workers", path: "/desk_officer/social-workers", },
        { icon: "/images/peace.png", label: "Services", path: "/desk_officer/services", },
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/desk_officer/session", },
        // { icon: "/images/case.png", label: "Case Records", path: "/desk_officer/case-records" },
      ];
    }

    return [];
  };

  const sidebarItems = getSidebarItems();
  const displayName =
    user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();
  // Use the correct field for the user's profile photo
  const profilePhoto = user?.of_photo ? `http://localhost:8000${user.of_photo}` : "/images/bussiness-man.png"; // Fallback to default if no photo is found

  // Handle dynamic redirection based on user role
  const handleProfileClick = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case "dswd":
        navigate("/dswd/profile");
        break;
      case "nurse":
        navigate("/nurse/profile");
        break;
      case "psychometrician":
        navigate("/psychometrician/profile");
        break;
      case "social worker":
        navigate("/social_worker/profile");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity sm:hidden ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={toggleSidebar}
      ></div>

      <aside className={`
  w-64 bg-[#1F1F35] text-white font-poppins transform transition-transform
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  fixed top-[40px] sm:top-[70px] left-0
  h-[calc(100vh-40px)] sm:h-[calc(100vh-70px)]
  z-[60] pointer-events-auto
  sm:translate-x-0 shadow-xl border-r border-[#292D96]/30
  flex flex-col
`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#292D96]/20 flex flex-col items-center">
          <img
            src="/images/header2.png"  
            alt="VAWSAFE Logo"
            className="h-26 w-auto"
          />
          <p className="text-xs text-gray-400 uppercase tracking-wide text-center">
            {user?.role || "User"} 
          </p>
        </div>

        {/* Menu area grows to fill space */}
        <nav className="mt-1 space-y-1 px-2 flex-grow overflow-y-auto">
          {sidebarItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const activeClasses = isActive
              ? "bg-[#292D96]/30 text-white font-semibold"
              : "text-white";

            if (item.children) {
              return (
                <div key={idx} className="group">
                  <button
                    onClick={() =>
                      setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md"
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                    />
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                    <svg
                      className={`ml-auto h-4 w-4 transform transition-transform ${openDropdownIndex === idx ? "rotate-90" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {openDropdownIndex === idx && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          to={subItem.path}
                          className="group block no-underline"
                        >
                          <div className="flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md mb-2">
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
                  <div className="flex items-center gap-3 px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md mb-2">
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                    />
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <Link key={idx} to={item.path} className="group block no-underline">
                <div className={`flex items-center justify-between px-4 py-3 rounded-md transition hover:bg-[#3F3F64] hover:scale-[1.02] hover:shadow-md mb-2 ${activeClasses}`}>
                  {/* Left side: icon + label */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-[22px] w-[22px] object-contain opacity-80 group-hover:opacity-100 transition"
                    />
                    <span className="text-sm font-medium text-white group-hover:text-white">
                      {item.label}
                    </span>
                  </div>

                  {/* Right side: badge */}
                  {item.showBadge && notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-[2px] rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer pinned at bottom */}
        <div className="px-4 py-5 border-t border-[#292D96]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.of_photo ? (
              <img
                src={user.of_photo.startsWith("http") ? user.of_photo : `http://localhost:8000${user.of_photo}`}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover shadow-md cursor-pointer"
                onClick={handleProfileClick}
              />
            ) : (
              <div
                className="h-10 w-10 bg-[#292D96] text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer"
                onClick={handleProfileClick}
              >
                {(user?.fname?.[0] || "") + (user?.lname?.[0] || "")}
              </div>
            )}
            <div className="flex flex-col">
              <p
                className="text-sm font-semibold text-white cursor-pointer truncate"
                onClick={handleProfileClick}
              >
                {displayName || "USER"}
              </p>
              <p className="text-xs text-gray-400">{user?.role || ""}</p>
            </div>
          </div>
          <button onClick={handleLogout}>
            <img
              src="/images/logout.png"
              alt="Logout"
              className="h-5 w-5 opacity-80 hover:opacity-100 transition"
            />
          </button>
        </div>
      </aside>
    </>
  );
}
