import { Link } from "react-router-dom";

const services = [
  {
    title: "Protective Services",
    image: "/images/program.jpg",
    description: "Provides safety and protection for vulnerable individuals, especially women and children.",
  },
  {
    title: "Psychosocial Support",
    image: "/images/program1.png",
    description: "Offers emotional and psychological assistance to help survivors recover and reintegrate.",
  },
  {
    title: "Medical and Health Services",
    image: "/images/program2.png",
    description: "Ensures access to essential medical care and health support for affected individuals.",
  },
  {
    title: "Legal and Justice Services",
    image: "/images/program3.jpg",
    description: "Connects survivors with legal professionals and justice mechanisms for protection and redress.",
  },
  {
    title: "Shelter and Crisis Intervention",
    image: "/images/program4.jpg",
    description: "Provides temporary shelter and immediate crisis response for those in danger or distress.",
  },
  {
    title: "Livelihood and Reintegration",
    image: "/images/program5.png",
    description: "Supports economic empowerment and reintegration into society through skills and resources.",
  },
  {
    title: "Hotlines and Emergency Services",
    image: "/images/program6.jpg",
    description: "Offers 24/7 emergency assistance and hotline access for urgent VAWC-related support.",
  },
];

export default function ProgramsServices() {
  return (
    <div className="bg-white">
      {/* Banner */}
      <div className="w-full bg-[#292D96] text-white py-8 px-6 sm:px-12 text-center shadow-md">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide uppercase">
          Programs & Services
        </h2>
        <p className="mt-2 text-white/80 text-sm sm:text-base max-w-3xl mx-auto">
          Explore the range of support services offered by DSWD and its partners to empower individuals and communities.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {services.map((service, idx) => (
          <div
            key={idx}
            className={`group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white ${idx === services.length - 1 ? "lg:col-span-1 lg:mx-auto" : ""
              }`}
          >
            <div className="h-56 w-full overflow-hidden relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#292D96]/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
                <p className="text-sm sm:text-base">{service.description}</p>
              </div>
            </div>

            <div className="p-5 text-center">
              <h3 className="text-[#292D96] font-semibold text-lg group-hover:text-pink-500 transition-colors duration-300">
                {service.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
