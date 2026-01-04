import { GraduationCap, Briefcase, Plane, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export type Lifestyle = "student" | "professional" | "traveler" | "family";

interface LifestyleSelectorProps {
  selected: Lifestyle | null;
  onSelect: (lifestyle: Lifestyle) => void;
}

const lifestyles: { id: Lifestyle; icon: React.ComponentType<{ className?: string }>; translationKey: string }[] = [
  { id: "student", icon: GraduationCap, translationKey: "personal.student" },
  { id: "professional", icon: Briefcase, translationKey: "personal.professional" },
  { id: "traveler", icon: Plane, translationKey: "personal.traveler" },
  { id: "family", icon: Users, translationKey: "personal.family" },
];

export function LifestyleSelector({ selected, onSelect }: LifestyleSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      {lifestyles.map(({ id, icon: Icon, translationKey }) => (
        <Card
          key={id}
          variant={selected === id ? "visa" : "glass"}
          hover="lift"
          onClick={() => onSelect(id)}
          className={cn(
            "p-4 cursor-pointer text-center transition-all",
            selected === id && "ring-2 ring-accent ring-offset-2"
          )}
        >
          <Icon className={cn(
            "h-8 w-8 mx-auto mb-2",
            selected === id ? "text-primary-foreground" : "text-accent"
          )} />
          <p className={cn(
            "font-medium",
            selected === id ? "text-primary-foreground" : "text-foreground"
          )}>
            {t(translationKey)}
          </p>
        </Card>
      ))}
    </div>
  );
}
