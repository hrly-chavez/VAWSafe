import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const services = [
  {
    icon: "/images/social_services.png",
    title: "Social Services",
    description:
      "Offers help restore and develop residents’ social functioning and prepare them for reintegration or family reunification.",
  },
  {
    icon: "/images/home_life_services.png",
    title: "Home-life/Group Living Services",
    description:
      "Provides residents with meals, clothing, and toiletries to ensure comfort, dignity, and daily living needs are met.",
  },
  {
    icon: "/images/medical_services.png",
    title: "Medical Services",
    description:
      "Provides regular medical and dental checkups, consultations, treatments, and referrals to ensure residents’ overall health and well-being.",
  },
  {
    icon: "/images/psych_services.png",
    title: "Psychological/Psychiatric Services",
    description:
      "Conducts assessments and treatments to evaluate mental health and provide interventions that promote healing and recovery.",
  },
  {
    icon: "/images/legal_services.png",
    title: "Legal Services",
    description:
      "Provides legal assistance and referrals for victims pursuing cases, ensuring safe transport and social worker support during court appearances.",
  },
  {
    icon: "/images/educ_services.png",
    title: "Educational Services",
    description:
      "Offers opportunities for formal or non-formal education to help residents pursue or improve their educational status.",
  },
  {
    icon: "/images/counsel_services.png",
    title: "Counseling Services",
    description:
      "Provides guidance and support through counseling to help residents overcome challenges and resolve personal issues.",
  },
  {
    icon: "/images/care_services.png",
    title: "After Care Services",
    description:
      "Ensures continued rehabilitation and support after discharge, preventing re-victimization and promoting stable reintegration.",
  },
];

export default function ProgramsServices() {
  const [expanded, setExpanded] = useState(false);
  const controls = useAnimation();

  // Function to start the auto-scroll animation
  const startAutoScroll = () => {
    controls.set({ x: "0%" });
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 45,
          ease: "linear",
        },
      },
    });
  };

  useEffect(() => {
    if (!expanded) {
      startAutoScroll();
    } else {
      controls.stop();
    }
  }, [expanded]);

  const handleToggle = () => {
    if (expanded) {
      setExpanded(false);
      startAutoScroll();
    } else {
      setExpanded(true);
      controls.stop();
    }
  };

  return (
    <div
      className="relative bg-white py-16 px-6 sm:px-12 text-center"
      style={{
        backgroundImage: "url('/images/service_background.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold tracking-widest text-[#1a1a40]/70 uppercase">
            Category
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a40] mt-2">
            We Offer Best Services
          </h2>
        </div>

        {/* Services Section */}
        <div className="relative w-full overflow-hidden py-4">
          {!expanded ? (
            <motion.div
              animate={controls}
              className="flex gap-8 w-[200%] items-stretch"
            >
              {[...services, ...services].map((service, idx) => (
                <div
                  key={idx}
                  className="min-w-[250px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl overflow-hidden">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-black leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-center items-stretch">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl overflow-hidden">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-black leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <div className="mt-10">
          <button
            onClick={handleToggle}
            className="bg-[#292D96] hover:bg-[#1a1a40] text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300"
          >
            {expanded ? "Collapse" : "Expand All"}
          </button>
        </div>
      </div>
    </div>
  );
}
