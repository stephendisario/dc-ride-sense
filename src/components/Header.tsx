"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import IntroModal from "@/components/IntroModal";
import Image from "next/image";

const Header = () => {
  const [showIntro, setShowIntro] = useState(false);

  return (
    <>
      <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
        {/* MOBILE: logo-only */}
        <button
          type="button"
          onClick={() => setShowIntro(true)}
          className="block rounded-full border border-gray-300 bg-white/95 p-1.5 shadow-md backdrop-blur-sm sm:hidden"
          aria-label="About DC Ride Sense"
        >
          <Image
            src="/icon.jpg"
            alt="DC Ride Sense logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </button>

        {/* DESKTOP/TABLET: full header */}
        <div className="hidden sm:block">
          <div className="w-[370px] rounded-lg border border-gray-300 bg-white/95 px-3 py-2 text-[13px] text-slate-700 shadow-md backdrop-blur-sm">
            <div className="inline-flex w-full items-center gap-2">
              <Image
                src="/icon.jpg"
                alt="DC Ride Sense logo"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <span className="h-12 w-px bg-gray-200" />

              <div className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold tracking-tight text-slate-800">
                  DC Ride Sense
                </span>
                <span className="text-[12px] text-slate-500">
                  Explore micromobility patterns
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowIntro(true)}
                className="ml-auto flex items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1.5 text-slate-700 shadow-sm transition hover:cursor-pointer hover:bg-slate-50"
                aria-label="About DC Ride Sense"
              >
                <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <IntroModal manualOpen={showIntro} onCloseManual={() => setShowIntro(false)} />
    </>
  );
};

export default Header;
