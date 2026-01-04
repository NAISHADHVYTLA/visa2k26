import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BenefitCard } from "@/components/BenefitCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { benefitsByTier, tierDisplayNames, type Benefit } from "@/lib/mock-data";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface BenefitsState {
  tier: string;
  issuer: string;
}

const BenefitsPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BenefitsState | null;

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    const tierBenefits = benefitsByTier[state.tier] || [];
    setBenefits(tierBenefits);

    // Auto-load AI summaries for all benefits
    tierBenefits.forEach((benefit) => {
      loadAISummary(benefit);
    });
  }, [state, navigate]);

  const loadAISummary = async (benefit: Benefit) => {
    if (summaries[benefit.id] || loadingIds.has(benefit.id)) return;

    setLoadingIds((prev) => new Set(prev).add(benefit.id));

    try {
      const { data, error } = await supabase.functions.invoke("summarize", {
        body: { 
          tnc: benefit.tnc, 
          benefitName: benefit.name,
          language: language 
        },
      });

      if (error) throw error;

      setSummaries((prev) => ({
        ...prev,
        [benefit.id]: data.summary,
      }));
    } catch (error) {
      console.error("Error loading AI summary:", error);
      // Fallback to first sentence of T&C
      const fallback = benefit.tnc.split(".")[0] + ".";
      setSummaries((prev) => ({
        ...prev,
        [benefit.id]: fallback,
      }));
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(benefit.id);
        return next;
      });
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold">{t("benefits.title")}</h1>
              <Badge variant="secondary" className="text-sm">
                {benefits.length} benefits
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {t("benefits.subtitle")} <span className="font-semibold text-foreground">{tierDisplayNames[state.tier]}</span>
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BenefitCard
                  benefit={benefit}
                  aiSummary={summaries[benefit.id]}
                  isLoadingSummary={loadingIds.has(benefit.id)}
                  onRequestSummary={() => loadAISummary(benefit)}
                />
              </div>
            ))}
          </div>

          {/* Personalization CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center animate-slide-up">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-bold mb-2">{t("benefits.personalize")}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Tell us about your lifestyle and we'll recommend the top 3 benefits that matter most to you
            </p>
            <Button
              variant="hero"
              onClick={() => navigate("/personalize", { state: { tier: state.tier, benefits } })}
            >
              Get Personalized Recommendations
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BenefitsPage;
