"use client";
import DatePicker from "./DatePicker";
import Slider from "./Slider";

export default function TimeControlBox() {
  return (
    <div
      className="
        absolute z-10
        bottom-3 left-1/2 -translate-x-1/2          /* mobile: bottom-centered */
        sm:bottom-4 sm:left-4 sm:translate-x-0      /* sm+: bottom-left */
        w-[min(100vw-1.5rem,380px)] sm:w-[370px]
        max-h-[70vh] overflow-y-auto                /* don't run off top on small screens */
        space-y-3 rounded-lg border border-gray-300
        bg-white/85 p-3 shadow-sm backdrop-blur-sm
      "
    >
      <DatePicker />
      <Slider />
    </div>
  );
}
