"use client";
import { useView } from "@/stores/views";
import Calendar from "./Calendar";
import DatePicker from "./DatePicker";
import EventsPanel from "./EventList";
import Slider from "./Slider";

export default function TimeControlBox() {
  const { activeIconButton } = useView();
  return (
    <div
      className="
        z-10 pointer-events-auto w-[370px] space-y-3 rounded-lg border
        border-gray-300 bg-white/85 p-3 shadow-sm backdrop-blur-sm
        flex flex-col"
    >
      <div className={`${activeIconButton !== "EVENTS" ? "hidden" : ""} order-3 md:order-1`}>
        <EventsPanel />
      </div>

      <div className={`${activeIconButton !== "CALENDAR" ? "hidden" : ""} order-3 md:order-1`}>
        <Calendar />
      </div>

      <div className="order-1 md:order-2">
        <DatePicker />
      </div>

      <div className="order-2 md:order-3">
        <Slider />
      </div>
    </div>
  );
}
