"use client";
import { useEffect, useState } from "react";

export const useIsMdUp = () => {
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 806px)");

    const update = () => setIsMdUp(query.matches);
    update();

    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMdUp;
};
