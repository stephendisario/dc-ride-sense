"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import IntroModal from "@/components/IntroModal"; // adjust path if needed

const Header = () => {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <div className="absolute left-0 top-0 z-10 ml-6 mt-6">
        <div className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-slate-800 shadow-md">
          {/* Title + subtitle + info icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  DC Ride Sense
                </span>
              </div>
              <span className="text-[10px] text-slate-600">
                Hourly dockless vehicle patterns across DC
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="mt-[2px] text-slate-500 hover:text-slate-600 cursor-pointer"
              aria-label="About DC Ride Sense"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
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
