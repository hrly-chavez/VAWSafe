import { useEffect, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/solid";

export default function Navbar({ toggleSidebar }) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white px-4 sm:px-8 py-2 shadow-md border-b border-[#d1d1d1] font-sans text-[#292D96]">
      {/* Hamburger toggle always visible on mobile */}
      <button className="sm:hidden mr-2" onClick={toggleSidebar}>
        <Bars3Icon className="h-6 w-6 text-[#292D96]" />
      </button>

      {/* Left Logos - hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        <img src="/images/DSWD.webp" alt="DSWD" className="w-[100px] rounded-md" />
        <img src="/images/iacat.jpg" alt="IACAT" className="h-[55px] w-[55px] rounded-md object-cover" />
        <img src="/images/iacvawc-logo.png" alt="IACVAWC" className="h-[55px] w-[55px] rounded-md object-contain" />
      </div>

      {/* Right date/time - hidden on small screens */}
      <div className="hidden sm:block text-right text-sm text-gray-700 font-medium whitespace-nowrap">
        <p>
          {dateTime.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          | {dateTime.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
