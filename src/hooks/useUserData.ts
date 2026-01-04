import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SaveCardParams {
  cardName: string;
  issuer: string;
  tier: string;
  maskedBin: string;
}

interface SaveRecommendationParams {
  tier: string;
  lifestyle: string;
  location?: string;
  recommendations: any;
}

export function useUserData() {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveCard = async (params: SaveCardParams) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your cards.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from("saved_cards").upsert(
        {
          user_id: user.id,
          card_name: params.cardName,
          issuer: params.issuer,
          tier: params.tier,
          masked_bin: params.maskedBin,
        },
        {
          onConflict: "user_id,masked_bin",
        }
      );

      if (error) throw error;

      toast({
        title: "Card Saved",
        description: "This card has been added to your profile.",
      });
      return true;
    } catch (error: any) {
      console.error("Error saving card:", error);
      toast({
        title: "Error",
        description: "Could not save the card. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveRecommendation = async (params: SaveRecommendationParams) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("recommendation_history").insert({
        user_id: user.id,
        tier: params.tier,
        lifestyle: params.lifestyle,
        location: params.location || null,
        recommendations: params.recommendations,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error saving recommendation:", error);
      return false;
    }
  };

  return {
    user,
    saveCard,
    saveRecommendation,
  };
}
