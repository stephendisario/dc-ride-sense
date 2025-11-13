import { subDays } from "date-fns";
import { create } from "zustand";

export enum HexLayerType {
  DELTA = "DELTA",
  DENSITY = "DENSITY",
}
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
}));
