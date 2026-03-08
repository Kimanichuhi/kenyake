import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Utensils, Leaf, Shield, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { restaurants } from "@/data/guides-events";

const cuisines = ["All", "Kenyan", "BBQ", "Seafood", "Traditional", "Swahili"];
const dietaryFilters = ["All", "Vegetarian", "Halal", "Fish", "Meat-heavy"];
const priceFilters = ["All", "$", "$$", "$$$"];

const FoodPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedDietary, setSelectedDietary] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");

  const filtered = restaurants.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.county.toLowerCase().includes(search.toLowerCase());
    const matchCuisine = selectedCuisine === "All" || r.cuisine.some((c) => c.includes(selectedCuisine));
    const matchDietary = selectedDietary === "All" || r.dietary.some((d) => d.toLowerCase().includes(selectedDietary.toLowerCase()));
    const matchPrice = selectedPrice === "All" || r.priceRange === selectedPrice;
    return matchSearch && matchCuisine && matchDietary && matchPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-sunset-orange">Taste Kenya</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Food & Dining Guide</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              From legendary nyama choma joints to fine dining in caves — discover Kenya's incredible food scene. Filter by dietary needs and find authentic local experiences.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-3 glass-card px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search restaurants or locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {cuisines.map((c) => (
                <button key={c} onClick={() => setSelectedCuisine(c)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedCuisine === c ? "gradient-sunset text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {dietaryFilters.map((d) => (
                <button key={d} onClick={() => setSelectedDietary(d)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedDietary === d ? "gradient-safari text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  <Leaf className="h-3 w-3 inline mr-1" />{d}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {priceFilters.map((p) => (
                <button key={p} onClick={() => setSelectedPrice(p)} className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${selectedPrice === p ? "bg-savannah-gold text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  {p === "All" ? "Any Price" : p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant, i) => (
              <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-body font-medium capitalize ${restaurant.type === "restaurant" ? "bg-primary text-primary-foreground" : restaurant.type === "street-food" ? "bg-sunset-orange text-primary-foreground" : restaurant.type === "home-dining" ? "bg-safari-green text-primary-foreground" : "bg-savannah-gold text-primary-foreground"}`}>
                      {restaurant.type.replace("-", " ")}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="glass-card px-2 py-1 rounded-full text-foreground font-body font-bold text-sm">{restaurant.priceRange}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground font-body flex items-center gap-1"><MapPin className="h-3 w-3" />{restaurant.county}</p>
                    </div>
                    <div className="flex items-center gap-1 text-savannah-gold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-body font-semibold">{restaurant.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {restaurant.cuisine.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-muted text-xs font-body text-muted-foreground">{c}</span>
                    ))}
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-body font-medium text-foreground flex items-center gap-1 mb-1"><Utensils className="h-3 w-3 text-sunset-orange" /> Specialties</p>
                    <p className="text-xs text-muted-foreground font-body">{restaurant.specialties.join(", ")}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {restaurant.dietary.map((d) => (
                        <span key={d} className="text-xs text-muted-foreground font-body"><Leaf className="h-3 w-3 inline text-safari-green" /> {d}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-body">
                      <Shield className="h-3 w-3 text-safari-green" />
                      <span className="text-muted-foreground">Safety: {restaurant.safetyRating}/5</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default FoodPage;
