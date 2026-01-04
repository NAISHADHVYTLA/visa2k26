import { CreditCard, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="gradient-primary p-2 rounded-lg">
            <CreditCard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">VisaBenefit<span className="text-accent">.AI</span></span>
            <span className="text-[10px] text-muted-foreground leading-none">Smart Card Co-Pilot</span>
          </div>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span>{t("nav.language")}</span>
        </Button>
      </div>
    </header>
  );
}
