// Contact.js
import {
  PhoneIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

export default function Contact() {
  return (
    <div className="bg-[#292D96] text-white">
      {/* Banner */}
      <div className="w-full bg-[#001F5B] text-white py-8 px-6 sm:px-12 text-center shadow-md">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">
          #BawatBuhayMahalagaSaDSWD
        </h2>
      </div>

      {/* Horizontal Footer Grid */}
      <div className="px-6 sm:px-12 py-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start text-sm sm:text-base">
        {/* GOV Logo */}
        <div className="flex justify-center md:justify-start">
          <img
            src="/images/GOV.png"
            alt="Government of the Philippines"
            className="w-[170px] h-[170px] object-contain"
          />
        </div>

        {/* Government Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            Government Links
          </h3>
          <ul className="space-y-2 text-white/90 text-xs">
            <li>• Office of the President</li>
            <li>• Office of the Vice President</li>
            <li>• Senate of the Philippines</li>
            <li>• House of Representatives</li>
            <li>• Supreme Court</li>
            <li>• Sandiganbayan</li>
          </ul>
        </div>

        {/* Other Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            Other Resources
          </h3>
          <ul className="space-y-2 text-white/90 text-xs">
            <li>• Data Privacy</li>
            <li>• Citizen’s Charter</li>
            <li>• Freedom of Information (FOI)</li>
            <li>• Transparency Seal</li>
            <li>• KALIPI</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            Contact Us
          </h3>

          <div className="space-y-2 text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Contact Numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-white" />
              <span className="text-xs">Landline: (032) 233-8786</span>
            </div>
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-5 w-5 text-white" />
              <span className="text-xs">Mobile: 0917-703-9785</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Email Address</span>
            </div>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-white" />
              <span className="text-xs">fo7@dswd.gov.ph</span>
            </div>
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            Follow Us
          </h3>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/dswdserves"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-white hover:text-[#292D96] transition duration-300 ease-in-out"
            >
              <FaFacebookF size={15} />
            </a>
            <a
              href="https://twitter.com/dswdserves"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-white hover:text-[#292D96] transition duration-300 ease-in-out"
            >
              <FaTwitter size={15} />
            </a>
            <a
              href="https://www.youtube.com/@dswdserves"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-white hover:text-[#292D96] transition duration-300 ease-in-out"
            >
              <FaYoutube size={15} />
            </a>
            <a
              href="https://www.instagram.com/dswdserves"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/20 hover:bg-white hover:text-[#292D96] transition duration-300 ease-in-out"
            >
              <FaInstagram size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}