import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

const services = [
  {
    title: "Protective Services",
    image: "/images/program.jpg",
    description: "Provides safety and protection for vulnerable individuals, especially women and children.",
  },
  {
    title: "Psychosocial Support",
    image: "/images/program1.jpg",
    description: "Offers emotional and psychological assistance to help survivors recover and reintegrate.",
  },
  {
    title: "Medical and Health Services",
    image: "/images/program2.jpg",
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
    image: "/images/program6.png",
    description: "Offers 24/7 emergency assistance and hotline access for urgent VAWC-related support.",
  },
];

export default function ProgramsServices() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const interval = setInterval(() => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1;
        scrollAmount += 1;

        if (
          scrollAmount >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
          scrollAmount = 0;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

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

      {/* Auto-Moving Carousel */}
      <div className="px-6 py-12 min-h-[300px] sm:min-h-[360px]">
        <div
          ref={scrollRef}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
        >
          <style>
            {`
      div::-webkit-scrollbar {
        display: none;
      }
    `}
          </style>
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="inline-block min-w-[280px] sm:min-w-[320px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full"

            >
              <div className="h-[180px] sm:h-[200px] w-full overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#292D96]/80 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                  <p className="text-sm">{service.description}</p>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-[#292D96] font-semibold text-lg">{service.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
