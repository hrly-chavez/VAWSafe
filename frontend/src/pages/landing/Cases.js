import React from "react";
import {
  FaUserShield,
  FaVenus,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";

export default function Cases() {
  return (
    <div
      className="relative bg-white py-16 px-6 sm:px-12 text-center"
      style={{
        backgroundImage: "url('/images/case_background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between">
        {/* Left Illustration */}
        <div className="w-full lg:w-1/2 flex justify-center mb-10 lg:mb-0">
         
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 text-left space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a40]">
            Target <span className="text-[#292D96]">Beneficiaries</span>
          </h2>
          <p className="text-gray-800 leading-relaxed">
            Protective custody shall be provided to women survivors of abuse
            whose age ranges from <strong>18 to 59 years old</strong> with their
            dependents as well as those who are in need of immediate protective
            custody.
          </p>

          <h3 className="text-2xl font-semibold text-[#1a1a40] mt-8">
            Clientele <span className="text-[#292D96]">Category</span>
          </h3>

          <ul className="space-y-6 mt-6">
            <li className="flex items-start gap-4">
              <div className="bg-[#292D96]/10 text-[#292D96] p-3 rounded-lg">
                <FaVenus size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-black">
                  Victims of Sexual Abuse
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Incest, Rape, Acts of Lasciviousness
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="bg-[#292D96]/10 text-[#292D96] p-3 rounded-lg">
                <FaUserShield size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-black">
                  Victims of Violence
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Physically, Psychologically, Emotionally or Economically
                  abused or threatened
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="bg-[#292D96]/10 text-[#292D96] p-3 rounded-lg">
                <FaExclamationTriangle size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-black">
                  Victims of Exploitation
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Trafficking in Persons, Prostitution, Pornography, Sexual
                  Harassment, Illegal Recruitment, Armed Conflict
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="bg-[#292D96]/10 text-[#292D96] p-3 rounded-lg">
                <FaUsers size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-black">
                  Other Clients
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Homeless/Vagrant, Strandees, Abandoned
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
