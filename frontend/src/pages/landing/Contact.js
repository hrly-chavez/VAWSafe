import {
  MapPinIcon,
  PhoneIcon,
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
    <div className="bg-white text-black font-inter">
      {/* Banner */}
      <div className="w-full bg-[#292D96] text-white py-8 px-6 sm:px-12 text-center shadow-md">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">
          #BawatBuhayMahalagaSaDSWD
        </h2>
      </div>

      {/* Contact Info */}
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div>
          <MapPinIcon className="w-10 h-10 mx-auto text-[#292D96]" />
          <h4 className="font-semibold mt-2 text-black">Location</h4>
          <p className="text-sm text-gray-600">
            AVRC II Compound, Franza Road, Camomot Francia, Cebu City, 6000 Cebu
          </p>
        </div>
        <div>
          <PhoneIcon className="w-10 h-10 mx-auto text-[#292D96]" />
          <h4 className="font-semibold mt-2 text-black">Call Us</h4>
          <p className="text-sm text-gray-600">0908 470 4842</p>
        </div>
        <div>
          <EnvelopeIcon className="w-10 h-10 mx-auto text-[#292D96]" />
          <h4 className="font-semibold mt-2 text-black">Email</h4>
          <p className="text-sm text-gray-600">fo7@dswd.gov.ph</p>
        </div>
      </div>

      {/* Map Preview Link */}
      <div className="w-full px-4 sm:px-6 text-center">
        <a
          href="https://maps.app.goo.gl/58sBPYj1yZ2fDCUZA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
        >
          <img
            src="/images/map.png"
            alt="DSWD FO VII – Regional Haven for Women Map"
            className="w-full h-96 object-cover"
          />
        </a>
      </div>

      {/* Footer */}
      <div className="py-12 text-center">
        <h4 className="text-sm font-semibold mb-4 text-black">Follow Us Now</h4>
        <div className="flex justify-center gap-6">
          <a
            href="https://www.facebook.com/dswdserves"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#292D96] hover:text-gray-600 transition hover:scale-110"
          >
            <FaFacebookF className="w-8 h-8" />
          </a>
          <a
            href="https://twitter.com/dswdserves"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#292D96] hover:text-gray-600 transition hover:scale-110"
          >
            <FaTwitter className="w-8 h-8" />
          </a>
          <a
            href="https://www.youtube.com/@dswdserves"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#292D96] hover:text-gray-600 transition hover:scale-110"
          >
            <FaYoutube className="w-8 h-8" />
          </a>
          <a
            href="https://www.instagram.com/dswdserves"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#292D96] hover:text-gray-600 transition hover:scale-110"
          >
            <FaInstagram className="w-8 h-8" />
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          ©2025 All Rights Reserved. Designed with ❤️ by
        </p>
      </div>
    </div>
  );
}
