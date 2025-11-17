"use client";
import Layers from "./Layers";
import DatePicker from "./DatePicker";
import Slider from "./Slider";
import { useUpdateMapStyleOnChange } from "@/hooks/useUpdateMapStyleOnChange";
import { useSnapshotsWithProviders } from "@/hooks/useSnapshotsWithProviders";

export default function ControlBox() {
  useUpdateMapStyleOnChange();
  useSnapshotsWithProviders();

  return (
    <div
      className="absolute bottom-0 left-0 z-10 mb-8 ml-2 p-3
                    bg-white/30 backdrop-blur-md border border-gray-300
                    rounded-lg shadow-md space-y-3 w-[370px]"
    >
      <Layers />
      <DatePicker />
      <Slider />
    </div>
  );
}
