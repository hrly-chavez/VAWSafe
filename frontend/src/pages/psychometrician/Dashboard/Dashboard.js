import React, { useEffect, useState, useContext } from "react";
import { NotificationContext } from "../../../context/NotificationContext";
import { Link } from "react-router-dom";
import {
    FolderIcon,
    CheckCircleIcon,
    ChartBarIcon,
    UserIcon,
    BellIcon,
    ClockIcon
} from "@heroicons/react/24/outline"
import api from "../../../api/axios";

export default function PsychometricianDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sessionSummary, setSessionSummary] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [overdueSessions, setOverdueSessions] = useState([]);
    const { setCount } = useContext(NotificationContext);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get(`/api/psychometrician/dashboard/summary/`);
                const data = res.data;
                setSessionSummary(data.session_summary || {});
                setNotifications(data.upcoming_sessions || []);
                setOverdueSessions(data.overdue_sessions || []);
                setCount((data.upcoming_sessions?.length || 0) + (data.overdue_sessions?.length || 0));
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

    const flowingWavePath =
        "M0 40 Q 25 10, 50 40 Q 75 70, 100 40 Q 125 10, 150 40 Q 175 70, 200 40 Q 225 10, 250 40 Q 275 70, 300 40 Q 325 10, 350 40 Q 375 70, 400 40 Q 425 10, 450 40 Q 475 70, 500 40";

    const kpiCards = [
        {
            label: "Total Assigned Sessions",
            value: sessionSummary.total_assigned_sessions ?? 0,
            change: sessionSummary.total_assigned_percent !== undefined
                ? `${sessionSummary.total_assigned_percent}%`
                : null,
            changeDirection:
                sessionSummary.total_assigned_percent > 0 ? "up" : "neutral",
            icon: <FolderIcon className="w-6 h-6 text-blue-400" />,
            chartData: flowingWavePath,
        },
        {
            label: "Sessions This Week",
            value: sessionSummary.sessions_this_week ?? 0,
            change: sessionSummary.sessions_week_percent !== undefined
                ? `${sessionSummary.sessions_week_percent}%`
                : null,
            changeDirection:
                sessionSummary.sessions_week_percent > 0 ? "up" : "neutral",
            icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
            chartData: flowingWavePath,
        },
        {
            label: "Pending Sessions",
            value: sessionSummary.pending_sessions ?? 0,
            change: sessionSummary.pending_percent !== undefined
                ? `${sessionSummary.pending_percent}%`
                : null,
            changeDirection:
                sessionSummary.pending_percent > 0 ? "up" : "neutral",
            icon: <ChartBarIcon className="w-6 h-6 text-yellow-400" />,
            chartData: flowingWavePath,
        },
        {
            label: "Ongoing Sessions",
            value: sessionSummary.ongoing_sessions ?? 0,
            change: sessionSummary.ongoing_percent !== undefined
                ? `${sessionSummary.ongoing_percent}%`
                : null,
            changeDirection:
                sessionSummary.ongoing_percent > 0 ? "up" : "neutral",
            icon: <UserIcon className="w-6 h-6 text-pink-400" />,
            chartData: flowingWavePath,
        },
    ];

    const allNotifications = [
        ...notifications.map(n => ({ ...n, typeLabel: "Upcoming", color: "blue" })),
        ...overdueSessions.map(n => ({ ...n, typeLabel: "Overdue", color: "red" }))
    ];

    const totalPages = Math.ceil(allNotifications.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentNotifications = allNotifications.slice(startIndex, startIndex + pageSize);

    return (
        <div className="p-4 md:p-8 space-y-8 font-inter bg-[#f7f9fc]">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-extrabold text-gray-800">Psychometrician Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Psychological evaluation, progress overview, and key notifications.
                </p>
            </header>

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

            {/* Unified Notifications */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                    <BellIcon className="w-6 h-6 text-blue-600 mr-2 animate-pulse" />
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 border-b border-gray-200 pb-3">
                    These sessions require attention based on schedule status.
                </p>

                <div className="space-y-4 pr-2">
                    {[...notifications.map(n => ({ ...n, typeLabel: "Upcoming", color: "blue" })),
                    ...overdueSessions.map(n => ({ ...n, typeLabel: "Overdue", color: "red" }))
                    ].map((n, idx) => (
                        <Link key={idx} to={`/psychometrician/sessions/${n.id}`} className="block">
                            <div className="flex justify-between items-start bg-white border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer">
                                <div className="flex flex-col gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-${n.color}-500 w-fit`}>
                                        {n.typeLabel}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Session {n.sess_num} – {n.victim}
                                        </p>
                                        <p className="text-xs text-gray-600">{n.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {new Date(n.date).toLocaleDateString("en-US")}{" "}
                                        {new Date(n.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}