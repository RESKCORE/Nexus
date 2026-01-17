"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Use optimized map with CSS animations instead of Framer Motion per-dot
const DottedMap = dynamic(() => import("./DottedMapOptimized"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] flex items-center justify-center bg-[var(--ds-background-100)] rounded-md">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-gray-500 uppercase">Loading Map...</span>
      </div>
    </div>
  ),
});

export default function MapContainer() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="w-full h-[560px] flex items-center justify-center bg-[var(--ds-background-100)] rounded-md">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-gray-500 uppercase">Initializing...</span>
        </div>
      </div>
    );
  }
  
  return <DottedMap />;
}
