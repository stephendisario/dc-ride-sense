"use client";
import { format } from "date-fns";
import { useView } from "@/stores/views";
import { useInterestingHours } from "@/hooks/useInterestingHours";

export default function Slider() {
  const { hour, setHour, interestingHours } = useView();

  useInterestingHours();

  const presetHours = interestingHours.length ? interestingHours : [9, 18, 22];

  const presetButtons = presetHours
    .sort((a, b) => a - b)
    .map((h) => ({
      value: h,
      label: format(new Date(0, 0, 0, h), "h a"), // "9 AM", "6 PM", ...
    }));

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:00 ${ampm}`;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-center gap-4 text-xs text-gray-700 px-1">
        {presetButtons.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setHour(p.value)}
            className={`px-2.5 py-0.5 rounded-full border transition text-xs hover: cursor-pointer
          ${
            hour === p.value
              ? "bg-lime-500 border-lime-600 text-white"
              : "bg-white/70 border-gray-300 text-gray-700 hover:bg-lime-50"
          }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min="1"
        max="23"
        step="1"
        value={hour}
        onChange={(e) => setHour(parseInt(e.target.value))}
        className="w-full accent-lime-500 h-1.5 bg-gray-200/40 rounded-lg cursor-pointer"
      />

      <p className="text-center text-sm font-medium text-gray-800 mt-1">{formatHour(hour)}</p>
    </div>
  );
}
