"use client";
import fs from "fs";
import { polygonToCells, cellToBoundary } from "h3-js";

const createh3Layer = () => {
  const dc = JSON.parse(fs.readFileSync("./Washington_DC_Boundary.geojson", "utf8"));

  const RES = 9;

  const cells = polygonToCells(dc.features[0].geometry.coordinates[0], RES, true);

  const features = cells.map((h3) => {
    const ring = cellToBoundary(h3, true); // [[lat,lng],...] (geo order)
    return {
      type: "Feature",
      id: h3, // important for feature-state
      properties: { h3 },
      geometry: { type: "Polygon", coordinates: [ring] },
    };
  });

  fs.writeFileSync(
    "./dc-h3-res10.json",
    JSON.stringify({
      type: "FeatureCollection",
      features,
    })
  );
};

createh3Layer();
