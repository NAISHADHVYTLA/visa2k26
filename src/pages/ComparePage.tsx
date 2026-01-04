import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/context/LanguageContext";
import { benefitsByTier, tierDisplayNames, tierColors } from "@/lib/mock-data";
import { ArrowLeft, Scale, Check, X, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TierKey = "platinum" | "signature" | "infinite";

const ComparePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedTiers, setSelectedTiers] = useState<TierKey[]>(["platinum", "signature"]);

  const tiers: TierKey[] = ["platinum", "signature", "infinite"];

  const toggleTier = (tier: TierKey) => {
    if (selectedTiers.includes(tier)) {
      if (selectedTiers.length > 1) {
        setSelectedTiers(selectedTiers.filter((t) => t !== tier));
      }
    } else {
      setSelectedTiers([...selectedTiers, tier]);
    }
  };

  // Get all unique benefit categories across selected tiers
  const allCategories = Array.from(
    new Set(
      selectedTiers.flatMap((tier) =>
        benefitsByTier[tier].map((b) => b.category)
      )
    )
  );

  // Get benefits organized by category for each tier
  const getBenefitsByCategory = (tier: TierKey, category: string) => {
    return benefitsByTier[tier].filter((b) => b.category === category);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">Compare Card Benefits</h1>
            </div>
            <p className="text-muted-foreground">
              See how different Visa card tiers stack up against each other
            </p>
          </div>

          {/* Tier Selection */}
          <Card className="mb-8 animate-slide-up border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Select Tiers to Compare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier}
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => toggleTier(tier)}
                  >
                    <Checkbox
                      id={tier}
                      checked={selectedTiers.includes(tier)}
                      onCheckedChange={() => toggleTier(tier)}
                    />
                    <Label
                      htmlFor={tier}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-gradient-to-r ${tierColors[tier].bg}`}
                      />
                      {tierDisplayNames[tier]}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Cards - Mobile View */}
          <div className="md:hidden space-y-6 animate-slide-up">
            {selectedTiers.map((tier) => (
              <Card
                key={tier}
                className="border-border/50 overflow-hidden"
              >
                <div className={`p-4 bg-gradient-to-r ${tierColors[tier].bg}`}>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-white" />
                    <h3 className="text-lg font-bold text-white">
                      {tierDisplayNames[tier]}
                    </h3>
                  </div>
                </div>
                <CardContent className="pt-4">
                  {allCategories.map((category) => {
                    const benefits = getBenefitsByCategory(tier, category);
                    if (benefits.length === 0) return null;

                    return (
                      <div key={category} className="mb-4 last:mb-0">
                        <Badge variant="secondary" className="mb-2">
                          {category}
                        </Badge>
                        <ul className="space-y-2">
                          {benefits.map((benefit) => (
                            <li
                              key={benefit.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <span>{benefit.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table - Desktop View */}
          <Card className="hidden md:block border-border/50 overflow-hidden animate-slide-up">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-48 font-semibold">Category</TableHead>
                  {selectedTiers.map((tier) => (
                    <TableHead key={tier} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`px-4 py-2 rounded-lg bg-gradient-to-r ${tierColors[tier].bg}`}
                        >
                          <span className="text-white font-semibold">
                            {tierDisplayNames[tier]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {benefitsByTier[tier].length} benefits
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCategories.map((category) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium align-top">
                      <Badge variant="outline">{category}</Badge>
                    </TableCell>
                    {selectedTiers.map((tier) => {
                      const benefits = getBenefitsByCategory(tier, category);
                      return (
                        <TableCell key={tier} className="align-top">
                          {benefits.length > 0 ? (
                            <ul className="space-y-2">
                              {benefits.map((benefit) => (
                                <li
                                  key={benefit.id}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                  <span>{benefit.name}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <X className="h-4 w-4" />
                              <span>Not available</span>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Summary Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {selectedTiers.map((tier) => (
              <Card key={tier} className="border-border/50 text-center">
                <CardContent className="pt-6">
                  <div
                    className={`inline-flex p-3 rounded-xl mb-3 bg-gradient-to-r ${tierColors[tier].bg}`}
                  >
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{tierDisplayNames[tier]}</h3>
                  <p className="text-2xl font-bold text-accent">
                    {benefitsByTier[tier].length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Benefits</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-muted-foreground mb-4">
              Want to know which card is best for you?
            </p>
            <Button variant="hero" onClick={() => navigate("/")}>
              Check Your Card Benefits
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComparePage;
