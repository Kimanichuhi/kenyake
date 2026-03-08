import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  destinationId: string;
  className?: string;
  size?: "sm" | "md";
}

const FavoriteButton = ({ destinationId, className, size = "sm" }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const faved = isFavorite(destinationId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading) toggleFavorite(destinationId);
      }}
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        faved
          ? "bg-destructive/90 text-primary-foreground"
          : "glass-card text-foreground/70 hover:text-destructive",
        className
      )}
      aria-label={faved ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", faved && "fill-current")} />
    </button>
  );
};

export default FavoriteButton;
