import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { tierDisplayNames, tierColors } from "@/lib/mock-data";
import { 
  User, 
  CreditCard, 
  History, 
  Trash2, 
  ArrowLeft,
  Loader2 
} from "lucide-react";

interface SavedCard {
  id: string;
  card_name: string;
  issuer: string;
  tier: string;
  masked_bin: string;
  created_at: string;
}

interface RecommendationHistory {
  id: string;
  tier: string;
  lifestyle: string;
  location: string | null;
  recommendations: any;
  created_at: string;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  preferred_language: string | null;
}

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);
  const [deletingHistory, setDeletingHistory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, preferred_language")
        .eq("user_id", user!.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Fetch saved cards
      const { data: cardsData } = await supabase
        .from("saved_cards")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      setSavedCards(cardsData || []);

      // Fetch recommendation history
      const { data: historyData } = await supabase
        .from("recommendation_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    setDeletingCard(cardId);
    try {
      const { error } = await supabase
        .from("saved_cards")
        .delete()
        .eq("id", cardId);
      
      if (error) throw error;
      
      setSavedCards(savedCards.filter((c) => c.id !== cardId));
      toast({
        title: "Card Removed",
        description: "The card has been removed from your saved cards.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove the card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingCard(null);
    }
  };

  const deleteHistoryItem = async (historyId: string) => {
    setDeletingHistory(historyId);
    try {
      const { error } = await supabase
        .from("recommendation_history")
        .delete()
        .eq("id", historyId);
      
      if (error) throw error;
      
      setHistory(history.filter((h) => h.id !== historyId));
      toast({
        title: "History Cleared",
        description: "The recommendation has been removed from your history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove the history item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingHistory(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

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
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold">Your Profile</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your saved cards and view recommendation history
            </p>
          </div>

          {/* Profile Info */}
          <Card className="mb-8 animate-slide-up border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-medium">
                      {profile?.first_name || profile?.last_name
                        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                        : "Not set"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{user.email}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Cards */}
          <Card className="mb-8 animate-slide-up border-border/50" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Saved Cards
              </CardTitle>
              <CardDescription>
                Your saved card preferences for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : savedCards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved cards yet</p>
                  <p className="text-sm">Check a card's benefits to save it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${
                            tierColors[card.tier]?.bg || "from-slate-400 to-slate-600"
                          }`}
                        >
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{card.card_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {card.issuer} • {tierDisplayNames[card.tier] || card.tier}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCard(card.id)}
                        disabled={deletingCard === card.id}
                      >
                        {deletingCard === card.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendation History */}
          <Card className="animate-slide-up border-border/50" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recommendation History
              </CardTitle>
              <CardDescription>
                Your past personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recommendations yet</p>
                  <p className="text-sm">Get personalized recommendations based on your lifestyle</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {tierDisplayNames[item.tier] || item.tier}
                            </Badge>
                            <Badge variant="outline">{item.lifestyle}</Badge>
                            {item.location && (
                              <Badge variant="outline">{item.location}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHistoryItem(item.id)}
                          disabled={deletingHistory === item.id}
                        >
                          {deletingHistory === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
