import { useEffect, useState } from "react";

export default function Navbar() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="
     flex items-center justify-between
    bg-white px-8 py-2
    shadow-md border-b border-[#d1d1d1]
    font-sans text-[#292D96]
  "
    >
      {/* LEFT (LOGOS) */}
      <div className="flex items-center gap-4">
        <img src="/images/DSWD.webp" alt="DSWD" className="w-[100px] rounded-md" />
        <img src="/images/iacat.jpg" alt="IACAT" className="h-[55px] w-[55px] rounded-md object-cover" />
        <img src="/images/iacvawc-logo.png" alt="IACVAWC" className="h-[55px] w-[55px] rounded-md object-contain" />
      </div>

      {/* CENTER (TITLE) */}
      <div className="flex-1 flex justify-center">
        <p className="m-0 text-[18px] font-semibold tracking-wide text-[#292D96]">
          VAWC Case Monitoring and Profiling System
        </p>
      </div>

      {/* RIGHT (DATE/TIME) */}
      <div className="text-right text-sm text-gray-700 font-medium whitespace-nowrap">
        <p className="m-0">
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
