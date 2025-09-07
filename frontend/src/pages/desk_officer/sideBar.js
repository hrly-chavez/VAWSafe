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
    {
      icon: "/images/dashboard.png",
      label: "Account Page",
      path: "/desk_officer",
    },
    {
      icon: "/images/tools.png",
      label: "Register Victim",
      path: "/desk_officer/victim_facial",
    },
    {
      icon: "/images/tools.png",
      label: "Sessions",
      path: "/desk_officer",
    },
    {
      icon: "/images/tools.png",
      label: "VAWC Victims",
      path: "/desk_officer/victims",
    },
    {
      icon: "/images/tools.png",
      label: "Log Out",
      path: "/login", // You can later replace with actual logout logic
    },
  ];

  // Safe name fallback
  const displayName =
    user?.name || `${user?.fname || ""} ${user?.lname || ""}`.trim();

  // Safe profile photo fallback
  const profilePhoto = user?.profile_photo_url || "/images/bussiness-man.png";

  return (
    <div className="bg-[#48486e] w-[200px] h-screen text-white font-[Poppins] shrink-0 overflow-hidden">
      <div className="flex flex-col items-center justify-center px-2 py-4 text-center border-b border-[#2c2c46] shadow-sm">
        <img src={profilePhoto} alt="Profile" className="h-[100px] w-[100px]" />
        <div className="mt-2 p-[3px] px-4 bg-[rgba(244,58,250,0.7)] rounded-full">
          <h1 className="text-[15px]">{displayName || "Desk Officer"}</h1>
        </div>
      </div>

      <div className="mt-4 text-[16px] font-medium">
        {sidebarItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="no-underline text-inherit"
          >
            <div className="flex items-center gap-[15px] px-5 py-2 cursor-pointer hover:bg-[#3f3f64] hover:shadow-lg transition">
              <img
                src={item.icon}
                alt={item.label}
                className="w-[25px] h-[25px]"
              />
              <p>{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
