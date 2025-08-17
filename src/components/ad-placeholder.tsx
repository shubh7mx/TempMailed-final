
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdPlaceholderProps {
  type: 'vertical' | 'horizontal';
  onAdLoaded?: (isLoaded: boolean) => void;
}

const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

export function AdPlaceholder({ type, onAdLoaded }: AdPlaceholderProps) {
  const isMobile = useIsMobile();
  const ref = React.useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!adsEnabled) {
        if (onAdLoaded) onAdLoaded(false);
        return;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(ref.current);
      }
    };
  }, [onAdLoaded]);
  
  React.useEffect(() => {
    if (isIntersecting) {
      // Simulate ad network loading delay
      const timer = setTimeout(() => {
        setIsLoaded(true);
        if (onAdLoaded) {
          onAdLoaded(true);
        }
      }, 1000); // 1 second delay to simulate loading
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, onAdLoaded]);


  if (!adsEnabled) {
    return null;
  }

  if (!isIntersecting) {
    return <div ref={ref} className={cn({
        "aspect-[160/600] w-full": type === 'vertical',
        "aspect-[728/90] w-full": type === 'horizontal',
      })} />;
  }

  if (!isLoaded) {
    return <div ref={ref} className={cn({
        "aspect-[160/600] w-full": type === 'vertical',
        "aspect-[728/90] w-full": type === 'horizontal',
      })} />;
  }
  
  if (isMobile && type === 'vertical') {
    if (onAdLoaded) {
      onAdLoaded(false);
    }
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-muted/50 border-2 border-dashed border-border flex items-center justify-center rounded-lg text-muted-foreground w-full",
        {
          "aspect-[160/600]": type === 'vertical',
          "aspect-[728/90] max-w-full max-h-[90px]": type === 'horizontal',
        }
      )}
    >
      <div className="text-center">
        <p className="font-bold text-sm">Advertisement</p>
        <p className="text-xs">
          {type === 'vertical' ? '160x600' : '728x90'}
        </p>
      </div>
    </div>
  );
}
