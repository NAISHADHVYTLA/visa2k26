import { useState } from "react";
import { CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { isValidMaskedCard, formatCardInput } from "@/lib/card-utils";

interface CardInputProps {
  onSubmit: (maskedCard: string) => void;
  isLoading?: boolean;
}

export function CardInput({ onSubmit, isLoading }: CardInputProps) {
  const { t } = useLanguage();
  const [cardNumber, setCardNumber] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardInput(e.target.value);
    setCardNumber(formatted);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for full 16-digit card (security)
    const cleaned = cardNumber.replace(/[\s-]/g, "");
    if (/^\d{16}$/.test(cleaned)) {
      setError(t("home.error.fullCard"));
      return;
    }

    if (!isValidMaskedCard(cardNumber)) {
      setError(t("home.error.invalid"));
      return;
    }

    onSubmit(cardNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-number" className="text-base font-medium">
          {t("home.inputLabel")}
        </Label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="card-number"
            type="text"
            value={cardNumber}
            onChange={handleInputChange}
            placeholder={t("home.inputPlaceholder")}
            className="pl-12 h-14 text-lg font-mono tracking-wider border-2 focus:border-accent transition-colors"
            maxLength={19}
            autoComplete="off"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="hero"
        className="w-full"
        disabled={isLoading || !cardNumber}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            {t("common.loading")}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {t("home.button")}
            <ArrowRight className="h-5 w-5" />
          </span>
        )}
      </Button>
    </form>
  );
}
