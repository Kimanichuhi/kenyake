import guide1 from "@/assets/guide-1.jpg";
import guide2 from "@/assets/guide-2.jpg";
import foodNyama from "@/assets/food-nyama.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import culturalCeremony from "@/assets/cultural-ceremony.jpg";
import expBeadwork from "@/assets/exp-beadwork.jpg";
import coworking from "@/assets/coworking.jpg";
import destDiani from "@/assets/dest-diani.jpg";
import destLamu from "@/assets/dest-lamu.jpg";

export interface Guide {
  id: string;
  name: string;
  photo: string;
  bio: string;
  languages: string[];
  specializations: string[];
  certifications: string[];
  rating: number;
  reviews: number;
  yearsExperience: number;
  location: string;
  pricePerDay: string;
  responseTime: string;
  available: boolean;
}

export interface CulturalEvent {
  id: string;
  title: string;
  community: string;
  county: string;
  date: string;
  month: string;
  type: "ceremony" | "festival" | "market" | "celebration";
  description: string;
  image: string;
  capacity: number;
  spotsLeft: number;
  price: string;
  etiquette: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  type: "restaurant" | "street-food" | "home-dining" | "market";
  county: string;
  cuisine: string[];
  dietary: string[];
  rating: number;
  reviews: number;
  priceRange: "$" | "$$" | "$$$";
  image: string;
  specialties: string[];
  safetyRating: number;
}

export interface CoworkingSpace {
  id: string;
  name: string;
  city: string;
  image: string;
  internetSpeed: string;
  pricePerDay: string;
  pricePerMonth: string;
  amenities: string[];
  rating: number;
}

export interface EmergencyContact {
  type: string;
  name: string;
  number: string;
  description: string;
}

export const guides: Guide[] = [
  {
    id: "david-ole",
    name: "David Ole Sankale",
    photo: guide1,
    bio: "Born and raised in the Maasai Mara, David has been guiding safaris for over 15 years. His deep knowledge of wildlife behavior and Maasai culture provides an unparalleled experience.",
    languages: ["English", "Swahili", "Maasai", "German"],
    specializations: ["Wildlife Safari", "Big Five Tracking", "Photography", "Night Drives"],
    certifications: ["KWS Bronze Guide", "First Aid Certified", "4WD Advanced"],
    rating: 4.9,
    reviews: 342,
    yearsExperience: 15,
    location: "Maasai Mara",
    pricePerDay: "$120",
    responseTime: "< 1 hour",
    available: true,
  },
  {
    id: "faith-wanjiku",
    name: "Faith Wanjiku",
    photo: guide2,
    bio: "Faith is a passionate birder and nature guide specializing in Mount Kenya treks and forest walks. She combines scientific knowledge with storytelling.",
    languages: ["English", "Swahili", "French"],
    specializations: ["Birding", "Hiking", "Forest Ecology", "Cultural Heritage"],
    certifications: ["KWS Silver Guide", "Mountain Rescue", "Wilderness First Responder"],
    rating: 4.8,
    reviews: 189,
    yearsExperience: 8,
    location: "Mount Kenya Region",
    pricePerDay: "$95",
    responseTime: "< 2 hours",
    available: true,
  },
  {
    id: "omar-ali",
    name: "Omar Ali Hassan",
    photo: guide1,
    bio: "A sixth-generation Lamu resident, Omar offers authentic Swahili coast experiences including dhow sailing, historical tours, and marine wildlife excursions.",
    languages: ["English", "Swahili", "Arabic", "Italian"],
    specializations: ["Coastal Heritage", "Dhow Sailing", "Marine Wildlife", "History"],
    certifications: ["PADI Divemaster", "First Aid", "Boat Captain License"],
    rating: 4.7,
    reviews: 156,
    yearsExperience: 12,
    location: "Lamu Island",
    pricePerDay: "$85",
    responseTime: "< 3 hours",
    available: false,
  },
];

export const culturalEvents: CulturalEvent[] = [
  {
    id: "maasai-warrior-graduation",
    title: "Maasai Warrior Graduation Ceremony",
    community: "Maasai of Narok",
    county: "Narok County",
    date: "March 15-17, 2026",
    month: "March",
    type: "ceremony",
    description: "Witness the sacred eunoto ceremony where junior warriors graduate to senior warrior status. This rare event happens once every 10-15 years and includes traditional songs, dances, and rituals.",
    image: culturalCeremony,
    capacity: 50,
    spotsLeft: 12,
    price: "$150",
    etiquette: ["No flash photography during rituals", "Dress modestly", "Follow guide instructions", "Gifts for elders appreciated"],
  },
  {
    id: "lamu-cultural-festival",
    title: "Lamu Cultural Festival",
    community: "Lamu Heritage Council",
    county: "Lamu County",
    date: "November 20-24, 2026",
    month: "November",
    type: "festival",
    description: "East Africa's largest cultural festival celebrating Swahili heritage through donkey races, dhow sailing competitions, traditional music, poetry, and henna art.",
    image: destLamu,
    capacity: 500,
    spotsLeft: 280,
    price: "Free Entry",
    etiquette: ["Respect prayer times", "Modest dress required", "Photography allowed", "Engage with artisans"],
  },
  {
    id: "kikuyu-harvest",
    title: "Kikuyu Harvest Thanksgiving",
    community: "Kikuyu Highlands Farmers",
    county: "Nyeri County",
    date: "April 5, 2026",
    month: "April",
    type: "celebration",
    description: "Join the community in celebrating the harvest season with traditional foods, dances, and songs of gratitude. Participate in cooking and farm activities.",
    image: expCooking,
    capacity: 30,
    spotsLeft: 8,
    price: "$45",
    etiquette: ["Participate actively", "Try all foods offered", "Ask before photographing individuals", "Bring a small gift"],
  },
  {
    id: "samburu-beading-market",
    title: "Samburu Beading Market Day",
    community: "Samburu Women's Cooperative",
    county: "Samburu County",
    date: "Every Saturday",
    month: "Year-round",
    type: "market",
    description: "Weekly market where Samburu women sell handcrafted beadwork, learn beading techniques, and share stories of their craft's cultural significance.",
    image: expBeadwork,
    capacity: 100,
    spotsLeft: 100,
    price: "Free Entry",
    etiquette: ["Negotiate respectfully", "Ask permission to photograph", "Support by purchasing", "Learn about the patterns"],
  },
];

