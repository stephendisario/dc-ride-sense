import { create } from "zustand";
import { Providers } from "@shared/types";

type ProviderState = {
  selectedProviders: Providers[];
  setSelectedProviders: (providers: Providers[]) => void;
  availableProviders: Providers[];
  setAvailableProviders: (providers: Providers[]) => void;
  toggleProvider: (provider: Providers) => void;
};

export const useProviderStore = create<ProviderState>((set) => ({
  selectedProviders: [],
  setSelectedProviders: (availableProviders) =>
    set((state) => ({
      selectedProviders:
        state.selectedProviders.length === 0 ? availableProviders : state.selectedProviders,
    })),
  availableProviders: [],
  setAvailableProviders: (availableProviders) => set({ availableProviders }),
  toggleProvider: (provider) =>
    set((state) => {
      const isSelected = state.selectedProviders.includes(provider);
      return {
        selectedProviders: isSelected
          ? state.selectedProviders.filter((p) => p !== provider)
          : [...state.selectedProviders, provider],
      };
    }),
}));
