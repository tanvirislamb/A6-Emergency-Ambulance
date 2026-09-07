export type IDispatchPayload = {
  ambulanceId?: string;
  driverId?: string;
  distanceKm?: number;
  fare?: number;
};

export type ITripStatusPayload = {
  status: string;
};
