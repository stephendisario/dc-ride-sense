"use client";

import { useState } from "react";
import { HexLayerType, useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const Layers = () => {
  const { activeHexLayer, setActiveHexLayer } = useView();

  const [showMetroLayer, setShowMetroLayer] = useState(false);
  const [showBikeLanesLayer, setShowBikeLanesLayer] = useState(false);

  const [open, setOpen] = useState(false);

  const toggleMetro = () => setShowMetroLayer(!showMetroLayer);
  const toggleBikeLanes = () => setShowBikeLanesLayer(!showBikeLanesLayer);

  const setHexLayer = (layer: HexLayerType) => {
    if (layer !== activeHexLayer) {
      setActiveHexLayer(layer);
    }
  };

  return (
    <div className="rounded border border-gray-300 bg-white/40 backdrop-blur-sm text-sm text-gray-800 shadow-sm">
      {/* Header / toggle row */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-3 py-1.5"
      >
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faLayerGroup} className="text-gray-700" />
          <span className="font-medium">Layers</span>
        </span>
        <FontAwesomeIcon icon={!open ? faChevronUp : faChevronDown} className="text-gray-500" />
      </button>

      {/* Slide-down content */}
      <div
        className={`grid overflow-hidden transition-all duration-200 ease-out ${
          open
            ? "max-h-40 opacity-100 px-3 pb-3 pt-1 gap-2"
            : "max-h-0 opacity-0 px-3 pb-0 pt-0 gap-0"
        }`}
      >
        {/* Top row: DC Layers (multi-select) */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            DC Layers
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleMetro}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition hover:cursor-pointer
                ${
                  showMetroLayer
                    ? "bg-lime-500 border-lime-600 text-white"
                    : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                }`}
            >
              Metro
            </button>
            <button
              type="button"
              onClick={toggleBikeLanes}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition hover:cursor-pointer
                ${
                  showBikeLanesLayer
                    ? "bg-lime-500 border-lime-600 text-white"
                    : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                }`}
            >
              Bike Lanes
            </button>
          </div>
        </div>

        {/* Bottom row: Hex Layer (single-select) */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Hex Layer
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHexLayer(HexLayerType.DELTA)}
              className={`flex-1 rounded-full px-2.5 py-1 text-xs font-medium border transition text-center hover:cursor-pointer
                ${
                  activeHexLayer === HexLayerType.DELTA
                    ? "bg-lime-500 border-lime-600 text-white"
                    : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                }`}
            >
              Delta
            </button>
            <button
              type="button"
              onClick={() => setHexLayer(HexLayerType.DENSITY)}
              className={`flex-1 rounded-full px-2.5 py-1 text-xs font-medium border transition text-center hover:cursor-pointer
                ${
                  activeHexLayer === HexLayerType.DENSITY
                    ? "bg-lime-500 border-lime-600 text-white"
                    : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                }`}
            >
              Density
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layers;
