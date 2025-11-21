import { MapPinIcon } from "@heroicons/react/24/solid";
import { FaFacebook } from "react-icons/fa";
import ctuLogo from "../landing/logo/CTU.png";

export default function Collaboration() {
  return (
    <div
      className="min-h-screen overflow-x-hidden flex flex-col items-center justify-center px-4 sm:px-8 py-16 text-black"
      style={{
        backgroundImage: 'url("/images/collab_background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl w-full flex flex-col items-center text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          IN COLLABORATION WITH
        </h2>

        <p className="text-black/80 text-lg mb-12 max-w-4xl">
          The Department of Social Welfare and Development (DSWD) – Region VII is actively collaborating 
          with Cebu Technological University – Main Campus to strengthen VAWC case management, research, 
          and community support through the development of VAWSAFE.
        </p>

        {/* CTU Logo */}
        <div className="flex flex-col items-center text-center w-full sm:w-auto max-w-xs">
          <div className="w-48 sm:w-52 h-48 sm:h-52 rounded-full overflow-hidden border-4 border-black">
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
              className="text-black hover:scale-110 transition-transform"
            >
              <FaFacebook className="w-8 h-8" />
            </a>
            <a
              href="https://maps.google.com/?q=Cebu+Technological+University+Main+Campus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:scale-110 transition-transform"
            >
              <MapPinIcon className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