export const restaurants: Restaurant[] = [
  {
    id: "carnivore",
    name: "The Carnivore",
    type: "restaurant",
    county: "Nairobi",
    cuisine: ["Kenyan", "BBQ", "Game Meat"],
    dietary: ["Meat-heavy", "Some Vegetarian"],
    rating: 4.6,
    reviews: 2340,
    priceRange: "$$$",
    image: foodNyama,
    specialties: ["Nyama Choma", "Crocodile", "Ostrich", "Game Platter"],
    safetyRating: 5,
  },
  {
    id: "mama-oliech",
    name: "Mama Oliech",
    type: "restaurant",
    county: "Nairobi",
    cuisine: ["Kenyan", "Luo", "Fish"],
    dietary: ["Fish", "Some Vegetarian"],
    rating: 4.7,
    reviews: 1890,
    priceRange: "$$",
    image: expCooking,
    specialties: ["Tilapia", "Ugali", "Sukuma Wiki", "Omena"],
    safetyRating: 4,
  },
  {
    id: "ali-barbour",
    name: "Ali Barbour's Cave Restaurant",
    type: "restaurant",
    county: "Kwale",
    cuisine: ["Seafood", "International", "Swahili"],
    dietary: ["Seafood", "Vegetarian Options"],
    rating: 4.8,
    reviews: 780,
    priceRange: "$$$",
    image: destDiani,
    specialties: ["Lobster", "Prawns", "Cave Dining Experience"],
    safetyRating: 5,
  },
  {
    id: "kosewe",
    name: "K'Osewe Ranalo Foods",
    type: "restaurant",
    county: "Nairobi",
    cuisine: ["Kenyan", "Traditional"],
    dietary: ["Meat", "Fish", "Vegetarian"],
    rating: 4.5,
    reviews: 1560,
    priceRange: "$",
    image: foodNyama,
    specialties: ["Ugali Mayai", "Fish Stew", "Matumbo"],
    safetyRating: 4,
  },
];

export const coworkingSpaces: CoworkingSpace[] = [
  {
    id: "nairobi-garage",
    name: "Nairobi Garage",
    city: "Nairobi",
    image: coworking,
    internetSpeed: "100 Mbps",
    pricePerDay: "$25",
    pricePerMonth: "$350",
    amenities: ["Meeting Rooms", "Phone Booths", "Coffee Bar", "Rooftop", "24/7 Access"],
    rating: 4.7,
  },
  {
    id: "ihub",
    name: "iHub",
    city: "Nairobi",
    image: coworking,
    internetSpeed: "150 Mbps",
    pricePerDay: "$20",
    pricePerMonth: "$300",
    amenities: ["Events Space", "Mentorship", "Coffee", "Printing", "Networking"],
    rating: 4.6,
  },
  {
    id: "swahili-box",
    name: "Swahili Box",
    city: "Mombasa",
    image: coworking,
    internetSpeed: "80 Mbps",
    pricePerDay: "$15",
    pricePerMonth: "$200",
    amenities: ["Ocean View", "AC", "Coffee", "Parking", "Meeting Room"],
    rating: 4.5,
  },
];

export const emergencyContacts: EmergencyContact[] = [
  { type: "Police", name: "Kenya Police Emergency", number: "999 / 112", description: "National emergency police line" },
  { type: "Medical", name: "St. John Ambulance", number: "+254 20 2210000", description: "Nationwide ambulance service" },
  { type: "Medical", name: "AMREF Flying Doctors", number: "+254 20 6992000", description: "Emergency air evacuation" },
  { type: "Wildlife", name: "KWS Emergency", number: "+254 800 597 000", description: "Wildlife emergencies & poaching reports" },
  { type: "Fire", name: "Fire Brigade", number: "999 / 112", description: "Fire and rescue services" },
  { type: "Embassy", name: "US Embassy Nairobi", number: "+254 20 363 6000", description: "American citizen services" },
  { type: "Embassy", name: "UK High Commission", number: "+254 20 284 4000", description: "British citizen services" },
  { type: "Tourism", name: "Kenya Tourism Board", number: "+254 20 271 1262", description: "Tourist assistance" },
];

export const safetyAdvisories = [
  { region: "Nairobi", level: "Normal", message: "Standard precautions advised. Avoid walking alone at night in unfamiliar areas." },
  { region: "Maasai Mara", level: "Low Risk", message: "Safe for tourism. Follow park rules and guide instructions." },
  { region: "Coastal Region", level: "Normal", message: "Safe for tourism. Be aware of ocean conditions." },
  { region: "Northern Kenya", level: "Caution", message: "Some areas require permits. Travel with reputable operators." },
];
