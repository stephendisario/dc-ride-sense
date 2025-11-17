"use client";
import { useState } from "react";
import { useView } from "@/stores/views";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { HexLayerType } from "@shared/types";
import { DC_LAYERS, HEX_LAYERS } from "@shared/constants";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";

const Layers = () => {
  const { activeHexLayer, setActiveHexLayer, activeDCLayers, toggleDCLayer } = useView();

  useLayerVisibility();

  const [open, setOpen] = useState(true);

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
            {DC_LAYERS.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => toggleDCLayer(layer)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition hover:cursor-pointer
                  ${
                    activeDCLayers.includes(layer)
                      ? "bg-lime-500 border-lime-600 text-white"
                      : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                  }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom row: Hex Layer (single-select) */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Hex Layer
          </p>
          <div className="flex gap-2">
            {HEX_LAYERS.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setHexLayer(layer)}
                className={`flex-1 rounded-full px-2.5 py-1 text-xs font-medium border transition text-center hover:cursor-pointer
                  ${
                    activeHexLayer === layer
                      ? "bg-lime-500 border-lime-600 text-white"
                      : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                  }`}
              >
                {layer.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layers;
