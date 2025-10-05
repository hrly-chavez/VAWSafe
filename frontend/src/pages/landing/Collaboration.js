import { MapPinIcon } from "@heroicons/react/24/solid";
import { FaFacebook } from "react-icons/fa";
import ctuLogo from "../landing/logo/CTU.png";
import dswdLogo from "../landing/logo/DSWDLogo.png";

export default function Collaboration() {
  return (
    <div
      className="min-h-screen flex flex-col sm:flex-row items-center justify-between px-0 sm:px-16 py-0 bg-[#292D96] text-white"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen w-full px-6 py-16 text-white flex flex-col items-center justify-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center">
          IN COLLABORATION WITH
        </h2>

        <p className="text-white/80 text-lg mb-12 max-w-4xl text-center">
          The Department of Social Welfare and Development (DSWD) – Region VII is actively collaborating with Cebu Technological University – Main Campus to strengthen VAWC case management, research, and community support through the development of VAWSAFE.
        </p>

        {/* Logos and Icon Links */}
        <div className="flex flex-col sm:flex-row items-start justify-center gap-20">
          {/* CTU */}
          <div className="flex flex-col items-center text-center w-[260px]">
            <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-white">
              <img
                src={ctuLogo}
                alt="CTU Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 h-10 flex justify-center gap-6 items-center">
              <a
                href="https://www.facebook.com/ctuofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffff] hover:scale-110 transition-transform"
              >
                <FaFacebook className="w-8 h-8" />
              </a>
              <a
                href="https://maps.google.com/?q=Cebu+Technological+University+Main+Campus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-110 transition-transform"
              >
                <MapPinIcon className="w-8 h-8" />
              </a>
            </div>
          </div>

          {/* DSWD */}
          <div className="flex flex-col items-center text-center w-[260px]">
            <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-white">
              <img
                src={dswdLogo}
                alt="DSWD Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-6 h-10 flex justify-center gap-6 items-center">
              <a
                href="https://www.facebook.com/dswdserves"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffffff] hover:scale-110 transition-transform"
              >
                <FaFacebook className="w-8 h-8" />
              </a>
              <a
                href="https://maps.google.com/?q=DSWD+Region+VII+Cebu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-110 transition-transform"
              >
                <MapPinIcon className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
