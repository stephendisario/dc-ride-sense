"use client";
import "react-day-picker/style.css";
import { HexLayerType, useView } from "@/stores/views";

const Controls = () => {
  const { activeHexLayer, setActiveHexLayer } = useView();

  const inactiveLayer =
    activeHexLayer === HexLayerType.DELTA ? HexLayerType.DENSITY : HexLayerType.DELTA;

  return (
    <div className="absolute bottom-0 left-0 z-10 mb-30 ml-2">
      <button
        className="ml-2 rounded border px-2 py-1 hover:cursor-pointer"
        onClick={() => setActiveHexLayer(inactiveLayer)}
      >
        Switch To {inactiveLayer.charAt(0).toUpperCase() + inactiveLayer.slice(1).toLowerCase()}
      </button>
    </div>
  );
};

export default Controls;
