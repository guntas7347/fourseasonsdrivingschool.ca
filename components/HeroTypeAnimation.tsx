"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";

export default function HeroTypeAnimation() {
  return (
    <TypeAnimation
      sequence={[
        "First-Time Road Test Success.",
        2500,
        "ICBC Class 5 & 7N Mastery.",
        2500,
        "Dual-Brake Safety Confidence.",
        2500,
        "Calm Coaching for Nervous Drivers.",
        2500,
      ]}
      wrapper="span"
      speed={45}
      deletionSpeed={65}
      repeat={Infinity}
      cursor={true}
      className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-emerald-800 to-teal-700 inline-block"
    />
  );
}
