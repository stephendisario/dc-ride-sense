"use client";
import "react-day-picker/style.css";
import { HexLayerType, useView } from "@/stores/views";

const Layers = () => {
  const { activeHexLayer, setActiveHexLayer } = useView();

  const inactiveLayer =
    activeHexLayer === HexLayerType.DELTA ? HexLayerType.DENSITY : HexLayerType.DELTA;

  return (
    <button
      className="flex items-center justify-between rounded border border-gray-300 px-3 py-1.5
                      bg-white/40 backdrop-blur-sm text-sm font-medium text-gray-800"
      onClick={() => setActiveHexLayer(inactiveLayer)}
    >
      Switch To {inactiveLayer.charAt(0).toUpperCase() + inactiveLayer.slice(1).toLowerCase()}
    </button>
  );
};

export default Layers;
