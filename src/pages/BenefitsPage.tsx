import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BenefitCard } from "@/components/BenefitCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { benefitsByTier, tierDisplayNames, type Benefit } from "@/lib/mock-data";
import { exportBenefitsToPDF } from "@/lib/pdf-export";
import { Sparkles, ArrowRight, ArrowLeft, Download, Plane, ShoppingBag, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BenefitsState {
  tier: string;
  issuer: string;
}

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Travel: { icon: Plane, color: "text-blue-500" },
  Shopping: { icon: ShoppingBag, color: "text-pink-500" },
  Lifestyle: { icon: Target, color: "text-purple-500" },
};

const BenefitsPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
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

  // Group benefits by category
  const groupedBenefits = useMemo(() => {
    return benefits.reduce((acc, benefit) => {
      if (!acc[benefit.category]) {
        acc[benefit.category] = [];
      }
      acc[benefit.category].push(benefit);
      return acc;
    }, {} as Record<string, Benefit[]>);
  }, [benefits]);

  const handleExportPDF = () => {
    if (!state) return;
    
    exportBenefitsToPDF({
      tier: state.tier,
      tierDisplay: tierDisplayNames[state.tier] || state.tier,
      issuer: state.issuer,
      benefits,
      summaries,
    });

    toast({
      title: "PDF Downloaded",
      description: "Your benefits summary has been saved.",
    });
  };

  if (!state) return null;

  const categoryOrder = ["Travel", "Shopping", "Lifestyle"];
  const sortedCategories = Object.keys(groupedBenefits).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

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

            <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{t("benefits.title")}</h1>
                <Badge variant="secondary" className="text-sm">
                  {benefits.length} benefits
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <p className="text-muted-foreground">
              {t("benefits.subtitle")} <span className="font-semibold text-foreground">{tierDisplayNames[state.tier]}</span>
            </p>
          </div>

          {/* Benefits Grouped by Category */}
          <div className="space-y-10 mb-8">
            {sortedCategories.map((category, categoryIndex) => {
              const config = categoryConfig[category] || { icon: Target, color: "text-accent" };
              const CategoryIcon = config.icon;
              const categoryBenefits = groupedBenefits[category];

              return (
                <div 
                  key={category} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${categoryIndex * 0.15}s` }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border/50">
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">{category}</h2>
                    <Badge variant="outline" className="ml-auto">
                      {categoryBenefits.length} {categoryBenefits.length === 1 ? "benefit" : "benefits"}
                    </Badge>
                  </div>

                  {/* Category Benefits */}
                  <div className="grid gap-4">
                    {categoryBenefits.map((benefit, index) => (
                      <div 
                        key={benefit.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${(categoryIndex * 0.15) + (index * 0.05)}s` }}
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
                </div>
              );
            })}
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
