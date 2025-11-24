
/**
 * Upgrade CTA Component
 * 
 * Call-to-action for users to upgrade their membership tier
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Check } from "lucide-react";

interface UpgradeCTAProps {
  currentTier: string;
  targetTier: string;
  onUpgrade?: () => void;
}

export function UpgradeCTA({
  currentTier,
  targetTier,
  onUpgrade,
}: UpgradeCTAProps) {
  const getTierFeatures = (tier: string): string[] => {
    switch (tier.toLowerCase()) {
      case "elite":
        return [
          "Everything in Pro",
          "Monthly 1-on-1 coaching calls",
          "1 free assessment/year ($299 value)",
          "Custom training plans",
          "Direct coach messaging",
          "Early access to new features",
        ];
      case "pro":
        return [
          "Everything in Athlete",
          "Priority seating in Monday coaching",
          "Advanced analytics & reports",
          "Priority Coach Rick responses",
          "Coaching session library access",
          "10% off $997 transformation program",
        ];
      case "athlete":
        return [
          "Unlimited video uploads",
          "AI swing analysis (4Bs system)",
          "Progress tracking & charts",
          "Full drill library",
          "Knowledge base access",
          "Coach Rick AI assistant",
          "Monday night group coaching",
        ];
      default:
        return [];
    }
  };

  const getTierPricing = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "elite":
        return { monthly: 199, annual: 1679 };
      case "pro":
        return { monthly: 99, annual: 839 };
      case "athlete":
        return { monthly: 49, annual: 409 };
      default:
        return { monthly: 0, annual: 0 };
    }
  };

  const features = getTierFeatures(targetTier);
  const pricing = getTierPricing(targetTier);
  const annualSavings = (pricing.monthly * 12 - pricing.annual).toFixed(
    0
  );

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default: Open Whop checkout
      // In production, this should link to actual Whop checkout URL
      window.open("https://whop.com/your-product-link", "_blank");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900/50 to-purple-900/50 border-orange-500/30 p-6 shadow-xl">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Upgrade to BARRELS {targetTier}
          </h3>
          <p className="text-gray-300">
            Unlock premium features and take your training to the next
            level
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-white">
              ${pricing.monthly}
            </span>
            <span className="text-gray-400">/month</span>
          </div>
          <div className="text-sm text-gray-300">
            or ${pricing.annual}/year{" "}
            <span className="text-green-400 font-semibold">
              (save ${annualSavings})
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {features.slice(0, 5).map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-200 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
        >
          Upgrade Now
          <ArrowUpRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Trust Badge */}
        <p className="text-xs text-center text-gray-400">
          Cancel anytime • 100% satisfaction guaranteed
        </p>
      </div>
    </Card>
  );
}
