export interface Destination {
  id: string;
  dbId: string;
  name: string;
  county: string;
  image: string;
  gallery: string[];
  category: string;
  rating: number;
  reviews: number;
  crowdLevel: string;
  bestTime: string;
  price: string;
  description: string;
  highlights: string[];
  safetyRating: number;
  accessibilityRating: number;
  photographyScore: number;
  lat: number;
  lng: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Experience {
  id: string;
  title: string;
  host: string;
  image: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  tag: string;
  description: string;
  destinationId?: string;
}
