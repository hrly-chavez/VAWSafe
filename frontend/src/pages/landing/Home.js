import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-[#292D96] font-sans overflow-x-hidden"
      style={{
        backgroundImage: "url('/images/landing_background.png')",
      }}
    >
      {/* NAV */}
      <header className="w-full flex justify-between items-center px-4 md:px-10 py-5">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide">
          VAWSAFE
        </h1>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex gap-8 items-center text-base font-medium text-gray-700">
          <a href="#home" className="hover:text-white transition">About</a>
          <a href="#programs" className="hover:text-white transition">Services</a>
          <a href="#cases" className="hover:text-white transition">Cases</a>
          <a href="#collaboration" className="hover:text-white transition">Collaboration</a>
          <a href="#contact" className="hover:text-white transition">Contacts</a>

          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-[#292D96] text-[#292D96] hover:bg-[#292D96] hover:text-white transition font-semibold"
          >
            Log in
          </Link>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-[#292D96]"
          onClick={() => setMobileNav(!mobileNav)}
        >
          {mobileNav ? <X size={32} /> : <Menu size={32} />}
        </button>
      </header>

      {/* MOBILE NAV */}
      {mobileNav && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4 text-gray-700 font-medium shadow-md">
          <a href="#home" className="hover:text-[#292D96]">About</a>
          <a href="#programs" className="hover:text-[#292D96]">Services</a>
          <a href="#cases" className="hover:text-[#292D96]">Cases</a>
          <a href="#collaboration" className="hover:text-[#292D96]">Collaboration</a>
          <a href="#contact" className="hover:text-[#292D96]">Contacts</a>

          <Link
            to="/login"
            className="px-4 py-2 w-max rounded-full border border-[#292D96] text-[#292D96] hover:bg-[#292D96] hover:text-white transition font-semibold"
          >
            Log in
          </Link>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="flex flex-col items-start justify-center px-4 md:px-10 lg:px-20 py-20 overflow-x-hidden">
        <div className="max-w-xl space-y-6 mt-10">

          <p className="uppercase text-sm md:text-base font-bold text-orange-600 tracking-widest">
            BEST CARE FOR WOMEN IN NEED
          </p>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#292D96] drop-shadow-sm break-words">
            Heal, Empower, and
            <br />
            <span className="text-orange-500 underline decoration-4">
              Live a New Life
            </span>
          </h2>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium">
            The Haven for Women is a residential care facility that provides
            safe shelter and holistic services for women survivors of abuse,
            aged 18 to 59, along with their dependents — promoting healing,
            empowerment, and recovery.
          </p>

          <div className="flex gap-4 items-center">
            <a
              href="#cases"
              className="px-6 md:px-7 py-3 bg-[#292D96] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#1f1f80] transition"
            >
              Find out more
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
