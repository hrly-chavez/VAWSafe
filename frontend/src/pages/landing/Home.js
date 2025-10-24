import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center text-[#292D96] font-sans"
      style={{
        backgroundImage: "url('/images/landing_background.png')",
      }}
    >
      {/* Navigation Bar */}
      <header className="w-full flex justify-between items-center px-10 py-5">
        <h1 className="text-2xl font-extrabold text-[#292D96] tracking-wide">
          VAWSAFE
        </h1>
        <nav className="flex gap-8 items-center text-base font-medium text-gray-700">
          <a href="#home" className="hover:text-white transition duration-200">
            About
          </a>
          <a
            href="#programs"
            className="hover:text-white transition duration-200">
            Services
          </a>
          <a href="#cases" className="hover:text-white transition duration-200">
            Cases
          </a>
          <a href="#collaboration" className="hover:text-white transition duration-200">
            Collaboration
          </a>
          <a href="#contact" className="hover:text-white transition duration-200">
            Contacts
          </a>
          <Link to="/login" className="hover:text-white transition duration-200">
            Log in
          </Link>
          <Link
            to="/login"
            state={{ openRegister: true }}
            className="px-5 py-2 rounded-full border border-[#292D96] text-[#292D96] hover:bg-[#292D96] hover:text-white transition font-semibold"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-10 lg:px-20 py-20">
        <div className="max-w-xl space-y-6 mt-10 lg:mt-0">
          <p className="uppercase text-base font-bold text-orange-600 tracking-widest">
            BEST CARE FOR WOMEN IN NEED
          </p>
          <h2 className="text-5xl font-extrabold leading-tight text-[#292D96] drop-shadow-sm">
            Heal, Empower, and
            <br />
            <span className="text-orange-500 underline decoration-4">
              Live a New Life
            </span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            The Haven for Women is a residential care facility that provides
            safe shelter and holistic services for women survivors of abuse,
            aged 18 to 59, along with their dependents — promoting healing,
            empowerment, and recovery.
          </p>

          <div className="flex gap-4 items-center">
            <a
              href="#cases"
              className="px-7 py-3 bg-[#292D96] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#1f1f80] transition"
            >
              Find out more
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
