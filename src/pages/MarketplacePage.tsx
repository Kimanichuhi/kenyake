import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, MapPin, Users, ShoppingBag, Check, Shield, Globe, Phone, Loader2,
  ChevronRight, Package, Palette, Leaf, UtensilsCrossed, Scissors, X, Heart,
  BadgeCheck, Truck, Clock, Store
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { calculateMarketplaceCommission } from "@/lib/marketplace";
import { formatDualCurrency } from "@/lib/currency";

interface Seller {
  id: string; name: string; slug: string; seller_type: string; bio: string | null; story: string | null;
  photo_url: string | null; location: string | null; county: string | null; is_cooperative: boolean | null;
  cooperative_members: number | null; is_verified: boolean | null; accepts_mpesa: boolean | null;
  ships_internationally: boolean | null; accepts_commissions: boolean | null; commission_lead_days: number | null;
  rating: number | null; review_count: number | null; total_sales: number | null;
}

interface Product {
  id: string; title: string; slug: string; category: string; subcategory: string | null;
  description: string | null; made_by_story: string | null; materials: string | null;
  price_amount: number; price_currency: string | null; price_display: string | null; price_usd: number | null;
  cover_image: string | null; in_stock: boolean | null; stock_count: number | null;
  is_preorder: boolean | null; preorder_lead_days: number | null;
  is_custom_commission: boolean | null; commission_starting_price: number | null;
  is_authentic_verified: boolean | null; tags: string[] | null; is_featured: boolean | null;
  rating: number | null; review_count: number | null; order_count: number | null;
  seller_id: string;
  marketplace_sellers: { name: string; slug: string; is_verified: boolean | null; is_cooperative: boolean | null; location: string | null; accepts_mpesa: boolean | null; ships_internationally: boolean | null } | null;
}

const categories = [
  { key: "all", label: "All Products", icon: ShoppingBag },
  { key: "beadwork", label: "Beadwork", icon: Palette },
  { key: "pottery", label: "Pottery", icon: Package },
  { key: "woodcarving", label: "Wood Carving", icon: Scissors },
  { key: "textiles", label: "Textiles & Baskets", icon: Store },
  { key: "food", label: "Honey, Herbs & Food", icon: UtensilsCrossed },
];

const MarketplacePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [qty, setQty] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Kenya");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [customDesc, setCustomDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, sellerRes] = await Promise.all([
        supabase.from("marketplace_products").select("*, marketplace_sellers(name, slug, is_verified, is_cooperative, location, accepts_mpesa, ships_internationally)").eq("is_published", true).order("is_featured", { ascending: false }).order("order_count", { ascending: false }),
        supabase.from("marketplace_sellers").select("*").eq("is_published", true).order("total_sales", { ascending: false }),
      ]);
      if (prodRes.data) setProducts(prodRes.data as unknown as Product[]);
      if (sellerRes.data) setSellers(sellerRes.data as Seller[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "all" || p.category === selectedCat;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.marketplace_sellers?.name || "").toLowerCase().includes(search.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const getOrderTotal = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.is_custom_commission
      ? (selectedProduct.commission_starting_price || selectedProduct.price_amount)
      : selectedProduct.price_amount;
    return basePrice * qty;
  };

  const orderTotal = getOrderTotal();
  const orderTotalUsd = selectedProduct?.price_usd ? selectedProduct.price_usd * qty : undefined;
  const { commission: platformFee, sellerPayout } = calculateMarketplaceCommission(orderTotal);
  const platformFeeUsd = typeof orderTotalUsd === "number" ? calculateMarketplaceCommission(orderTotalUsd).commission : undefined;
  const sellerPayoutUsd = typeof orderTotalUsd === "number" ? calculateMarketplaceCommission(orderTotalUsd).sellerPayout : undefined;

  const handleOrder = async () => {
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    if (!selectedProduct || !shippingAddress) return;
    setSubmitting(true);
    const isCustom = !!selectedProduct.is_custom_commission;
    const total = orderTotal;
    const { error } = await supabase.from("marketplace_orders").insert({
      product_id: selectedProduct.id,
      seller_id: selectedProduct.seller_id,
      buyer_id: user.id,
      quantity: qty,
      total_price: total,
      price_currency: selectedProduct.price_currency || "KES",
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      shipping_country: shippingCountry,
      is_international: shippingCountry !== "Kenya",
      buyer_notes: buyerNotes || null,
      is_custom_order: isCustom,
      custom_description: isCustom ? customDesc : null,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Order failed", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Order placed! 🎉", description: `Your order for ${selectedProduct.title} has been sent to the seller.` });
      setShowOrder(false); setSelectedProduct(null); setQty(1); setShippingAddress(""); setBuyerNotes(""); setCustomDesc("");
    }
  };

  const openSellerProfile = (slug: string) => {
    const s = sellers.find(s => s.slug === slug);
    if (s) { setSelectedProduct(null); setSelectedSeller(s); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-sm font-body font-semibold tracking-widest uppercase text-safari-green">Direct From Artisans</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-3">Community Marketplace</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Handcrafted products from verified community artisans and cooperatives. A 10% platform fee supports community tourism while the seller receives the rest.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search products, sellers, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-body outline-none" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={() => setSelectedCat(cat.key)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${selectedCat === cat.key ? "gradient-sunset text-primary-foreground shadow-md" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
                  <Icon className="h-4 w-4" />{cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      {selectedCat === "all" && !search && (
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Verified Sellers & Cooperatives</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {sellers.map((s) => (
                <button key={s.id} onClick={() => setSelectedSeller(s)} className="shrink-0 w-56 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full gradient-safari flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display text-sm font-semibold text-foreground truncate flex items-center gap-1">
                        {s.name} {s.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-safari-green shrink-0" />}
                      </h4>
                      <p className="text-xs text-muted-foreground font-body truncate">{s.location}{s.county ? `, ${s.county}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                    {s.is_cooperative && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Co-op · {s.cooperative_members} members</Badge>}
                    {(s.rating ?? 0) > 0 && <span className="flex items-center gap-0.5 text-savannah-gold"><Star className="h-3 w-3 fill-current" />{Number(s.rating).toFixed(1)}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <p className="font-body text-sm text-muted-foreground mb-6">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow" onClick={() => setSelectedProduct(p)}>
                    <div className="relative h-48 bg-muted flex items-center justify-center">
                      {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {p.is_featured && <span className="gradient-sunset text-primary-foreground text-[10px] font-body font-medium px-2 py-0.5 rounded-full">⭐ Featured</span>}
                        {p.is_authentic_verified && <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[10px] font-body font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"><Shield className="h-2.5 w-2.5" />Verified</span>}
                      </div>
                      {!p.in_stock && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="text-sm font-body font-semibold text-foreground">Sold Out</span></div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-sm font-semibold text-foreground mb-0.5 group-hover:text-safari-green transition-colors line-clamp-1">{p.title}</h3>
                      <button onClick={(e) => { e.stopPropagation(); openSellerProfile(p.marketplace_sellers?.slug || ""); }} className="text-xs text-muted-foreground font-body hover:text-safari-green transition-colors flex items-center gap-1">
                        {p.marketplace_sellers?.name} {p.marketplace_sellers?.is_verified && <BadgeCheck className="h-3 w-3 text-safari-green" />}
                      </button>
                      {p.marketplace_sellers?.location && <p className="text-[10px] text-muted-foreground font-body mt-0.5 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.marketplace_sellers.location}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {p.marketplace_sellers?.accepts_mpesa && <span title="M-Pesa accepted" className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[9px]">📱</span>}
                          {p.marketplace_sellers?.ships_internationally && <span title="Ships worldwide" className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Globe className="h-3 w-3 text-blue-600" /></span>}
                        </div>
                        <span className="font-body font-bold text-foreground text-sm">
                          {formatDualCurrency(p.price_amount, p.price_usd)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && <div className="text-center py-20"><p className="text-muted-foreground font-body">No products found.</p></div>}
            </>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct && !showOrder} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="capitalize">{selectedProduct.category}</Badge>
                  {selectedProduct.is_authentic_verified && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs"><Shield className="h-3 w-3 mr-1" />Authenticity Verified</Badge>}
                  {selectedProduct.is_custom_commission && <Badge variant="outline" className="text-xs">📐 Custom Commission</Badge>}
                  {selectedProduct.is_preorder && <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pre-order</Badge>}
                </div>
                <DialogTitle className="font-display text-2xl">{selectedProduct.title}</DialogTitle>
                <button onClick={() => openSellerProfile(selectedProduct.marketplace_sellers?.slug || "")} className="text-sm text-muted-foreground font-body hover:text-safari-green transition-colors flex items-center gap-1">
                  By {selectedProduct.marketplace_sellers?.name}
                  {selectedProduct.marketplace_sellers?.is_verified && <BadgeCheck className="h-4 w-4 text-safari-green" />}
                  {selectedProduct.marketplace_sellers?.is_cooperative && <Badge variant="outline" className="text-[10px] ml-1">Co-op</Badge>}
                </button>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="flex flex-wrap gap-3 text-sm font-body">
                  <span className="font-bold text-xl text-foreground">
                    {formatDualCurrency(selectedProduct.price_amount, selectedProduct.price_usd)}
                  </span>
                  {selectedProduct.price_usd && <span className="text-muted-foreground self-end">≈ ${selectedProduct.price_usd} USD</span>}
                  {selectedProduct.in_stock ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 self-end">{selectedProduct.stock_count ? `${selectedProduct.stock_count} in stock` : "In Stock"}</Badge>
                  ) : <Badge variant="destructive" className="self-end">Sold Out</Badge>}
                </div>

                <div><h4 className="font-display font-semibold text-foreground mb-1">Description</h4><p className="text-sm text-muted-foreground font-body leading-relaxed">{selectedProduct.description}</p></div>

                {selectedProduct.made_by_story && (
                  <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-savannah-gold">
                    <h4 className="font-display font-semibold text-foreground mb-1 text-sm">✨ Made By Story</h4>
                    <p className="text-sm text-muted-foreground font-body italic leading-relaxed">{selectedProduct.made_by_story}</p>
                  </div>
                )}

                {selectedProduct.materials && (
                  <div><h4 className="font-display font-semibold text-foreground mb-1 text-sm">Materials</h4><p className="text-sm text-muted-foreground font-body">{selectedProduct.materials}</p></div>
                )}

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                  {selectedProduct.marketplace_sellers?.accepts_mpesa && <span className="flex items-center gap-1">📱 M-Pesa accepted</span>}
                  {selectedProduct.marketplace_sellers?.ships_internationally && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> International shipping</span>}
                  {selectedProduct.is_preorder && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pre-order: {selectedProduct.preorder_lead_days} days</span>}
                </div>

                <Button className="w-full gradient-sunset text-primary-foreground font-body font-semibold text-base py-6" onClick={() => setShowOrder(true)} disabled={!selectedProduct.in_stock && !selectedProduct.is_custom_commission}>
                  {selectedProduct.is_custom_commission ? "Request Custom Commission" : selectedProduct.is_preorder ? "Pre-Order Now" : "Order Now"} — {formatDualCurrency(selectedProduct.price_amount, selectedProduct.price_usd)}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Modal */}
      <Dialog open={showOrder} onOpenChange={(o) => { if (!o) setShowOrder(false); }}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selectedProduct.is_custom_commission ? "Custom Commission Request" : "Place Order"}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body">{selectedProduct.title} · {formatDualCurrency(selectedProduct.price_amount, selectedProduct.price_usd)}</p>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {!selectedProduct.is_custom_commission && (
                  <div>
                    <Label className="font-body">Quantity</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Button variant="outline" size="sm" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                      <span className="font-body font-semibold w-6 text-center">{qty}</span>
                      <Button variant="outline" size="sm" onClick={() => setQty(Math.min(selectedProduct.stock_count || 99, qty + 1))}>+</Button>
                    </div>
                  </div>
                )}

                {selectedProduct.is_custom_commission && (
                  <div>
                    <Label className="font-body">Describe what you'd like *</Label>
                    <Textarea value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} placeholder="Colors, patterns, size, purpose..." rows={3} className="mt-1" />
                  </div>
                )}

                <div>
                  <Label className="font-body">Payment Method</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedProduct.marketplace_sellers?.accepts_mpesa && (
                      <button onClick={() => setPaymentMethod("mpesa")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-body border transition-colors ${paymentMethod === "mpesa" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>📱 M-Pesa</button>
                    )}
                    <button onClick={() => setPaymentMethod("card")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-body border transition-colors ${paymentMethod === "card" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>💳 Card</button>
                    <button onClick={() => setPaymentMethod("cash")} className={`flex-1 px-3 py-2 rounded-lg text-sm font-body border transition-colors ${paymentMethod === "cash" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>💵 Cash</button>
                  </div>
                </div>

                <div>
                  <Label className="font-body">Shipping Address *</Label>
                  <Textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Full delivery address..." rows={2} className="mt-1" />
                </div>

                <div>
                  <Label className="font-body">Shipping Country</Label>
                  <Input value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} className="mt-1" />
                  {shippingCountry !== "Kenya" && !selectedProduct.marketplace_sellers?.ships_internationally && (
                    <p className="text-xs text-destructive font-body mt-1">⚠️ This seller may not ship internationally. Your order will be sent as a request.</p>
                  )}
                </div>

                <div>
                  <Label className="font-body">Notes for Seller (optional)</Label>
                  <Textarea value={buyerNotes} onChange={(e) => setBuyerNotes(e.target.value)} placeholder="Gift wrapping, special instructions..." rows={2} className="mt-1" />
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {formatDualCurrency(selectedProduct.price_amount, selectedProduct.price_usd)} × {qty}
                    </span>
                    <span className="text-foreground">{formatDualCurrency(orderTotal, orderTotalUsd)}</span>
                  </div>
                  {shippingCountry !== "Kenya" && <div className="flex justify-between"><span className="text-muted-foreground">International shipping</span><span className="text-muted-foreground">TBD by seller</span></div>}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span className="text-muted-foreground">{formatDualCurrency(platformFee, platformFeeUsd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller receives</span>
                    <span className="text-foreground">{formatDualCurrency(sellerPayout, sellerPayoutUsd)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatDualCurrency(orderTotal, orderTotalUsd)}</span>
                  </div>
                </div>

                <Button className="w-full gradient-sunset text-primary-foreground font-body font-semibold py-5" disabled={!shippingAddress || submitting || (selectedProduct.is_custom_commission && !customDesc)} onClick={handleOrder}>
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {submitting ? "Placing Order..." : "Confirm Order"}
                </Button>
                <p className="text-xs text-muted-foreground font-body text-center">The seller will confirm your order and send payment instructions via {paymentMethod === "mpesa" ? "M-Pesa" : paymentMethod}.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Seller Profile Modal */}
      <Dialog open={!!selectedSeller} onOpenChange={(o) => !o && setSelectedSeller(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedSeller && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {selectedSeller.is_verified && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs"><BadgeCheck className="h-3 w-3 mr-1" />Verified Seller</Badge>}
                  {selectedSeller.is_cooperative && <Badge variant="secondary" className="text-xs">🏘️ Cooperative · {selectedSeller.cooperative_members} members</Badge>}
                </div>
                <DialogTitle className="font-display text-2xl">{selectedSeller.name}</DialogTitle>
                <p className="text-sm text-muted-foreground font-body"><MapPin className="inline h-3 w-3" /> {selectedSeller.location}{selectedSeller.county ? `, ${selectedSeller.county}` : ""}</p>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="flex flex-wrap gap-4 text-sm font-body">
                  {(selectedSeller.rating ?? 0) > 0 && <span className="flex items-center gap-1 text-savannah-gold"><Star className="h-4 w-4 fill-current" />{Number(selectedSeller.rating).toFixed(1)} ({selectedSeller.review_count} reviews)</span>}
                  <span className="flex items-center gap-1 text-muted-foreground"><Package className="h-4 w-4" />{selectedSeller.total_sales} sales</span>
                  {selectedSeller.accepts_mpesa && <span className="flex items-center gap-1 text-muted-foreground">📱 M-Pesa</span>}
                  {selectedSeller.ships_internationally && <span className="flex items-center gap-1 text-muted-foreground"><Globe className="h-4 w-4" /> Ships worldwide</span>}
                  {selectedSeller.accepts_commissions && <span className="flex items-center gap-1 text-muted-foreground"><Scissors className="h-4 w-4" /> Custom commissions ({selectedSeller.commission_lead_days}d)</span>}
                </div>

                {selectedSeller.bio && <div><h4 className="font-display font-semibold text-foreground mb-1">About</h4><p className="text-sm text-muted-foreground font-body">{selectedSeller.bio}</p></div>}

                {selectedSeller.story && (
                  <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-savannah-gold">
                    <h4 className="font-display font-semibold text-foreground mb-1 text-sm">📖 Our Story</h4>
                    <p className="text-sm text-muted-foreground font-body italic leading-relaxed">{selectedSeller.story}</p>
                  </div>
                )}

                {/* Seller's products */}
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-3">Products by {selectedSeller.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {products.filter(p => p.seller_id === selectedSeller.id).map((p) => (
                      <button key={p.id} onClick={() => { setSelectedSeller(null); setSelectedProduct(p); }} className="bg-card border border-border rounded-xl p-3 text-left hover:shadow-md transition-shadow">
                        <h5 className="font-display text-sm font-semibold text-foreground line-clamp-1">{p.title}</h5>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{formatDualCurrency(p.price_amount, p.price_usd)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {p.is_authentic_verified && <Shield className="h-3 w-3 text-safari-green" />}
                          {p.in_stock ? <span className="text-[10px] text-green-600 font-body">In Stock</span> : <span className="text-[10px] text-destructive font-body">Sold Out</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default MarketplacePage;
