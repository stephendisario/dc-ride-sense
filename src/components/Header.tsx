"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useView } from "@/stores/views";

const Header = () => {
  const { setShowIntro } = useView();
  return (
    <div className="z-10 pointer-events-auto inline-flex items-center gap-2 rounded-lg md:border md:border-gray-300 md:bg-white/95 py-1.5 md:px-3 md:py-2 text-[13px] text-slate-700 md:shadow-md md:backdrop-blur-sm">
      <Image
        src="/icon.jpg"
        alt="DC Ride Sense logo"
        width={60}
        height={60}
        onClick={() => setShowIntro(true)}
        className="cursor-pointer"
      />
      <div className="hidden md:inline-flex items-center gap-2">
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
          className="w-8 h-8 flex ml-auto items-center justify-center rounded-full border border-gray-300 bg-white/90 p-1.5 text-slate-700 shadow-sm transition hover:cursor-pointer hover:bg-slate-50"
          aria-label="About DC Ride Sense"
        >
          <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Header;
