"use client";

import { useEffect } from "react";
import { useView } from "@/stores/views";
import { HexLayerType, Providers } from "@shared/types";
import { DC_LAYERS, HEX_LAYERS } from "@shared/constants";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";
import { useProviderStore } from "@/stores/provider";
import { isBefore } from "date-fns";

export const providerColorClasses: Record<Providers, { selected: string; unselected: string }> = {
  [Providers.LIME]: {
    selected: "bg-lime-500 border-lime-600 text-white",
    unselected: "border-lime-500 text-lime-600 bg-white/90 hover:bg-lime-50",
  },
  [Providers.VEO]: {
    selected: "bg-teal-500 border-teal-600 text-white",
    unselected: "border-teal-500 text-teal-600 bg-white/90 hover:bg-teal-50",
  },
  [Providers.HOPP]: {
    selected: "bg-[#32bb78] border-[#4F946B] text-white",
    unselected: "border-[#32bb78] text-[#258d5b] bg-white/90 hover:bg-[#E6F3EB]",
  },
};

// churn is only valid once VEO AND HOPP data is available
const CHURN_AVAILABLE_FROM = new Date(2025, 10, 15); // 2025-11-15

const LABEL_CLASS =
  "w-[78px] shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-500";

const Layers = () => {
  const { activeHexLayer, setActiveHexLayer, activeDCLayers, toggleDCLayer, date } = useView();
  const { selectedProviders, toggleProvider, availableProviders } = useProviderStore();

  useLayerVisibility();

  const setHexLayer = (layer: HexLayerType) => {
    if (layer !== activeHexLayer) {
      setActiveHexLayer(layer);
    }
  };

  // If user is on CHURN but the current date doesn't support it, bump them to DELTA
  useEffect(() => {
    if (activeHexLayer === HexLayerType.CHURN && date && isBefore(date, CHURN_AVAILABLE_FROM)) {
      setActiveHexLayer(HexLayerType.DELTA);
    }
  }, [activeHexLayer, date, setActiveHexLayer]);

  return (
    <div className="h-[117.5px] rounded border border-gray-300 bg-white/85 px-3 py-2 text-xs font-medium text-gray-800 shadow-sm backdrop-blur-sm">
      <div className="flex h-full flex-col justify-between gap-1.5">
        {/* Providers row */}
        <div className="flex items-center gap-2">
          <p className={LABEL_CLASS}>Providers</p>
          <div className="flex flex-1 gap-1.5">
            {Object.values(Providers).map((provider) => {
              const isAvailable = availableProviders.includes(provider);
              const isChurnBlocked =
                activeHexLayer === HexLayerType.CHURN && provider === Providers.LIME;
              const isDisabled = !isAvailable || isChurnBlocked;
              const isSelected = selectedProviders.includes(provider);

              const reason = !isAvailable
                ? "No data for this provider before Nov 15, 2025."
                : isChurnBlocked
                  ? "Churn is not available for Lime."
                  : "";

              const colorClasses = providerColorClasses[provider];

              return (
                <div key={provider} className="relative group flex-1">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && toggleProvider(provider)}
                    className={`w-full rounded-full px-2.5 py-0.5 text-[11px] font-medium border text-center transition
                      ${
                        isDisabled
                          ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50"
                          : isSelected
                            ? `${colorClasses.selected} cursor-pointer`
                            : `${colorClasses.unselected} cursor-pointer`
                      }`}
                  >
                    {provider}
                  </button>

                  {isDisabled && reason && (
                    <div className="absolute right-0 bottom-full mb-1 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hex Layer row */}
        <div className="flex items-center gap-2">
          <p className={LABEL_CLASS}>Hex Layer</p>
          <div className="flex flex-1 gap-1.5">
            {HEX_LAYERS.map((layer) => {
              const isChurnLayer = layer === HexLayerType.CHURN;
              const isDisabled = isChurnLayer && date && isBefore(date, CHURN_AVAILABLE_FROM);
              const reason = isDisabled ? "Churn is only available starting Nov 15, 2025." : "";

              return (
                <div key={layer} className="relative group flex-1">
                  <button
                    disabled={isDisabled}
                    type="button"
                    onClick={() => setHexLayer(layer)}
                    className={`w-full rounded-full px-2.5 py-0.5 text-[11px] font-medium border text-center transition
                      ${
                        isDisabled
                          ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50"
                          : activeHexLayer === layer
                            ? "bg-lime-500 border-lime-600 text-white cursor-pointer"
                            : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50 cursor-pointer"
                      }`}
                  >
                    {layer.toUpperCase()}
                  </button>

                  {isDisabled && reason && (
                    <div className="absolute right-0 bottom-full mb-1 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DC Layers row */}
        <div className="flex items-center gap-2">
          <p className={LABEL_CLASS}>DC Layers</p>
          <div className="flex flex-wrap gap-1.5">
            {DC_LAYERS.map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => toggleDCLayer(layer)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition hover:cursor-pointer
                  ${
                    activeDCLayers.includes(layer)
                      ? "bg-lime-500 border-lime-600 text-white"
                      : "bg-white/80 border-gray-300 text-gray-700 hover:bg-lime-50"
                  }`}
              >
                {layer.split("_").join(" ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layers;
