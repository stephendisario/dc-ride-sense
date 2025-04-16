export interface LimeVehicle {
    bike_id: string;
    lat: number;
    lon: number;
    is_reserved: 0 | 1;
    is_disabled: 0 | 1;
    vehicle_type: string;
}

export interface LimeApiResponse {
    last_updated: number;
    data: {
        bikes: LimeVehicle[];
    };
}
