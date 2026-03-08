import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      // Load from localStorage for non-authenticated users
      const stored = localStorage.getItem("safarikenya_favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
      return;
    }
    const { data } = await supabase
      .from("saved_destinations")
      .select("destination_id")
      .eq("user_id", user.id);
    setFavorites(data?.map((d) => d.destination_id) || []);
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (destinationId: string) => {
    const isFaved = favorites.includes(destinationId);

    if (!user) {
      const updated = isFaved
        ? favorites.filter((id) => id !== destinationId)
        : [...favorites, destinationId];
      setFavorites(updated);
      localStorage.setItem("safarikenya_favorites", JSON.stringify(updated));
      toast({
        title: isFaved ? "Removed from favorites" : "Saved to favorites",
        description: user ? undefined : "Sign in to sync across devices",
      });
      return;
    }

    setLoading(true);
    if (isFaved) {
      await supabase
        .from("saved_destinations")
        .delete()
        .eq("user_id", user.id)
        .eq("destination_id", destinationId);
      setFavorites((f) => f.filter((id) => id !== destinationId));
      toast({ title: "Removed from favorites" });
    } else {
      await supabase
        .from("saved_destinations")
        .insert({ user_id: user.id, destination_id: destinationId });
      setFavorites((f) => [...f, destinationId]);
      toast({ title: "Saved to favorites! ❤️" });
    }
    setLoading(false);
  };

  const isFavorite = (destinationId: string) => favorites.includes(destinationId);

  return { favorites, toggleFavorite, isFavorite, loading };
};
