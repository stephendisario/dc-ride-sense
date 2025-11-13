"use client";
import { useView } from "@/stores/views";

const Header = () => {
  const { hourTripEstimate } = useView();
  return (
    <div className="absolute top-0 ml-2 mt-2">
      <div className="w-md bg-black opacity-80 rounded-md p-2 flex flex-col">
        <div className="flex flex-row text-white font-bold text-xl justify-between">
          DC Ride Sense <br />
          {hourTripEstimate} estimated rides
        </div>
      </div>
    </div>
  );
};

export default Header;
