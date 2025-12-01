import { DCLayerType, HexLayerType, IconButton } from "@shared/types";
import { subDays, startOfMonth } from "date-fns";
import { Map } from "mapbox-gl";
import { create } from "zustand";

type ViewState = {
  date: Date;
  hour: number;
  setDate: (d: Date) => void;
  setHour: (h: number) => void;
  hourTripEstimate: number;
  setHourTripEstimate: (t: number) => void;
  isMapLoading: boolean;
  setIsMapLoading: (l: boolean) => void;
  activeHexLayer: HexLayerType;
  setActiveHexLayer: (layerId: HexLayerType) => void;
  interestingHours: number[];
  setInterestingHours: (hours: number[]) => void;
  map: Map | null;
  setMap: (map: Map) => void;
  activeDCLayers: DCLayerType[];
  setActiveDCLayers: (layers: DCLayerType[]) => void;
  toggleDCLayer: (layer: DCLayerType) => void;
  month: Date;
  setMonth: (m: Date) => void;
  activeIconButton: IconButton;
  setActiveIconButton: (button: IconButton) => void;
  showIntro: boolean;
  setShowIntro: (intro: boolean) => void;
};

export const useView = create<ViewState>((set) => ({
  date: subDays(new Date(), 1),
  hour: 9,
  setDate: (date) => set({ date }),
  setHour: (hour) => set({ hour }),
  hourTripEstimate: 0,
  setHourTripEstimate: (hourTripEstimate) => set({ hourTripEstimate }),
  isMapLoading: true,
  setIsMapLoading: (isMapLoading) => set({ isMapLoading }),
  activeHexLayer: HexLayerType.DELTA,
  setActiveHexLayer: (activeHexLayer) => set({ activeHexLayer }),
  interestingHours: [],
  setInterestingHours: (hours) => set({ interestingHours: hours }),
  map: null,
  setMap: (map) => set({ map }),
  activeDCLayers: [],
  setActiveDCLayers: (activeDCLayers) => ({ activeDCLayers }),
  toggleDCLayer: (layer) =>
    set((state) => {
      const isSelected = state.activeDCLayers.includes(layer);
      return {
        activeDCLayers: isSelected
          ? state.activeDCLayers.filter((p) => p !== layer)
          : [...state.activeDCLayers, layer],
      };
    }),
  month: startOfMonth(new Date()),
  setMonth: (month) => set({ month }),
  activeIconButton: "SPARKLINE",
  setActiveIconButton: (activeIconButton) => set({ activeIconButton }),
  showIntro: false,
  setShowIntro: (showIntro) => set({ showIntro }),
}));
