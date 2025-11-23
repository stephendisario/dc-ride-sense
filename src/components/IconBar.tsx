"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faStar, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { IconButton } from "@shared/types";
import { Dispatch, SetStateAction } from "react";
import { PanelHeader } from "./PanelHeader";

export type IconConfig = {
  name: IconButton;
  icon: IconDefinition;
  label: string;
};

type IconBarProps = {
  iconNameArray: IconButton[];
  activeIconButton: IconButton;
  setActiveIconButton: Dispatch<SetStateAction<IconButton>>;
  barType: "TIME" | "MAP";
};

const iconBarConfig: IconConfig[] = [
  { name: "EVENTS", icon: faStar, label: "Events" },
  { name: "CALENDAR", icon: faCalendar, label: "Calendar" },
  { name: "LAYERS", icon: faLayerGroup, label: "Layers" },
];

export default function IconBar({
  iconNameArray,
  activeIconButton,
  setActiveIconButton,
  barType,
}: IconBarProps) {
  return (
    <div className="flex flex-row justify-between border-b border-slate-200">
      <PanelHeader
        label={barType === "TIME" ? "When" : "What"}
        title={barType === "TIME" ? "Date & Time" : "Layers & Providers"}
      />
      <span className="justify-around flex items-center rounded px-2 py-1.5 text-xs text-gray-700 ">
        {iconBarConfig
          .filter((item) => iconNameArray.includes(item.name))
          .map((item) => {
            const isActive = activeIconButton === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveIconButton(activeIconButton === item.name ? "" : item.name)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium  transition hover:cursor-pointer
              ${isActive ? "bg-lime-500 border-lime-600 text-white" : "text-gray-700"}`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-1" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
      </span>
    </div>
  );
}
