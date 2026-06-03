import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star, Shield, Heart, Users, DollarSign, Camera, Flag, CheckCircle2,
  Globe, Send, ThumbsUp
} from "lucide-react";
import { toast } from "sonner";

interface ReviewDimension {
  key: string;
  label: string;
  icon: typeof Star;
  description: string;
}

const dimensions: ReviewDimension[] = [
  { key: "overall_rating", label: "Overall", icon: Star, description: "Your overall experience" },
  { key: "cultural_authenticity", label: "Cultural Authenticity", icon: Globe, description: "How genuine and respectful was the cultural experience?" },
  { key: "community_impact", label: "Community Impact", icon: Heart, description: "How well does this benefit the local community?" },
  { key: "guide_quality", label: "Guide Quality", icon: Users, description: "Knowledge, friendliness, and professionalism" },
  { key: "value_for_money", label: "Value for Money", icon: DollarSign, description: "Was it worth the price?" },
  { key: "safety", label: "Safety", icon: Shield, description: "How safe did you feel?" },
];

interface MultiReviewFormProps {
  reviewableType: string;
  reviewableId: string;
  onSuccess?: () => void;
}

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-110"
      >
        <Star
          className={`h-5 w-5 ${star <= value ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`}
        />
      </button>
    ))}
  </div>
);

const MultiReviewForm = ({ reviewableType, reviewableId, onSuccess }: MultiReviewFormProps) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please sign in to leave a review"); return; }
    if (!ratings.overall_rating) { toast.error("Please rate your overall experience"); return; }
    if (!body.trim()) { toast.error("Please write a review"); return; }

    setSubmitting(true);

    // Upload photos
    const photoUrls: string[] = [];
    for (const photo of photos) {
      const ext = photo.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("review-media").upload(path, photo);
      if (data) {
        const { data: urlData } = supabase.storage.from("review-media").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from("multi_reviews").insert({
      user_id: user.id,
      reviewable_type: reviewableType,
      reviewable_id: reviewableId,
      overall_rating: ratings.overall_rating,
      cultural_authenticity: ratings.cultural_authenticity || null,
      community_impact: ratings.community_impact || null,
      guide_quality: ratings.guide_quality || null,
      value_for_money: ratings.value_for_money || null,
      safety: ratings.safety || null,
      title,
      body,
      photo_urls: photoUrls,
      language: "en",
    });

    setSubmitting(false);
    if (error) toast.error("Failed to submit review");
    else {
      toast.success("Review submitted! Thank you for your feedback.");
      setRatings({});
      setTitle("");
      setBody("");
      setPhotos([]);
      onSuccess?.();
    }
  };

  if (!user) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Please sign in to leave a review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-secondary" /> Write a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Dimension ratings */}
        <div className="space-y-3">
          {dimensions.map((dim) => (
            <div key={dim.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <dim.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{dim.label}{dim.key === "overall_rating" && " *"}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{dim.description}</p>
                </div>
              </div>
              <StarRating value={ratings[dim.key] || 0} onChange={(v) => setRatings({ ...ratings, [dim.key]: v })} />
            </div>
          ))}
        </div>

        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience... What made it special? How did it impact the community?" rows={4} />

        {/* Photo upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 cursor-pointer">
            <Camera className="h-4 w-4" /> Add Photos (up to 5)
          </label>
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="text-sm text-muted-foreground" />
          {photos.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {photos.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs">{p.name}</Badge>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground">
          <Send className="h-4 w-4 mr-2" /> {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
};

// Display component for reviews
interface ReviewDisplayProps {
  reviewableType: string;
  reviewableId: string;
}

export const ReviewList = ({ reviewableType, reviewableId }: ReviewDisplayProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("multi_reviews")
      .select("*")
      .eq("reviewable_type", reviewableType)
      .eq("reviewable_id", reviewableId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useState(() => { fetchReviews(); });

  const handleFlag = async (reviewId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    const { error } = await supabase.from("review_flags").insert({
      review_id: reviewId, user_id: user.id, flag_type: "fake_review", reason: "Suspected fake or misleading review"
    });
    if (!error) toast.success("Review flagged for moderation");
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading reviews...</p>;

  if (reviews.length === 0) return null;

  const dimensionKeys = ["cultural_authenticity", "community_impact", "guide_quality", "value_for_money", "safety"];
  const dimensionLabels: Record<string, string> = {
    cultural_authenticity: "Authenticity",
    community_impact: "Impact",
    guide_quality: "Guide",
    value_for_money: "Value",
    safety: "Safety",
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Reviews ({reviews.length})</h3>
      {reviews.map((review) => (
        <Card key={review.id} className="border-border/50">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                {review.title && <h4 className="font-semibold text-foreground">{review.title}</h4>}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= review.overall_rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                  {review.is_verified_visit && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified Visit
                    </Badge>
                  )}
                </div>
              </div>
              <button onClick={() => handleFlag(review.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors" title="Flag review">
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Dimension mini-bars */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {dimensionKeys.map((key) => review[key] && (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{dimensionLabels[key]}</span>
                  <span className="font-semibold text-foreground">{review[key]}/5</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">{review.body}</p>

            {/* Photos */}
            {review.photo_urls && review.photo_urls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.photo_urls.map((url: string, i: number) => (
                  <img key={i} src={url} alt="Review" className="h-20 w-20 rounded-lg object-cover" />
                ))}
              </div>
            )}

            {/* Translated body */}
            {review.translated_body && Object.keys(review.translated_body).length > 0 && (
              <details className="text-xs">
                <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                  <Globe className="h-3 w-3 inline mr-1" /> View translation
                </summary>
                {Object.entries(review.translated_body).map(([lang, text]) => (
                  <p key={lang} className="mt-1 text-muted-foreground italic">[{lang}] {text as string}</p>
                ))}
              </details>
            )}

            {/* Operator response */}
            {review.operator_response && (
              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                <p className="text-xs font-semibold text-foreground mb-1">Operator Response</p>
                <p className="text-xs text-muted-foreground">{review.operator_response}</p>
                {review.operator_response_at && (
                  <p className="text-xs text-muted-foreground/60 mt-1">{new Date(review.operator_response_at).toLocaleDateString()}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                <ThumbsUp className="h-3 w-3" /> Helpful ({review.upvotes || 0})
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiReviewForm;
