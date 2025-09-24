import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useRef, useState, useEffect } from "react";

const slides = [
  {
    title: "Service & Referral Management",
    desc: "Social workers and VAW Desk Officers can recommend essential services such as counseling, legal aid, or medical assistance. With the victim’s consent, these services are securely referred to the DSWD for official endorsement and support, ensuring that every victim receives proper care and resources tailored to their needs.",
    image: "/images/dswdq.jpg",
  },
  {
    title: "Secure Case Management",
    desc: "The system provides digital documentation of all VAWC cases, replacing outdated manual records. This ensures accurate, fast, and confidential handling of sensitive information, minimizing data loss while improving coordination between barangays and the DSWD for better case follow-ups.",
    image: "/images/documentation.jpg",
  },
  {
    title: "Victim Registration & Profiling",
    desc: "VAW Desk Officers can register victims with complete personal and case-related information. These digital profiles allow for proper monitoring, support, and follow-up interventions while maintaining strict confidentiality to protect the safety and privacy of the victim.",
    image: "/images/registration.png",
  },
  {
    title: "Facial Recognition",
    desc: "The system integrates a biometric verification feature where victims can securely log in using facial recognition. This double layer of security prevents unauthorized access, ensuring that only the registered victim can use the mobile application and access confidential case records or support services.",
    image: "/images/facial.jpg",
  },
  {
    title: "Reports & Analytics",
    desc: "Both the DSWD and VAW Desk have access to advanced reporting and analytics tools. These features generate accurate statistics, such as the number of active cases, services rendered, and barangay-level reports, enabling better decision-making and tracking of VAWC trends at both the local and regional levels.",
    image: "/images/documentation.png",
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setFade(true);
      resetTimer();
    }, 300);
  };

  const prevSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setFade(true);
      resetTimer();
    }, 300);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 15000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 15000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div
      className="min-h-screen animate-fade-in flex flex-col sm:flex-row items-center justify-between px-0 sm:px-16 py-0 bg-[#292D96] text-white"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex items-center justify-center min-h-screen px-10 py-12 text-white">
        <div className="relative w-full max-w-[90rem] h-[550px]  grid grid-cols-1 sm:grid-cols-2 gap-8 items-center bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl p-8">
          {/* Left Column: Title Image + Description */}
          <div className={`text-white space-y-3 transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"
            } mt-[-100px]`}
          >
            {/* Title Image */}
            <div className="w-full flex justify-center">
              <img
                src="/images/Title5.png"
                alt="VAWSAFE Title"
                className="max-w-[240px] sm:max-w-[300px] lg:max-w-[440px] h-auto mb-2"
              />
            </div>

            {/* Slide Title */}
            <h2 className="text-lg sm:text-1 font-semibold leading-snug">
              {slides[currentIndex].title}
            </h2>

            {/* Slide Description */}
            <p className="text-white/80 text-xs sm:text-sm leading-tight">
              {slides[currentIndex].desc}
            </p>
          </div>

          {/* Right Image */}
          <div className={`relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-lg transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover transition duration-500"
            />
          </div>
        </div>

        {/* Arrow Buttons */}
        <div className="absolute top-1/ left-10 transform -translate-y-1/2 z-10">
          <button
            onClick={prevSlide}
            className="bg-white/70 text-[#292D96] p-2 rounded-full hover:bg-white transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-1/ right-10 transform -translate-y-1/2 z-10">
          <button
            onClick={nextSlide}
            className="bg-white/70 text-[#292D96] p-2 rounded-full hover:bg-white transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
            />
          ))}
        </div>
      </div>
    </div >
  );
}
