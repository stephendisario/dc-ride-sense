import { DCLayerType, HexLayerType, Providers } from "@shared/types";

export const GBFS_URLS = [
    'https://data.lime.bike/api/partners/v1/gbfs/washington_dc/free_bike_status.json',
    'https://cluster-prod.veoride.com/api/shares/name/xdc/gbfs/free_bike_status',
    'https://mds.bolt.eu/gbfs/2/23/free_bike_status',
];

export const PROVIDER_CONFIG: Record<Providers, { hasChurn: boolean }> = {
    [Providers.LIME]:  { hasChurn: false },
    [Providers.VEO]:   { hasChurn: true },
    [Providers.HOPP]:  { hasChurn: true }
  };
  
  export const PROVIDERS: Providers[] = Object.values(Providers);
  
  export const PROVIDERS_WITH_CHURN = PROVIDERS.filter(
    (p) => PROVIDER_CONFIG[p].hasChurn
  );

  export const DC_LAYERS: DCLayerType[] = Object.values(DCLayerType);

  export const HEX_LAYERS: HexLayerType[] = Object.values(HexLayerType);

