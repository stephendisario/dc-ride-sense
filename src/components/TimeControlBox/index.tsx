"use client";
import DatePicker from "./DatePicker";
import Slider from "./Slider";

export default function TimeControlBox() {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 w-[370px] space-y-3 rounded-lg border
                 border-gray-300 bg-white/85 p-3 shadow-sm backdrop-blur-sm"
    >
      <DatePicker />
      <Slider />
    </div>
  );
}
