import React from "react";
import { Link } from "react-router-dom";
import Home from "./Home";
import ProgramsServices from "./ProgramsServices";
import Collaboration from "./Collaboration";
import Contact from "./Contact";
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    UsersIcon,
    EnvelopeIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid"

export default function LandingLayout() {
    return (
        <div className="min-h-screen font-sans bg-white scroll-smooth">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white px-6 py-3 shadow-md border-b border-[#d1d1d1] text-[#292D96]">
                {/* LEFT: Logos */}
                <div className="flex items-center gap-4">
                    <img src="/images/DSWD.webp" alt="DSWD" className="w-[100px] rounded-md" />
                    <img src="/images/iacat.jpg" alt="IACAT" className="h-[55px] w-[55px] rounded-md object-cover" />
                    <img src="/images/iacvawc-logo.png" alt="IACVAWC" className="h-[55px] w-[55px] rounded-md object-contain" />
                </div>

                {/* RIGHT: Navigation */}
                <div className="space-x-4 text-sm flex items-center">
                    {/* VAWSafe */}
                    <a
                        href="#home"
                        className="group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 hover:bg-[#1f237a] hover:text-white"
                    >
                        <HomeIcon className="h-4 w-4 text-[#292D96] group-hover:text-white" />
                        <span className="font-medium">VAWSafe</span>
                    </a>

                    {/* Programs */}
                    <a
                        href="#programs"
                        className="group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 hover:bg-[#1f237a] hover:text-white"
                    >
                        <ClipboardDocumentListIcon className="h-4 w-4 text-[#292D96] group-hover:text-white" />
                        <span className="font-medium">Programs</span>
                    </a>

                    {/* Collaboration */}
                    <a
                        href="#collaboration"
                        className="group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 hover:bg-[#1f237a] hover:text-white"
                    >
                        <UsersIcon className="h-4 w-4 text-[#292D96] group-hover:text-white" />
                        <span className="font-medium">Collaboration</span>
                    </a>

                    {/* Contact */}
                    <a
                        href="#contact"
                        className="group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 hover:bg-[#1f237a] hover:text-white"
                    >
                        <EnvelopeIcon className="h-4 w-4 text-[#292D96] group-hover:text-white" />
                        <span className="font-medium">Contact</span>
                    </a>

                    {/* Login Button */}
                    <Link
                        to="/login"
                        className="group ml-2 sm:ml-4 flex items-center gap-2 px-4 py-2 rounded-md bg-[#292D96] text-white font-semibold transition-all duration-300 hover:bg-[#1f237a]"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-white group-hover:text-white" />
                        <span>Login</span>
                    </Link>
                </div>
            </nav>

            {/* Scrollable Sections */}
            <main className="pt-20">
                <section id="home"><Home /></section>
                <section id="programs"><ProgramsServices /></section>
                <section id="collaboration"><Collaboration /></section>
                <section id="contact"><Contact /></section>
            </main>
        </div>
    );
}
