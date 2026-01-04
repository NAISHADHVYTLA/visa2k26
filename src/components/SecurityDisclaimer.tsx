import { Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function SecurityDisclaimer() {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
      <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">
        {t("home.disclaimer")}
      </p>
    </div>
  );
}
