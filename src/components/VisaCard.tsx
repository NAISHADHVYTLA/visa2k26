import { CreditCard, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { tierDisplayNames } from "@/lib/mock-data";

interface VisaCardProps {
  tier: string;
  issuer: string;
  lastFour?: string;
}

const tierVariants: Record<string, "platinum" | "signature" | "infinite"> = {
  platinum: "platinum",
  signature: "signature",
  infinite: "infinite",
};

export function VisaCard({ tier, issuer, lastFour = "****" }: VisaCardProps) {
  const variant = tierVariants[tier] || "platinum";
  
  return (
    <Card 
      variant={variant} 
      hover="shine"
      className="relative w-full max-w-md aspect-[1.586/1] p-6 flex flex-col justify-between overflow-hidden animate-slide-up"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Top row */}
      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Wifi className="h-5 w-5 rotate-90" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-70">{issuer}</p>
          <p className="text-sm font-semibold">{tierDisplayNames[tier] || "Visa"}</p>
        </div>
      </div>

      {/* Card chip */}
      <div className="relative">
        <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-inner">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-yellow-600/30 rounded-sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Card number */}
      <div className="relative">
        <p className="font-mono text-xl tracking-[0.2em] opacity-90">
          •••• •••• •••• {lastFour}
        </p>
      </div>

      {/* Bottom row */}
      <div className="relative flex justify-between items-end">
        <div>
          <p className="text-xs opacity-60 uppercase">Card Holder</p>
          <p className="font-medium">VALUED MEMBER</p>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-500 rounded-full opacity-80" />
          <div className="w-8 h-8 bg-yellow-400 rounded-full -ml-3 opacity-80" />
        </div>
      </div>
    </Card>
  );
}
