import destMara from "@/assets/dest-mara.jpg";
import destAmboseli from "@/assets/dest-amboseli.jpg";
import destDiani from "@/assets/dest-diani.jpg";
import destMountKenya from "@/assets/dest-mount-kenya.jpg";
import destNakuru from "@/assets/dest-nakuru.jpg";
import destLamu from "@/assets/dest-lamu.jpg";
import maraCrossing from "@/assets/mara-crossing.jpg";
import maraCamp from "@/assets/mara-camp.jpg";
import maraBalloon from "@/assets/mara-balloon.jpg";
import maraCheetah from "@/assets/mara-cheetah.jpg";
import expBeadwork from "@/assets/exp-beadwork.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import expWalking from "@/assets/exp-walking-safari.jpg";
import communityMarket from "@/assets/community-market.jpg";
import wildlifeBirds from "@/assets/wildlife-birds.jpg";

export interface Destination {
  id: string;
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

export interface Review {
  id: string;
  author: string;
  avatar: string;
  country: string;
  rating: number;
  date: string;
  text: string;
  destinationId: string;
}

export const destinations: Destination[] = [
  {
    id: "maasai-mara",
    name: "Maasai Mara",
    county: "Narok County",
    image: destMara,
    gallery: [destMara, maraCrossing, maraCamp, maraBalloon, maraCheetah],
    category: "Wildlife Safari",
    rating: 4.9,
    reviews: 2340,
    crowdLevel: "Medium",
    bestTime: "Jul — Oct",
    price: "From $120/day",
    description: "The Maasai Mara National Reserve is Kenya's most famous wildlife destination, renowned for the annual Great Wildebeest Migration when over 1.5 million wildebeest, zebra, and gazelle cross from the Serengeti. The reserve offers unparalleled Big Five viewing, dramatic river crossings, and vast golden savannah stretching to the horizon. Luxury tented camps and community conservancies provide unforgettable safari experiences while supporting local Maasai communities.",
    highlights: ["Great Wildebeest Migration", "Big Five sightings", "Hot air balloon safaris", "Maasai cultural visits", "Night game drives", "Photography safaris"],
    safetyRating: 4,
    accessibilityRating: 3,
    photographyScore: 5,
    lat: -1.4833,
    lng: 35.0000,
  },
  {
    id: "amboseli",
    name: "Amboseli National Park",
    county: "Kajiado County",
    image: destAmboseli,
    gallery: [destAmboseli, destMara, expWalking],
    category: "Wildlife & Mountains",
    rating: 4.8,
    reviews: 1890,
    crowdLevel: "Low",
    bestTime: "Jun — Sep",
    price: "From $95/day",
    description: "Amboseli is famous for its large elephant herds set against the breathtaking backdrop of Mount Kilimanjaro, Africa's highest peak. The park offers some of the best opportunities in Africa to get close to free-ranging elephants, alongside other wildlife including lions, cheetahs, and over 400 bird species. The Observation Hill provides panoramic views across the entire park and its swamplands.",
    highlights: ["Mount Kilimanjaro views", "Large elephant herds", "Observation Hill panorama", "Bird watching", "Swamp wildlife viewing", "Cultural Maasai homestays"],
    safetyRating: 5,
    accessibilityRating: 4,
    photographyScore: 5,
    lat: -2.6527,
    lng: 37.2606,
  },
  {
    id: "diani-beach",
    name: "Diani Beach",
    county: "Kwale County",
    image: destDiani,
    gallery: [destDiani, destLamu, communityMarket],
    category: "Beach & Marine",
    rating: 4.7,
    reviews: 3120,
    crowdLevel: "Medium",
    bestTime: "Dec — Mar",
    price: "From $80/day",
    description: "Diani Beach stretches for 17km along Kenya's South Coast, renowned for its pristine white sand and crystal-clear turquoise waters. Voted Africa's leading beach destination multiple times, Diani offers world-class snorkeling, diving, kitesurfing, and dolphin watching. The nearby Shimba Hills National Reserve and Colobus Conservation add wildlife encounters to your beach holiday.",
    highlights: ["White sand beaches", "Snorkeling & diving", "Kitesurfing", "Dolphin watching", "Shimba Hills excursion", "Colobus monkey conservation"],
    safetyRating: 4,
    accessibilityRating: 5,
    photographyScore: 4,
    lat: -4.3477,
    lng: 39.5682,
  },
  {
    id: "mount-kenya",
    name: "Mount Kenya",
    county: "Nyeri County",
    image: destMountKenya,
    gallery: [destMountKenya, expWalking, destAmboseli],
    category: "Adventure & Hiking",
    rating: 4.8,
    reviews: 890,
    crowdLevel: "Low",
    bestTime: "Jan — Feb",
    price: "From $150/day",
    description: "Mount Kenya, Africa's second-highest peak at 5,199m, is a UNESCO World Heritage Site offering challenging treks through diverse ecological zones — from bamboo forests to alpine moorlands. The Sirimon, Naro Moru, and Chogoria routes cater to different skill levels. The mountain is sacred to the Kikuyu people and surrounded by pristine forest teeming with wildlife including elephants, buffalo, and rare species.",
    highlights: ["Summit treks", "Alpine moorlands", "Diverse ecological zones", "UNESCO World Heritage Site", "Mountain wildlife", "Cultural significance"],
    safetyRating: 3,
    accessibilityRating: 2,
    photographyScore: 5,
    lat: -0.1521,
    lng: 37.3084,
  },
  {
    id: "lake-nakuru",
    name: "Lake Nakuru",
    county: "Nakuru County",
    image: destNakuru,
    gallery: [destNakuru, wildlifeBirds, destMara],
    category: "Birdwatching",
    rating: 4.6,
    reviews: 1450,
    crowdLevel: "Medium",
    bestTime: "Year-round",
    price: "From $70/day",
    description: "Lake Nakuru National Park is a birdwatcher's paradise, famous for its massive flocks of flamingos that paint the lake shore pink. The park is also a rhino sanctuary protecting both black and white rhinos. Located in the Great Rift Valley, the park features diverse habitats including acacia woodlands, grasslands, and rocky escarpments offering spectacular viewpoints.",
    highlights: ["Flamingo spectacle", "Rhino sanctuary", "Baboon Cliff viewpoint", "Rift Valley scenery", "Over 450 bird species", "Waterfall trails"],
    safetyRating: 5,
    accessibilityRating: 4,
    photographyScore: 5,
    lat: -0.3667,
    lng: 36.0833,
  },
  {
    id: "lamu-old-town",
    name: "Lamu Old Town",
    county: "Lamu County",
    image: destLamu,
    gallery: [destLamu, communityMarket, destDiani],
    category: "Culture & Heritage",
    rating: 4.7,
    reviews: 780,
    crowdLevel: "Low",
    bestTime: "Jun — Sep",
    price: "From $60/day",
    description: "Lamu Old Town is the oldest continuously inhabited Swahili settlement in East Africa and a UNESCO World Heritage Site. Its narrow streets, ornately carved wooden doors, and coral stone architecture reflect centuries of Swahili, Arab, Persian, Indian, and European influence. The island is car-free, with donkeys and dhow boats as the main transport. Experience the famous Lamu Cultural Festival and the town's legendary hospitality.",
    highlights: ["UNESCO World Heritage Site", "Swahili architecture", "Dhow sailing trips", "Lamu Cultural Festival", "Donkey sanctuary", "Shela Beach"],
    safetyRating: 4,
    accessibilityRating: 3,
    photographyScore: 4,
    lat: -2.2717,
    lng: 40.9020,
  },
];

export const experiences: Experience[] = [
  {
    id: "beadwork",
    title: "Maasai Beadwork Workshop",
    host: "Narok Women's Collective",
    image: expBeadwork,
    duration: "3 hours",
    price: "$35",
    rating: 4.9,
    reviews: 128,
    tag: "Cultural",
    description: "Learn traditional Maasai beadwork from master artisans in a community-run workshop. Create your own bracelet while hearing stories of the cultural significance behind each pattern and color.",
    destinationId: "maasai-mara",
  },
  {
    id: "cooking",
    title: "Traditional Kenyan Cooking",
    host: "Chef Wanjiku",
    image: expCooking,
    duration: "4 hours",
    price: "$45",
    rating: 4.8,
    reviews: 256,
    tag: "Food",
    description: "Cook authentic Kenyan dishes using locally sourced ingredients over an open fire. Learn to make nyama choma, ugali, sukuma wiki, and chapati with a celebrated Kenyan chef.",
    destinationId: "maasai-mara",
  },
  {
    id: "walking-safari",
    title: "Walking Safari Adventure",
    host: "Mara Guides Association",
    image: expWalking,
    duration: "5 hours",
    price: "$85",
    rating: 4.9,
    reviews: 342,
    tag: "Adventure",
    description: "Experience the bush on foot with expert Maasai guides. Track wildlife, learn about medicinal plants, and connect with the landscape in a way no vehicle safari can offer.",
    destinationId: "maasai-mara",
  },
  {
    id: "dhow-sailing",
    title: "Traditional Dhow Sailing",
    host: "Lamu Sailors Guild",
    image: destLamu,
    duration: "6 hours",
    price: "$55",
    rating: 4.7,
    reviews: 89,
    tag: "Adventure",
    description: "Sail the Lamu archipelago on a traditional hand-crafted dhow. Visit hidden beaches, snorkel in crystal waters, and enjoy a fresh seafood lunch prepared on board.",
    destinationId: "lamu-old-town",
  },
  {
    id: "flamingo-watch",
    title: "Flamingo Photography Tour",
    host: "Nakuru Birders Club",
    image: destNakuru,
    duration: "4 hours",
    price: "$40",
    rating: 4.6,
    reviews: 178,
    tag: "Nature",
    description: "Guided photography tour at the best flamingo viewing spots around Lake Nakuru. Learn bird photography techniques from expert guides and capture stunning images.",
    destinationId: "lake-nakuru",
  },
  {
    id: "kilimanjaro-view",
    title: "Kilimanjaro Sunrise Experience",
    host: "Amboseli Sunrise Guides",
    image: destAmboseli,
    duration: "3 hours",
    price: "$60",
    rating: 4.9,
    reviews: 210,
    tag: "Nature",
    description: "Early morning game drive timed perfectly for the magical sunrise illuminating Mount Kilimanjaro. Includes breakfast in the bush with elephant herds as your backdrop.",
    destinationId: "amboseli",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Sarah Mitchell",
    avatar: "SM",
    country: "United Kingdom",
    rating: 5,
    date: "Feb 2026",
    text: "Absolutely breathtaking! The migration crossing was the most incredible wildlife experience of my life. Our guide David was incredibly knowledgeable and passionate about conservation.",
    destinationId: "maasai-mara",
  },
  {
    id: "r2",
    author: "James Chen",
    avatar: "JC",
    country: "United States",
    rating: 5,
    date: "Jan 2026",
    text: "The hot air balloon ride at sunrise was worth every penny. Seeing the Mara from above with thousands of wildebeest below is something I'll never forget. The tented camp was luxurious and sustainable.",
    destinationId: "maasai-mara",
  },
  {
    id: "r3",
    author: "Maria Santos",
    avatar: "MS",
    country: "Brazil",
    rating: 4,
    date: "Dec 2025",
    text: "Great wildlife viewing throughout our 3-day stay. We saw all of the Big Five! The community cultural visit was a highlight — the Maasai warriors were incredible dancers and storytellers.",
    destinationId: "maasai-mara",
  },
  {
    id: "r4",
    author: "Hans Weber",
    avatar: "HW",
    country: "Germany",
    rating: 5,
    date: "Nov 2025",
    text: "Amboseli exceeded all expectations. The elephant herds with Kilimanjaro in the background was like a painting. Our eco-lodge was fantastic and run by the local community.",
    destinationId: "amboseli",
  },
  {
    id: "r5",
    author: "Yuki Tanaka",
    avatar: "YT",
    country: "Japan",
    rating: 5,
    date: "Mar 2026",
    text: "Diani Beach is paradise on Earth. The water is so clear and warm. We did an amazing snorkeling trip and saw dolphins! The local seafood restaurants are incredible.",
    destinationId: "diani-beach",
  },
  {
    id: "r6",
    author: "Aisha Omar",
    avatar: "AO",
    country: "Kenya",
    rating: 5,
    date: "Feb 2026",
    text: "As a Kenyan, I'm proud of Lamu. The Old Town is a living museum of Swahili culture. The food, the architecture, the people — everything is authentic and magical.",
    destinationId: "lamu-old-town",
  },
];
