import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LifestyleSelector, type Lifestyle } from "@/components/LifestyleSelector";
import { BenefitCard } from "@/components/BenefitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { type Benefit } from "@/lib/mock-data";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalizeState {
  tier: string;
  benefits: Benefit[];
}

interface Recommendation {
  benefit: Benefit;
  rank: number;
  reason: string;
}

const PersonalizePage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as PersonalizeState | null;

  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  const handleGetRecommendations = async () => {
    if (!lifestyle || !state) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("recommend", {
        body: {
          lifestyle,
          location: locationInput || undefined,
          benefits: state.benefits.map((b) => ({
            id: b.id,
            name: b.name,
            category: b.category,
            tnc: b.tnc,
          })),
          language,
        },
      });

      if (error) throw error;

      // Map recommendations back to full benefit objects
      const recs: Recommendation[] = data.recommendations.map((rec: any) => {
        const benefit = state.benefits.find((b) => b.id === rec.benefitId);
        return {
          benefit: benefit!,
          rank: rec.rank,
          reason: rec.reason,
        };
      });

      setRecommendations(recs);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast({
        title: t("common.error"),
        description: "Could not get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">{t("personal.title")}</h1>
            </div>
            <p className="text-muted-foreground">{t("personal.subtitle")}</p>
          </div>

          {recommendations.length === 0 ? (
            /* Selection Form */
            <div className="space-y-8 animate-slide-up">
              {/* Lifestyle Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">{t("personal.lifestyle")}</Label>
                <LifestyleSelector selected={lifestyle} onSelect={setLifestyle} />
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-lg font-medium">
                  {t("personal.location")}
                </Label>
                <Input
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder={t("personal.locationPlaceholder")}
                  className="h-12"
                />
              </div>

              {/* Submit Button */}
              <Button
                variant="hero"
                className="w-full"
                onClick={handleGetRecommendations}
                disabled={!lifestyle || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("personal.getRecommendations")}
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Recommendations Display */
            <div className="space-y-6">
              <div className="text-center mb-8 animate-fade-in">
                <h2 className="text-2xl font-bold mb-2">{t("recommend.title")}</h2>
                <p className="text-muted-foreground">
                  Personalized for your {lifestyle} lifestyle
                  {locationInput && ` in ${locationInput}`}
                </p>
              </div>

              <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.benefit.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <BenefitCard
                      benefit={rec.benefit}
                      rank={rec.rank}
                      reason={rec.reason}
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => setRecommendations([])}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Different Preferences
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/benefits", { state: { tier: state.tier, issuer: "" } })}
              >
                {t("recommend.back")}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PersonalizePage;
