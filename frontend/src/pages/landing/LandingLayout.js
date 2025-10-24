import React from "react";
import { Link } from "react-router-dom";
import Home from "./Home";
import ProgramsServices from "./ProgramsServices";
import Cases from "./Cases";
import Collaboration from "./Collaboration";
import Contact from "./Contact";

export default function LandingLayout() {
  return (
    <div className="min-h-screen font-sans bg-white scroll-smooth">
      {/* Scrollable Sections */}
      <main>
        <section id="home"><Home /></section>
        <section id="programs"><ProgramsServices /></section>
        <section id="cases"><Cases /></section>
        <section id="collaboration"><Collaboration /></section>
        <section id="contact"><Contact /></section>
      </main>
    </div>
  );
}
