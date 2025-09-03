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

import Navbar from "../navBar";
import Sidebar from "../sideBar";
export default function DeskOfficerPage() {
  return (
    <div>
      <Navbar></Navbar>
      <div className="grid grid-cols-2">
        <div>
          <Sidebar></Sidebar>
        </div>
        <div>desk officer</div>
      </div>
    </div>
  );
}
