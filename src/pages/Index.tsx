import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CardInput } from "@/components/CardInput";
import { SecurityDisclaimer } from "@/components/SecurityDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { extractBIN } from "@/lib/card-utils";
import { binDatabase } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Sparkles, Shield, Globe } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCardSubmit = async (maskedCard: string) => {
    setIsLoading(true);
    
    try {
      // Extract BIN and look up card info
      const bin = extractBIN(maskedCard);
      const cardInfo = binDatabase[bin];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (cardInfo) {
        // Navigate to card result page with state
        navigate("/card-result", {
          state: {
            tier: cardInfo.tier,
            issuer: cardInfo.issuer,
            lastFour: maskedCard.slice(-4),
          },
        });
      } else {
        toast({
          title: "Card Not Recognized",
          description: "We couldn't identify this card. Try: 4242-****-****-1234, 4111-****-****-5678, or 4539-****-****-9012",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Benefits Discovery</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-foreground">{t("home.title")}</span>
            <br />
            <span className="text-gradient">{t("home.subtitle")}</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("home.description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: CreditCard, title: "Card Detection", desc: "Instant tier & issuer identification" },
            { icon: Sparkles, title: "AI Summaries", desc: "Complex T&C made simple" },
            { icon: Globe, title: "Bilingual", desc: "English & Tamil support" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 bg-card/50 rounded-xl border border-border/50 text-center animate-slide-up">
              <div className="inline-flex p-3 rounded-lg bg-accent/10 mb-4">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Card Input Section */}
        <div className="max-w-md mx-auto space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-card">
            <CardInput onSubmit={handleCardSubmit} isLoading={isLoading} />
          </div>
          
          <SecurityDisclaimer />
          
          {/* Test Card Hints */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Try these test cards:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["4242-****-****-1234", "4111-****-****-5678", "4539-****-****-9012"].map((card) => (
                <code key={card} className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {card}
                </code>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-4 w-4" />
          <span>Awareness feature only • No payment processing</span>
        </div>
        <p>© 2024 VisaBenefit.AI • For demonstration purposes</p>
      </footer>
    </div>
  );
};

export default Index;
