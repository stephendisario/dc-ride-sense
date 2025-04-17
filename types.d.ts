type Snapshot = {
    [timestamp: string]: {
      [zoneId: string]: number;
    };
  };

type ZoneType = "1000m" | "300m"

declare module '*.geojson' {
  const value: any;
  export default value;
}