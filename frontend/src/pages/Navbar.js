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
        bg-white px-7 py-[3px]
        shadow-[0_5px_5px_rgba(0,0,0,0.1)]
        border-b-2 border-[#464646]
      "
    >
      {/* LEFT (LOGOS) */}
      <div className="flex items-center gap-[15px]">
        <img
          src="/images/DSWD.webp"
          alt="DSWD"
          className="w-[100px] rounded-[5px]"
        />
        <img
          src="/images/iacat.jpg"
          alt="IACAT"
          className="h-[60px] w-[60px] rounded-[5px] object-cover"
        />
        <img
          src="/images/iacvawc-logo.png"
          alt="IACVAWC"
          className="h-[60px] w-[60px] rounded-[5px] object-contain"
        />
      </div>

      {/* CENTER (TITLE) */}
      <div className="flex-1 flex justify-center">
        <p
          className="
            m-0 whitespace-nowrap
            text-[18px] font-medium tracking-[0.5px]
            font-[Poppins] text-[#292D96]
          "
        >
          VAWC Case Monitoring and Profiling System
        </p>
      </div>

      {/* RIGHT (DATE/TIME) */}
      <div className="flex items-center justify-end whitespace-nowrap text-[#333] text-lg font-sans">
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
