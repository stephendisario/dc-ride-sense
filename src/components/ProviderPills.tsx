import { Providers, HexLayerType } from "@shared/types";
import { useProviderStore } from "@/stores/provider";
import { useView } from "@/stores/views";

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

const ProviderPills = () => {
  const { activeHexLayer } = useView();
  const { selectedProviders, toggleProvider, availableProviders } = useProviderStore();

  return (
    <div className="fixed  z-20">
      <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Providers
        </span>

        <div className="flex gap-2">
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
              <div key={provider} className="relative group">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && toggleProvider(provider)}
                  className={`
          rounded-full px-3.5 py-1 text-sm font-medium border transition
          ${
            isDisabled
              ? "bg-gray-100 border-gray-200 text-gray-400 opacity-50"
              : isSelected
                ? `${colorClasses.selected} cursor-pointer`
                : `${colorClasses.unselected} cursor-pointer`
          }
        `}
                >
                  {provider}
                </button>

                {isDisabled && reason && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap
                     rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0
                     group-hover:opacity-100"
                  >
                    {reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProviderPills;
