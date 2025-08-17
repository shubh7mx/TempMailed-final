
"use client";

import { AdPlaceholder } from "@/components/ad-placeholder";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

export function StickyAd() {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // If ads are disabled globally, ensure the component state reflects that.
    if (!adsEnabled) {
      setIsAdLoaded(false);
    }
  }, []);

  if (!adsEnabled || !isOpen || !isAdLoaded) {
    // Render a placeholder div to trigger the ad loading,
    // but keep it visually hidden. This is important for the callback to work.
    return (
      <div style={{ opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}>
        <AdPlaceholder type="horizontal" onAdLoaded={setIsAdLoaded} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-2">
      <div className="container mx-auto relative flex justify-center items-center max-w-[728px]">
        <AdPlaceholder type="horizontal" onAdLoaded={setIsAdLoaded} />
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-2 -right-2 h-6 w-6 bg-secondary text-muted-foreground rounded-full flex items-center justify-center border border-border"
          aria-label="Close ad"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
