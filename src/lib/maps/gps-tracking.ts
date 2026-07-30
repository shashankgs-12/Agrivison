export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export class GPSService {
  private watchId: number | null = null;

  public startTracking(
    onPosition: (pos: GPSPosition) => void,
    onError: (err: GeolocationPositionError) => void
  ) {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  public stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
