"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Gauge,
  Volume2,
  AlertCircle,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function HeroInteractiveCar() {
  const [speedMode, setSpeedMode] = useState<"school" | "city" | "highway">(
    "city",
  );
  const [isBraking, setIsBraking] = useState(false);
  const [isHonking, setIsHonking] = useState(false);

  const speedValues = {
    school: 30,
    city: 50,
    highway: 80,
  };

  const currentSpeed = isBraking ? 0 : speedValues[speedMode];

  const handleTestBrake = () => {
    setIsBraking(true);
    new Audio("/audio/car-break.mp3").play();
    setTimeout(() => {
      setIsBraking(false);
    }, 1800);
  };

  const handleHonk = () => {
    setIsHonking(true);
    new Audio("/audio/car-honk.mp3").play();
    setTimeout(() => {
      setIsHonking(false);
    }, 1000);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-[90%] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="h-48 w-[60%] rounded-full bg-amber-400/10 blur-2xl" />
      </div>

      {/* Main Interactive Stage Box */}
      <div>
        {/* <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-white/95 via-zinc-50/90 to-zinc-100/90 p-5 sm:p-8 shadow-xl backdrop-blur-md"> */}
        {/* Top Control Bar & Live Status */}
        {/* <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4"> */}
        {/* <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-zinc-900 tracking-wide uppercase">
              Dual-Control Training Simulator
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              ICBC Certified Fleet
            </span>
          </div> */}

        {/* Speed Preset Switcher */}
        <div className="flex justify-center py-2 items-center gap-1 rounded-xl bg-zinc-200/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => setSpeedMode("school")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              speedMode === "school"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            30 km/h School
          </button>
          <button
            type="button"
            onClick={() => setSpeedMode("city")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              speedMode === "city"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            50 km/h City
          </button>
          <button
            type="button"
            onClick={() => setSpeedMode("highway")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              speedMode === "highway"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            80 km/h Hwy
          </button>
        </div>
        {/* </div> */}

        {/* Car & Road Canvas Area */}
        <div className="relative my-4 flex flex-col items-center justify-center pt-8 pb-4">
          {/* Floating Pill: Dual-Brake Status (Left) */}
          <div className="absolute top-2 left-2 sm:left-4 z-20 anim-float-badge hidden xs:flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-2 shadow-sm text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-bold text-zinc-900 leading-tight">
                Dual-Brake Active
              </p>
              <p className="text-[10px] text-zinc-500">
                Instructor Safe Overrides
              </p>
            </div>
          </div>

          {/* Floating Pill: Route Verified (Right) */}
          <div className="absolute top-2 right-2 sm:right-4 z-20 anim-float-badge-delayed hidden xs:flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/95 px-3 py-2 shadow-sm text-xs">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-bold text-zinc-900 leading-tight">
                Surrey 152nd St
              </p>
              <p className="text-[10px] text-zinc-500">ICBC Mock Routes</p>
            </div>
          </div>

          {/* Horn Soundwaves */}
          {isHonking && (
            <div className="absolute -top-4 right-1/4 z-30 flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-3 py-1 text-xs font-bold shadow-lg animate-bounce">
              <Volume2 className="h-3.5 w-3.5 text-amber-400" />
              <span>BEEP BEEP! 🚗</span>
            </div>
          )}

          {/* Instructor Dual-Brake Banner */}
          {isBraking && (
            <div className="absolute -top-3 z-30 flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-1.5 text-xs font-bold shadow-lg animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <span>INSTRUCTOR DUAL-BRAKE APPLIED (SAFE STOP)</span>
            </div>
          )}

          {/* THE VECTOR CAR ANIMATION */}
          <div
            className={`relative w-full max-w-md transition-transform duration-300 ${
              !isBraking ? "anim-car-vibration" : "scale-[0.99] translate-y-1"
            }`}
          >
            {/* Roof Sign: STUDENT DRIVER */}
            <div className="relative mx-auto flex h-7 w-36 items-center justify-center rounded-t-lg border-2 border-zinc-800 bg-white shadow-sm z-10">
              {/* Amber Beacon on top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-2.5 w-6 rounded-t-full bg-amber-400 anim-beacon border border-amber-500" />
              <span className="text-[9px] font-black uppercase tracking-wider text-red-600">
                STUDENT DRIVER
              </span>
            </div>

            {/* Car Chassis SVG */}
            <div className="relative -mt-0.5">
              <svg
                viewBox="0 0 500 160"
                className="w-full drop-shadow-md"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Windshield & Cabin Glass */}
                <path
                  d="M110 80 L160 25 L340 25 L400 80 Z"
                  fill="#1e293b"
                  opacity="0.92"
                />
                {/* Window glare reflections */}
                <path
                  d="M175 32 L240 32 L210 75 L155 75 Z"
                  fill="#94a3b8"
                  opacity="0.35"
                />
                <path
                  d="M260 32 L330 32 L380 75 L310 75 Z"
                  fill="#94a3b8"
                  opacity="0.3"
                />

                {/* Car Main Body (Crisp Modern White Sedan) */}
                <path
                  d="M30 115 
                     C30 90, 45 78, 85 75 
                     L155 75 
                     L210 25 
                     L350 25 
                     L420 75 
                     L465 80 
                     C485 85, 495 95, 495 115 
                     L495 125 
                     C495 130, 485 135, 475 135 
                     L430 135 
                     C425 105, 365 105, 360 135 
                     L180 135 
                     C175 105, 115 105, 110 135 
                     L45 135 
                     C35 135, 30 130, 30 125 Z"
                  fill="#f8fafc"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Door line cutouts */}
                <line
                  x1="240"
                  y1="30"
                  x2="235"
                  y2="132"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                <line
                  x1="345"
                  y1="30"
                  x2="350"
                  y2="132"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                {/* Door handles */}
                <rect
                  x="210"
                  y="85"
                  width="18"
                  height="4"
                  rx="2"
                  fill="#334155"
                />
                <rect
                  x="315"
                  y="85"
                  width="18"
                  height="4"
                  rx="2"
                  fill="#334155"
                />

                {/* Four Seasons Branding on Door */}
                <text
                  x="225"
                  y="110"
                  fill="#059669"
                  fontSize="13"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  FOUR SEASONS
                </text>
                <text
                  x="240"
                  y="122"
                  fill="#64748b"
                  fontSize="8"
                  fontWeight="600"
                >
                  DRIVING SCHOOL
                </text>

                {/* Front Headlight (Right) */}
                <path
                  d="M470 92 L492 98 L488 112 L460 110 Z"
                  fill="#38bdf8"
                  className={!isBraking ? "animate-pulse" : ""}
                />
                {/* Rear Tail Light (Left) */}
                <path
                  d="M32 94 L50 96 L48 114 L30 112 Z"
                  fill={isBraking ? "#ef4444" : "#991b1b"}
                  filter={
                    isBraking
                      ? "drop-shadow(0 0 8px rgba(239, 68, 68, 0.9))"
                      : "none"
                  }
                />

                {/* Front Headlight Light Cone Projection */}
                {!isBraking && (
                  <polygon
                    points="490,102 560,80 560,135 490,115"
                    fill="url(#headlightGradient)"
                    opacity="0.35"
                  />
                )}

                {/* Linear Gradients */}
                <defs>
                  <linearGradient
                    id="headlightGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Wheels: Rear Wheel (Left) */}
                <g transform="translate(145, 132)">
                  {/* Tire rubber */}
                  <circle
                    r="26"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="2"
                  />
                  {/* Wheel rim spinning */}
                  <g className={!isBraking ? "anim-wheel-spin" : ""}>
                    <circle
                      r="17"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    <circle r="6" fill="#0f172a" />
                    {/* Alloy spokes */}
                    <line
                      x1="0"
                      y1="-16"
                      x2="0"
                      y2="16"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-16"
                      y1="0"
                      x2="16"
                      y2="0"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-11"
                      y1="-11"
                      x2="11"
                      y2="11"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-11"
                      y1="11"
                      x2="11"
                      y2="-11"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                  </g>
                </g>

                {/* Wheels: Front Wheel (Right) */}
                <g transform="translate(395, 132)">
                  <circle
                    r="26"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="2"
                  />
                  <g className={!isBraking ? "anim-wheel-spin" : ""}>
                    <circle
                      r="17"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    <circle r="6" fill="#0f172a" />
                    <line
                      x1="0"
                      y1="-16"
                      x2="0"
                      y2="16"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-16"
                      y1="0"
                      x2="16"
                      y2="0"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-11"
                      y1="-11"
                      x2="11"
                      y2="11"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <line
                      x1="-11"
                      y1="11"
                      x2="11"
                      y2="-11"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* ROAD BASE SURFACE WITH ANIMATED DASHES */}
          <div className="relative -mt-2 w-full max-w-xl">
            {/* Asphalt Track */}
            <div className="h-6 w-full rounded-full bg-zinc-900 border-t-2 border-zinc-700 shadow-inner overflow-hidden relative">
              {/* Moving road dashed line */}
              <div
                className={`absolute inset-0 flex items-center ${
                  !isBraking ? "anim-road-h" : ""
                }`}
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #facc15 0px, #facc15 28px, transparent 28px, transparent 65px)",
                  backgroundSize: "65px 4px",
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "0 center",
                  height: "4px",
                }}
              />
            </div>
            {/* Road Reflection Glow */}
            <div className="h-2 w-full bg-gradient-to-b from-zinc-900/40 to-transparent blur-xs" />
          </div>

          {/* Bottom Interactive Trigger Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleTestBrake}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                isBraking
                  ? "bg-red-600 text-white shadow-md scale-95"
                  : "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"
              }`}
            >
              <AlertCircle
                className={`h-3.5 w-3.5 ${isBraking ? "text-white" : "text-red-500"}`}
              />
              <span>
                {isBraking ? "Braking..." : "Test Dual-Control Brake"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleHonk}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                isHonking
                  ? "bg-amber-500 text-zinc-950 scale-95"
                  : "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5 text-amber-500" />
              <span>Honk Horn</span>
            </button>

            {/* Live Speed Indicator */}
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-mono font-bold text-white shadow-xs">
              <Gauge className="h-3.5 w-3.5 text-emerald-400" />
              <span>{currentSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-zinc-200/80 pt-4 text-center">
          <div className="rounded-xl bg-white/70 p-2.5 border border-zinc-100">
            <p className="text-xs font-bold text-zinc-950 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Dual-Brake</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Instructor safety overrides
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-2.5 border border-zinc-100">
            <p className="text-xs font-bold text-zinc-950 flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>98% Pass Rate</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              First attempt at ICBC
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-2.5 border border-zinc-100">
            <p className="text-xs font-bold text-zinc-950 flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>Doorstep Pickup</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Surrey, Delta, Langley
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-2.5 border border-zinc-100">
            <p className="text-xs font-bold text-zinc-950 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>ICBC Licensed</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              BC Motor Vehicle Act
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
