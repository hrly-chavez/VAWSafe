// src/components/Sidebar.js
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  // AuthContext in the cookie-based setup exposes { user, logout, bootstrapped }
  const { user, logout } = useContext(AuthContext);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const navigate = useNavigate();

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
        { icon: "/images/heart.png", label: "VAWC Victims", path: "/dswd/victims", },
        // { icon: "/images/customer.png", label: "Social Workers", path: "/dswd/social-workers" },
        // { icon: "/images/founder.png", label: "VAW Desk Officer", path: "/dswd/vawdesk-officer" },
        // { icon: "/images/peace.png", label: "Services",path: "/dswd/services",},
        // { icon: "/images/peace.png",label: "Questions Management",path: "/dswd/questions",},
        { icon: "/images/account-settings.png",label: "Account Management",path: "/dswd/account-management",},
        // { icon: "/images/account-settings.png",label: "Account Management",
        //   children: [
        //     { label: "User Management", path: "/dswd/account-management" },
        //     { label: "Pending Account",path: "/dswd/account-management/pending",},
        //   ],
        // },
        {icon: "/images/dashboardnew.png",label: "Reports",
          children: [
            { label: "Daily Reports", path: "/dswd/account-management" },
            { label: "Monthly Reports", path: "/dswd/account-management/pending",},
          ],
        },
        { icon: "/images/logout.png", label: "Log Out", path: "/login",isLogout: true,},
      ];
    }

    if (role === "psychometrician") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/psychometrician",},
        { icon: "/images/heart.png", label: "VAWC Victims",path: "/psychometrician/victims",},
        { icon: "/images/case.png", label: "Case Records",path: "/psychometrician/case-records",},
        { icon: "/images/meeting.png", label: "Scheduled Sessions",path: "/psychometrician/sessions",},
        // { icon: "/images/calendar.png", label: "My Schedule",path: "/psychometrician/schedule",},
        { icon: "/images/peace.png", label: "Services",path: "/psychometrician/services",},
        { icon: "/images/calendar.png", label: "Questions", path: "/psychometrician/questions" },
        { icon: "/images/logout.png", label: "Log Out", path: "/login",isLogout: true,},
      ];
    }

    if (role === "social worker") {
      return [
        { icon: "/images/dashboardnew.png", label: "Dashboard",path: "/social_worker",},
        { icon: "/images/add.png", label: "Register Victim", path: "/social_worker/register-victim",},
        { icon: "/images/heart.png", label: "VAWC Victims",path: "/social_worker/victims",},
        { icon: "/images/case.png", label: "Case Records",path: "/social_worker/case-records",},
        { icon: "/images/meeting.png",label: "Scheduled Sessions",path: "/social_worker/sessions",},
        { icon: "/images/calendar.png", label: "Questions", path: "/social_worker/questions" },
        { icon: "/images/logout.png", label: "Log Out", path: "/login",isLogout: true,},
        
        // { icon: "/images/calendar.png", label: "My Schedule",path: "/social_worker/schedule",},
        // { icon: "/images/peace.png", label: "Services", path: "/social_worker/services",},
      ];
    }

    if (role === "nurse") {
      return [
        // { icon: "/images/dashboardnew.png", label: "Dashboard", path: "/nurse",},
        { icon: "/images/heart.png", label: "VAWC Victims",path: "/nurse/victims",},
        // { icon: "/images/case.png", label: "Case Records",path: "/nurse/case-records",},
        { icon: "/images/meeting.png",label: "Scheduled Sessions",path: "/nurse/sessions",},
        // { icon: "/images/calendar.png", label: "My Schedule", path: "/nurse/schedule",},
        // { icon: "/images/peace.png",label: "Services", path: "/nurse/services",},
        { icon: "/images/calendar.png", label: "Questions", path: "/nurse/questions" },
        { icon: "/images/logout.png", label: "Log Out",path: "/login",isLogout: true,},
      ];
    }

    if (role === "vawdesk" || role === "desk officer") {
      return [
        { icon: "/images/dashboardnew.png",label: "Dashboard", path: "/desk_officer",},
        { icon: "/images/add.png", label: "Register Victim",path: "/desk_officer/register_victim",},
        { icon: "/images/heart.png", label: "VAWC Victims", path: "/desk_officer/victims",},
        { icon: "/images/customer.png", label: "Social Workers",path: "/desk_officer/social-workers",},
        { icon: "/images/peace.png", label: "Services", path: "/desk_officer/services",},
        { icon: "/images/meeting.png", label: "Scheduled Sessions", path: "/desk_officer/session",},
        // { icon: "/images/case.png", label: "Case Records", path: "/desk_officer/case-records" },
        { icon: "/images/logout.png", label: "Log Out", path: "/login",isLogout: true,},
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
    <aside className="min-h-screen w-[220px] bg-[#2F2F4F] text-white font-poppins sticky top-[70px] shadow-lg z-10">
      {/* Profile */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-[#1F1F35]">
        <img
          src={profilePhoto}
          alt="Profile"
          className="h-[90px] w-[90px] object-cover rounded-full shadow-md cursor-pointer"  // Added cursor pointer for clickable image
          onClick={handleProfileClick}  // On click, redirect based on user role
        />
        <div className="mt-3 text-center w-full px-2">
          <h1 className="text-sm font-bold text-white truncate uppercase cursor-pointer" onClick={handleProfileClick}>
            {displayName || "USER"}
          </h1>
          <p className="text-xs text-gray-300 mt-1">{user?.role || ""}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-4 space-y-1 px-2 overflow-visible">
        {sidebarItems.map((item, idx) => {
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
                    className={`ml-auto h-4 w-4 transform transition-transform ${
                      openDropdownIndex === idx ? "rotate-90" : ""
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
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
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
    </aside>
  );
}
