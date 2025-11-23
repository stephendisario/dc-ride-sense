import HexLegend from "./HexLegend";
import IconBar from "../IconBar";
import Layers from "./Layers";
import { useState } from "react";
import { IconButton } from "@shared/types";

const MapControlBox = () => {
  const [activeIconButton, setActiveIconButton] = useState<IconButton>("LAYERS");

  return (
    <>
      <div
        className="absolute bottom-0 right-0 z-10 mb-8 mr-6 w-[370px] space-y-3 rounded-lg border
    border-gray-300 bg-white/30 p-3 shadow-md backdrop-blur-md "
      >
        <IconBar
          iconNameArray={[]}
          activeIconButton={activeIconButton}
          setActiveIconButton={setActiveIconButton}
          barType="MAP"
        />
        <div className={activeIconButton !== "LAYERS" ? "hidden" : ""}>
          <Layers />
        </div>

        {/* <HexLegend /> */}
      </div>
      <div className=" absolute bottom-0 right-1/2 translate-x-1/2 mb-8">
        <HexLegend />
      </div>
    </>
  );
};

export default MapControlBox;
