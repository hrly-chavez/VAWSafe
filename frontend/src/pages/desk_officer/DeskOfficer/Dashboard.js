import { useState } from "react";
import Navbar from "../navBar";
import Sidebar from "../sideBar";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const genderData = {
  labels: ["Male", "Female"],
  datasets: [
    {
      label: "Victims",
      data: [5, 15],
      backgroundColor: ["#3B82F6", "#F472B6"],
    },
  ],
};

const caseTypeData = {
  labels: [
    "Physical Abuse",
    "Sexual Abuse",
    "Psychological Abuse",
    "Economic Abuse",
    "Emotional Abuse",
  ],
  datasets: [
    {
      data: [8, 4, 5, 2, 1],
      backgroundColor: ["#EF4444", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6"],
    },
  ],
};

export default function Dashboard() {
  const [stats] = useState({
    victims: 2,
    cases: 2,
    sessions: 1,
    socialWorkers: 4,
  });

  return (
    <div className="md:col-span-4 px-10 py-8 space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Victims", value: stats.victims },
          { label: "Cases", value: stats.cases },
          { label: "Sessions", value: stats.sessions },
          { label: "Social Workers", value: stats.socialWorkers },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-blue-100 border border-blue-200 shadow-sm hover:bg-blue-200 transition"
          >
            <h3 className="text-3xl font-bold text-blue-800">{stat.value}</h3>
            <p className="text-sm mt-2 font-semibold text-blue-700">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold px-6 pt-6">
            Victim Gender Distribution
          </h2>
          <div className="h-[300px] px-6 pb-6">
            <Bar
              data={genderData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold px-6 pt-6">
            VAWC Case Type Breakdown
          </h2>
          <div className="h-[300px] px-6 pb-6">
            <Pie
              data={caseTypeData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Contact + Download Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200 font-sans">
        {/* Left: Contact Info */}
        <div className="space-y-6 text-gray-700">
          <h2 className="text-2xl font-bold text-blue-800 tracking-wide">
            Need Assistance?
          </h2>
          <p className="text-base text-gray-600 leading-relaxed tracking-wide">
            Reach out to our support team for help with reporting, monitoring,
            or accessing services.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-3 text-blue-700 font-semibold text-lg tracking-wide">
                <span className="inline-flex items-center justify-center h-8 w-8 bg-blue-100 rounded-full">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </span>
                DSWD Desk Officer
              </h3>
              <p className="ml-11 text-base">Ms. Angelica D. Ramos</p>
              <p className="ml-11 text-sm flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                angelicad.ramos.dswd1@gmail.com
              </p>
              <p className="ml-11 text-sm flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                angelicad.ramos.dswd1@gov.ph
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-blue-700 font-semibold text-lg tracking-wide">
                <span className="inline-flex items-center justify-center h-8 w-8 bg-blue-100 rounded-full">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </span>
                Barangay Official
              </h3>
              <p className="ml-11 text-base">
                Mr. Carlos S. Reyes – Barangay Captain
              </p>
              <p className="ml-11 text-sm flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                carlos.reyes@barangay.gov.ph
              </p>
              <p className="ml-11 text-sm flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                carlos.reyes@barangay1.gov.ph
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 tracking-wide">
            If you are not sure — VAWSafe is here to help ensure your safety and
            dignity.
          </p>
        </div>

        {/* Right: Download Card */}
        <div className="flex justify-center items-start">
          <div className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-md">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-wide">
                Download the VAWSafe App
              </h2>
              <p className="text-base text-white/90 leading-relaxed tracking-wide">
                Get access to secure case reporting, victim profiling, and
                real-time support services.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {/* Google Play Button */}
              <a
                href="https://play.google.com/store/apps/details?id=com.vawsafe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white text-blue-700 font-semibold text-base px-4 py-2 rounded-md hover:bg-gray-100 transition tracking-wide"
              >
                <img
                  src="/images/google-play.png"
                  alt="Google Play"
                  className="h-6 w-auto"
                />
                Get it on Google Play
              </a>

              {/* Direct APK Download Button */}
              <a
                href="/downloads/vawsafe.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white text-blue-700 font-semibold text-base px-4 py-2 rounded-md hover:bg-gray-100 transition tracking-wide"
              >
                <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />
                Direct APK Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
