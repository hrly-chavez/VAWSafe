import {
  MapPinIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";

export default function Contact() {
  return (
    <div className="bg-[#292D96] text-white">
      {/* Banner */}
      <div className="w-full bg-[#001F5B] text-white py-8 px-6 sm:px-12 text-center shadow-md">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">
          #BawatBuhayMahalagaSaDSWD
        </h2>
      </div>

      {/* GOV Logo */}
      <div className="flex justify-center py-10">
        <img
          src="/images/GOV.png" // Replace with actual logo path
          alt="Government of the Philippines"
          className="w-[200px] h-[200px]" // Increased size
        />
      </div>

      {/* Government Links */}
      <div className="px-6 sm:px-12 py-8 max-w-5xl mx-auto">
        <h3 className="text-xl font-semibold mb-4 uppercase tracking-wide text-center">
          Government Links
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm sm:text-base">
          <li>• Office of the President</li>
          <li>• Office of the Vice President</li>
          <li>• Senate of the Philippines</li>
          <li>• House of Representatives</li>
          <li>• Supreme Court</li>
          <li>• Sandiganbayan</li>
        </ul>
      </div>

      {/* Other Resources */}
      <div className="px-6 sm:px-12 py-8 max-w-5xl mx-auto border-t border-white/20">
        <h3 className="text-xl font-semibold mb-4 uppercase tracking-wide text-center">
          Other Resources
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm sm:text-base">
          <li>• Data Privacy</li>
          <li>• Citizen’s Charter</li>
          <li>• Freedom of Information (FOI)</li>
          <li>• Transparency Seal</li>
          <li>• KliyenTell</li>
        </ul>
      </div>

      {/* Contact Section */}
      <div className="px-6 sm:px-12 py-8 max-w-5xl mx-auto border-t border-white/20 text-center">
        <h3 className="text-xl font-semibold mb-6 uppercase tracking-wide">
          Contact Us
        </h3>
        <div className="flex flex-col items-center gap-3 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-white" />
            <span>Cebu City, Philippines</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-5 w-5 text-white" />
            <span>Landline: (632) 8-931-81-01 to 07</span>
          </div>
          <div className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="h-5 w-5 text-white" />
            <span>Globe: 09171105686, 09178272543</span>
          </div>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-white" />
            <span>support@communityportal.ph</span>
          </div>
        </div>
      </div>
    </div>
  );
}
