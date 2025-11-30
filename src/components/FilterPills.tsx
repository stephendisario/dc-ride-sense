"use client";

import { Providers, HexLayerType, DCLayerType } from "@shared/types";
import { useProviderStore } from "@/stores/provider";
import { useView } from "@/stores/views";
import { faBicycle, faTrainSubway } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DC_LAYERS } from "@shared/constants";
import { useLayerVisibility } from "@/hooks/useLayerVisibility";

const providerColorClasses: Record<Providers, { selected: string; unselected: string }> = {
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

const FilterPills = () => {
  const { activeHexLayer, activeDCLayers, toggleDCLayer } = useView();
  const { selectedProviders, toggleProvider, availableProviders } = useProviderStore();

  useLayerVisibility();

  return (
    <div
      className="
        fixed z-20
        top-3 right-3                         /* mobile: top-right, opposite the logo */
        sm:top-4 sm:left-1/2 sm:right-auto    /* sm+: centered */
        sm:-translate-x-1/2
      "
    >
      <div className="flex items-center gap-3 rounded-full border border-gray-300 bg-white/85 px-2.5 py-1 shadow-sm backdrop-blur-sm sm:px-3">
        {/* Providers */}
        <div className="flex items-center justify-center gap-1.5">
          {Object.values(Providers).map((provider) => {
            const isAvailable = availableProviders.includes(provider);
            const isChurnBlocked =
              activeHexLayer === HexLayerType.CHURN && provider === Providers.LIME;
            const isDisabled = !isAvailable || isChurnBlocked;
            const isSelected = selectedProviders.includes(provider);

            const reason = !isAvailable
              ? "No data for this provider before 11-15-2025."
              : isChurnBlocked
                ? "Churn is not available for Lime."
                : "";

            const colorClasses = providerColorClasses[provider];

            return (
              <div key={provider} className="relative flex">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && toggleProvider(provider)}
                  className={`peer rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition
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
                  <div className="pointer-events-none absolute left-0 top-full mt-1 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-100 opacity-0 shadow-md transition-opacity peer-hover:opacity-100">
                    {reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <span className="hidden h-5 w-px bg-gray-200 sm:block" />

        {/* DC Layers icons */}
        <div className="flex items-center gap-1.5">
          {DC_LAYERS.map((layer) => {
            const isActive = activeDCLayers.includes(layer);
            const icon = layer === DCLayerType.METRO ? faTrainSubway : faBicycle;
            return (
              <button
                key={layer}
                type="button"
                onClick={() => toggleDCLayer(layer)}
                className={`flex items-center justify-center rounded-full border p-1.5 text-slate-700 transition hover:cursor-pointer
                  ${
                    isActive
                      ? "bg-slate-700 border-slate-700 text-white"
                      : "border-gray-300 hover:bg-slate-50"
                  }`}
              >
                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterPills;
