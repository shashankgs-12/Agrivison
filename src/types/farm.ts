export interface FarmBoundary {
  type: "Polygon";
  coordinates: Array<[number, number]>;
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  boundary: FarmBoundary;
  area: number;
  perimeter: number;
  soilType?: string;
  waterSource?: string;
  createdAt: string;
  updatedAt: string;
}
