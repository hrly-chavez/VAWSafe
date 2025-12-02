import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  FolderIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import api from "../../../api/axios";
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  annotationPlugin,
  ChartDataLabels,
  Tooltip,
  Legend,
  Title
);

export default function DSWDDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [victimStats, setVictimStats] = useState({});
  const [incidentStats, setIncidentStats] = useState({});
  const [reportRows, setReportRows] = useState([]);
  const [monthlyVictimData, setMonthlyVictimData] = useState([]);
  const [violenceTypeData, setViolenceTypeData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/dswd/dswddashboard/summary");
        const data = res.data;

        // victim summary includes minors_change now
        setVictimStats(data.victim_summary);

        // incident summary includes active_change and resolved_change
        const violenceTypes = data.incident_summary.violence_types || {};
        const totalViolence = Object.values(violenceTypes).reduce((a, b) => a + b, 0);
        const topType = data.incident_summary.top_violence_type;
        const topValue = violenceTypes[topType] || 0;
        const topPercent = totalViolence > 0 ? ((topValue / totalViolence) * 100).toFixed(1) + "%" : "0%";

        setIncidentStats({
          ...data.incident_summary,
          topViolencePercent: topPercent, // keep this extra field
        });

        setReportRows(data.monthly_report_rows);
        setMonthlyVictimData(data.monthly_report_rows.map((row) => row.totalVictims));

        setViolenceTypeData({
          labels: [
            "Physical Violence",
            "Physical Abused",
            "Psychological Violence",
            "Psychological Abuse",
            "Economic Abused",
            "Strandee",
            "Sexually Abused",
            "Sexually Exploited",
          ],
          datasets: [
            {
              label: "Cases",
              data: [
                violenceTypes["Physical Violence"] || 0,
                violenceTypes["Physical Abused"] || 0,
                violenceTypes["Psychological Violence"] || 0,
                violenceTypes["Psychological Abuse"] || 0,
                violenceTypes["Economic Abused"] || 0,
                violenceTypes["Strandee"] || 0,
                violenceTypes["Sexually Abused"] || 0,
                violenceTypes["Sexually Exploited"] || 0,
              ],
              backgroundColor: [
                "#F87171", "#FBBF24", "#60A5FA", "#A78BFA",
                "#34D399", "#F472B6", "#F59E0B", "#3B82F6",
              ],
              borderWidth: 2,
              borderRadius: 6,
              barPercentage: 1.0,
              categoryPercentage: 1.0,
            },
          ],
        });
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const highlightPlugin = {
    id: 'highlightPlugin',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;
      const currentMonthIndex = new Date().getMonth();

      const meta = chart.getDatasetMeta(0);
      const dataPoint = meta.data[currentMonthIndex];
      if (!dataPoint) return;

      const x = dataPoint.x;
      const step = xAxis.width / chart.data.labels.length;

      const left = x - step / 2;
      const right = x + step / 2;

      const gradient = ctx.createLinearGradient(left, yAxis.top, right, yAxis.bottom);
      gradient.addColorStop(0, "rgba(16,185,129,0.15)");
      gradient.addColorStop(1, "rgba(16,185,129,0.05)");

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.fillRect(left, yAxis.top, right - left, yAxis.bottom - yAxis.top);
      ctx.restore();
    }
  };

  const titleLegendPlugin = {
    id: "titleLegendPlugin",
    beforeDraw(chart) {
      // Only apply to line charts
      if (chart.config.type !== "line") return;

      const { ctx, chartArea: { top, left } } = chart;
      ctx.save();

      // Title on the left (shift further left by subtracting some pixels)
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Monthly Victim Reports", left - 40, top - 30); 

      // Legend on the right
      const legend = chart.legend;
      if (legend) {
        legend.options.align = "end";
        legend.options.position = "top";
      }

      ctx.restore();
    }
  };

  ChartJS.register(highlightPlugin);
  ChartJS.register(titleLegendPlugin);
  ChartJS.defaults.font.family = "Inter";
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.color = "#000000";

  // Line chart (Monthly Victim Reports)
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "2025 Victims",
        data: monthlyVictimData,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.2)",
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "2024 Victims",
        data: [0, 1, 0, 2, 1, 0, 0, 1, 0, 3, 2, 1],
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139,92,246,0.2)",
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 1. Compute max and stepSize BEFORE defining lineOptions
  const maxValue = Math.max(...monthlyVictimData);
  let stepSize = 1;
  let suggestedMax = 10;

  if (maxValue >= 1000) {
    stepSize = 100;
    suggestedMax = Math.ceil(maxValue / 100) * 100;
  } else if (maxValue >= 100) {
    stepSize = 10;
    suggestedMax = Math.ceil(maxValue / 10) * 10;
  } else {
    stepSize = 1;
    suggestedMax = Math.ceil(maxValue / 1) * 1;
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 3,
        tension: 0.4,
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2,
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      title: {
        display: false,
      },
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#000000",
          font: {
            family: "Inter, sans-serif",
            size: 13,
            weight: "bold",
          },
          boxWidth: 12,
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1F2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderWidth: 0,
        cornerRadius: 8,
        padding: 16,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "Inter, sans-serif",
          size: 18,
          weight: "bold",
        },
        bodyFont: {
          family: "Inter, sans-serif",
          size: 16,
        },
        callbacks: {
          title: (context) => context[0].label,
          labelPointStyle: () => ({
            pointStyle: "circle",
            rotation: 0,
          }),
          label: (context) => `Victims: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#000000",
          font: {
            family: "Inter, sans-serif",
            size: 14,
            weight: "bold",
          },
          padding: { top: 8 },
        },
        ticks: {
          color: "#000000",
          font: { family: "Inter, sans-serif", size: 12 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Victims",
          color: "#000000",
          font: {
            family: "Inter, sans-serif",
            size: 14,
            weight: "bold",
          },
          padding: { bottom: 8 },
        },
        min: 0,
        suggestedMax: suggestedMax,
        ticks: {
          stepSize: stepSize,
          beginAtZero: true,
          color: "#000000",
          font: { family: "Inter, sans-serif", size: 12 },
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 20,
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      title: {
        display: true,
        text: "Violence Type Breakdown",
        align: "start",
        color: "#000000",
        font: {
          family: "Inter, sans-serif",
          size: 18,
          weight: "bold",
        },
        padding: { top: 0, bottom: 12 },
      },
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#1F2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderWidth: 0,
        cornerRadius: 8,
        padding: 16,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "Inter, sans-serif",
          size: 18,
          weight: "bold",
        },
        bodyFont: {
          family: "Inter, sans-serif",
          size: 16,
        },
        callbacks: {
          labelPointStyle: () => ({ pointStyle: "circle", rotation: 0 }),
          label: (context) => `Cases: ${context.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        ticks: {
          beginAtZero: true,
          color: "#000000",
          font: { family: "Inter, sans-serif", size: 12 },
          callback: (value) => value,
          stepSize: 1,
        },
        grid: { color: "rgba(209,213,219,0.4)", lineWidth: 1.5 },
        title: {
          display: true,
          text: "Number of Cases",
          color: "#000000",
          font: { family: "Inter, sans-serif", size: 14, weight: "bold" },
          padding: { top: 8 },
        },
      },
      y: {
        ticks: { color: "#000000", font: { family: "Inter, sans-serif", size: 12 } },
        grid: { color: "rgba(209,213,219,0.4)", lineWidth: 1.5 },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Age Group Distribution",
        color: "#000000",
        font: { family: "Inter, sans-serif", size: 16, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      legend: {
        position: "bottom",
        labels: {
          color: "#000000",
          font: { family: "Inter, sans-serif", size: 11, weight: "bold" },
          boxWidth: 10,
          padding: 8,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      datalabels: {
        display: true,
        color: "#ffffff",   
        font: {
          family: "Inter, sans-serif",
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          // ✅ Hide if 0%
          if (percent === "0.0" || percent === "0") return null;
          return `${percent}%`;
        },
        anchor: "center",
        align: "center",
        clamp: true,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1F2937",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderWidth: 0,
        cornerRadius: 8,
        padding: 16,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: "Inter, sans-serif", size: 18, weight: "bold" },
        bodyFont: { family: "Inter, sans-serif", size: 16 },
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} victims (${percent}%)`;
          },
        },
      },
    },
    cutout: "55%",
  };

  const ageGroupData = {
    labels: ["18 below", "18–35", "36–50", "50 above"],
    datasets: [
      {
        data: [
          victimStats.age_0_18 || 0,
          victimStats.age_18_35 || 0,
          victimStats.age_36_50 || 0,
          victimStats.age_51_plus || 0,
        ],
        backgroundColor: [
          "#10B981", // green
          "#3B82F6", // blue
          "#F59E0B", // orange
          "#EF4444", // red
        ],
        borderColor: ["#059669", "#2563EB", "#D97706", "#DC2626"],
        hoverOffset: 10,
        borderWidth: 3,
      },
    ],
  };

  const flowingWavePath =
    "M0 40 Q 25 10, 50 40 Q 75 70, 100 40 Q 125 10, 150 40 Q 175 70, 200 40 Q 225 10, 250 40 Q 275 70, 300 40 Q 325 10, 350 40 Q 375 70, 400 40 Q 425 10, 450 40 Q 475 70, 500 40";

  const kpiCards = [
    {
      label: "Active Cases",
      value: incidentStats.active_cases ?? 0,
      change: incidentStats.active_percent !== undefined ? `${incidentStats.active_percent}%` : null,
      changeDirection: incidentStats.active_percent > 0 ? "up" : "neutral",
      icon: <FolderIcon className="w-6 h-6 text-blue-400" />,
      chartData: flowingWavePath,
    },
    {
      label: "Cases Resolved",
      value: incidentStats.resolved_cases ?? 0,
      change: incidentStats.resolved_percent !== undefined ? `${incidentStats.resolved_percent}%` : null,
      changeDirection: incidentStats.resolved_percent > 0 ? "up" : "neutral",
      icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
      chartData: flowingWavePath,
    },
    {
      label: "Top Violence Type",
      value: incidentStats.top_violence_type ?? "N/A",
      change: incidentStats.top_violence_percent !== undefined ? `${incidentStats.top_violence_percent}%` : null,
      changeDirection:
        incidentStats.top_violence_percent === 0
          ? "neutral"
          : incidentStats.top_violence_percent < 50
            ? "down"
            : "up",
      icon: <ChartBarIcon className="w-6 h-6 text-yellow-400" />,
      chartData: flowingWavePath,
    },
    {
      label: "Total Minor Victims",
      value: victimStats.age_0_18 ?? 0,
      change: victimStats.age_0_18_percent !== undefined ? `${victimStats.age_0_18_percent}%` : null,
      changeDirection:
        victimStats.age_0_18_percent === 0
          ? "neutral"
          : victimStats.age_0_18_percent < 50
            ? "down"
            : "up",
      icon: <UserIcon className="w-6 h-6 text-pink-400" />,
      chartData: flowingWavePath,
    },
  ];


  if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-gray-800">DSWD Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitoring victims, incidents, and monthly reports.</p>
      </header>

      <div className="min-h-screen text-white font-inter space-y-10">

        <style>
                    {`
                @keyframes waveFlow {
                  0%   { transform: translateX(0) scaleY(1); }
                  25%  { transform: translateX(-20px) scaleY(1.3); }
                  50%  { transform: translateX(-40px) scaleY(0.7); }
                  75%  { transform: translateX(-60px) scaleY(1.1); }
                  100% { transform: translateX(-100px) scaleY(1); }
                }
                .wave-animated {
                  animation: waveFlow 6s linear infinite;
                  transform-origin: center;
                }
              `}
        </style>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, idx) => {
            const isPositive = kpi.changeDirection === "up";
            const percentageColor =
              isPositive ? "text-green-500" : kpi.changeDirection === "down" ? "text-red-500" : "text-gray-400";

            const formattedValue =
              typeof kpi.value === "string"
                ? kpi.value
                : kpi.label.toLowerCase().includes("revenue")
                  ? `$${kpi.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : kpi.value.toLocaleString("en-US");

            const sparklineColor =
              kpi.changeDirection === "up"
                ? "#10B981"   // green
                : kpi.changeDirection === "down"
                  ? "#EF4444"   // red
                  : "#9CA3AF";  // gray

            return (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full">
                {/* Top row: icon + label on left, percentage on right */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {kpi.icon}
                    <h3 className="text-gray-600 text-sm font-semibold tracking-wide">{kpi.label}</h3>
                  </div>
                  {kpi.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${percentageColor}`}>
                      {kpi.changeDirection === "up" && (
                        <img src="/images/up.png" alt="Up" className="w-4 h-4" />
                      )}
                      {kpi.changeDirection === "down" && (
                        <img src="/images/down.png" alt="Down" className="w-4 h-4" />
                      )}
                      {kpi.changeDirection === "neutral" && (
                        <img src="/images/neutral.png" alt="Neutral" className="w-4 h-4" />
                      )}
                      <span>{kpi.change}</span>
                    </div>
                  )}
                </div>

                {/* Value centered */}
                <div className="text-center mt-2">
                  <div className="text-lg font-bold text-gray-900">{formattedValue}</div>
                </div>

                {/* Sparkline */}
                <div className="h-24 w-full mt-2">
                  <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`sparkline-fill-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={sparklineColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={sparklineColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <g className="wave-animated" style={{ animationDuration: `${4 + idx}s` }}>
                      <path
                        d={`${kpi.chartData} L500 80 L0 80 Z`}
                        fill={`url(#sparkline-fill-${idx})`}
                        stroke="none"
                      />
                      <path
                        d={kpi.chartData}
                        fill="none"
                        stroke={sparklineColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOP CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bar Chart: spans 2/3 width */}
          <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 md:col-span-2">
            <div className="w-full h-[350px]">
              <Bar data={violenceTypeData} options={barOptions} />
            </div>
          </div>

          {/* Doughnut Chart: spans 1/3 width */}
          <div className="bg-white rounded-2xl shadow-md p-6 col-span-1 flex flex-col justify-center items-center">
            <div className="w-full h-[300px]">
              <Doughnut data={ageGroupData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Monthly Victim Reports */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-6 h-[450px]">
          <div className="h-[400px]">   {/* was 300px */}
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* MONTHLY REPORT TABLE */}
        <div className="bg-white rounded-xl shadow border border-neutral-200 p-6 mt-6">
          {/* Header inside container */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            {/* Title: smaller size */}
            <h2 className="text-xl font-bold text-black">
              Type of Violence – Monthly Summary
            </h2>

            {/* Filter by Year (non-functional for now) */}
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <label
                htmlFor="yearFilter"
                className="text-sm font-medium text-gray-700"
              >
                Filter by Year:
              </label>
              <select
                id="yearFilter"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none text-gray-700"
                defaultValue=""
              >
                <option value="" disabled>
                  By Year
                </option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          {/* Excel-style table */}
          <table className="min-w-full border border-gray-300 text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Month</th>
                <th className="px-4 py-2 border border-gray-300">Physical Violence</th>
                <th className="px-4 py-2 border border-gray-300">Physical Abused</th>
                <th className="px-4 py-2 border border-gray-300">Psychological Violence</th>
                <th className="px-4 py-2 border border-gray-300">Psychological Abuse</th>
                <th className="px-4 py-2 border border-gray-300">Economic Abused</th>
                <th className="px-4 py-2 border border-gray-300">Strandee</th>
                <th className="px-4 py-2 border border-gray-300">Sexually Abused</th>
                <th className="px-4 py-2 border border-gray-300">Sexually Exploited</th>
                <th className="px-4 py-2 border border-gray-300">Total</th>
              </tr>
            </thead>

            <tbody>
              {reportRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-center text-gray-500 italic border border-gray-300"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                reportRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 border border-gray-300 font-medium">{row.month}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Physical_Violence || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Physical_Abused || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Psychological_Violence || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Psychological_Abuse || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Economic_Abused || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Strandee || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Sexually_Abused || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{row.Sexually_Exploited || ""}</td>
                    <td className="px-4 py-2 border border-gray-300 text-center font-semibold text-blue-800">
                      {row.totalVictims || ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
