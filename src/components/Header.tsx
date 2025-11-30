"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import IntroModal from "@/components/IntroModal"; // adjust path if needed
import Image from "next/image";

const Header = () => {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <div className="absolute left-4 top-4 z-10">
        <div className="rounded-lg border border-gray-300 bg-white/95 px-3 py-2 text-[13px] text-slate-700 shadow-md backdrop-blur-sm w-[370px]">
          {/* Title + subtitle + info icon */}
          <div className="inline-flex w-full items-center gap-2">
            <Image src="/icon.jpg" alt="DC Ride Sense logo" width={60} height={60} />
            <span className="h-12 w-px bg-gray-200" />

            <div className="flex flex-1 flex-col">
              <span className="text-[15px] font-semibold tracking-tight text-slate-800">
                DC Ride Sense
              </span>
              <span className="text-[12px] text-slate-500">Explore micromobility patterns</span>
            </div>

            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="flex ml-auto items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1.5 text-slate-700 shadow-sm transition hover:cursor-pointer hover:bg-slate-50"
              aria-label="About DC Ride Sense"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Intro modal, opened from header or auto-opened on first visit */}
      <IntroModal manualOpen={showIntro} onCloseManual={() => setShowIntro(false)} />
    </>
  );
};

export default Header;
