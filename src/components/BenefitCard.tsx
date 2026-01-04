import { useState } from "react";
import { 
  Plane, 
  Shield, 
  UtensilsCrossed, 
  ShoppingBag, 
  Headphones, 
  Circle, 
  HeartPulse, 
  Building, 
  Map, 
  Crown, 
  ShieldCheck, 
  Wine, 
  Gem,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import type { Benefit } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  shield: Shield,
  utensils: UtensilsCrossed,
  "shopping-bag": ShoppingBag,
  headphones: Headphones,
  circle: Circle,
  "heart-pulse": HeartPulse,
  building: Building,
  map: Map,
  crown: Crown,
  "shield-check": ShieldCheck,
  wine: Wine,
  gem: Gem,
};

interface BenefitCardProps {
  benefit: Benefit;
  aiSummary?: string;
  isLoadingSummary?: boolean;
  onRequestSummary?: () => void;
  rank?: number;
  reason?: string;
}

export function BenefitCard({ 
  benefit, 
  aiSummary, 
  isLoadingSummary,
  onRequestSummary,
  rank,
  reason 
}: BenefitCardProps) {
  const { t } = useLanguage();
  const [showFullTerms, setShowFullTerms] = useState(false);
  const Icon = iconMap[benefit.icon] || Shield;

  return (
    <Card 
      variant="glass" 
      hover="lift"
      className="overflow-hidden animate-fade-in"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {rank && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                <span className="font-bold text-sm text-secondary-foreground">{rank}</span>
              </div>
            )}
            <div className="p-2 rounded-lg bg-accent/10">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">{benefit.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {benefit.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Summary Section */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{t("benefits.aiSummary")}</span>
          </div>
          
          {isLoadingSummary ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t("benefits.loading")}</span>
            </div>
          ) : aiSummary ? (
            <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
          ) : onRequestSummary ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRequestSummary}
              className="text-accent hover:text-accent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Summary
            </Button>
          ) : null}
        </div>

        {/* Reason (for recommendations) */}
        {reason && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm font-medium text-success mb-1">{t("recommend.reason")}</p>
            <p className="text-sm text-foreground">{reason}</p>
          </div>
        )}

        {/* Full Terms Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullTerms(!showFullTerms)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span>{t("benefits.fullTerms")}</span>
          {showFullTerms ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showFullTerms && (
          <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground leading-relaxed animate-fade-in">
            {benefit.tnc}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
