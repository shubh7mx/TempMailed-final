
"use client";

import { useEffect } from 'react';

const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

export function GoogleAd() {
  useEffect(() => {
    if (!adsEnabled) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (!adsEnabled) {
    return null;
  }

  return (
    <div className="flex justify-center">
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5298799876063123"
            data-ad-slot="6204377234"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    </div>
  );
}

    
