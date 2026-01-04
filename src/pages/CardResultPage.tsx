import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { VisaCard } from "@/components/VisaCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { tierDisplayNames } from "@/lib/mock-data";
import { ArrowRight, Building, CreditCard, Check } from "lucide-react";
import { useEffect } from "react";

interface CardResultState {
  tier: string;
  issuer: string;
  lastFour: string;
}

const CardResultPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CardResultState | null;

  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("card.title")}</h1>
            <p className="text-muted-foreground">We've identified your card and its benefits</p>
          </div>

          {/* Card Visual */}
          <div className="flex justify-center mb-8">
            <VisaCard 
              tier={state.tier} 
              issuer={state.issuer} 
              lastFour={state.lastFour}
            />
          </div>

          {/* Card Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 animate-slide-up">
            <div className="p-6 bg-card rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">{t("card.issuer")}</span>
              </div>
              <p className="text-xl font-semibold">{state.issuer}</p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">{t("card.tier")}</span>
              </div>
              <p className="text-xl font-semibold">{tierDisplayNames[state.tier] || state.tier}</p>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="hero"
            className="w-full"
            onClick={() => navigate("/benefits", { state: { tier: state.tier, issuer: state.issuer } })}
          >
            {t("card.viewBenefits")}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CardResultPage;
