"use client";
import DatePicker from "./DatePicker";
import Slider from "./Slider";
import EventsPanel from "./EventList";
import IconBar from "../IconBar";
import Calendar from "./Calendar";
import { useState } from "react";
import { IconButton } from "@shared/types";

export default function TimeControlBox() {
  const [activeIconButton, setActiveIconButton] = useState<IconButton>("");

  return (
    <div
      className="absolute bottom-0 left-0 z-10 mb-8 ml-6 w-[370px] space-y-3 rounded-lg border
                 border-gray-300 bg-white/30 p-3 shadow-md backdrop-blur-md"
    >
      <div className={activeIconButton !== "CALENDAR" ? "hidden" : ""}>
        <Calendar />
      </div>

      <div className={activeIconButton !== "EVENTS" ? "hidden" : ""}>
        <EventsPanel />
      </div>

      <IconBar
        iconNameArray={["CALENDAR", "EVENTS"]}
        activeIconButton={activeIconButton}
        setActiveIconButton={setActiveIconButton}
        barType="TIME"
      />

      <DatePicker />
      <Slider />
    </div>
  );
}
