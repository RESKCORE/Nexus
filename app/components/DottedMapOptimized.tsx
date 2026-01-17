"use client";

import { useMemo, memo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Marker, type Coordinates, type ProjectionConfig } from "@vnedyalk0v/react19-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { geoMercator } from "d3-geo";
import dottedMapData from "../data/dotted-map-data.json";
import { regionMarkers, topCountries, countryRequests } from "../data/country-data";
import { useStorm } from "../context/StormContext";

const countryColors: Record<string, string> = {
  US: "#1e40af", DE: "#FFCE00", GB: "#2563eb", IN: "#f59e0b", BR: "#FF0000",
  SG: "#f59e0b", JP: "#dc143c", FR: "#1d4ed8", CA: "#b91c1c", SE: "#2563eb",
  AU: "#3b82f6", KR: "#3b82f6", NL: "#ea580c", CN: "#991b1b", RU: "#FF0000",
  MX: "#15803d", ES: "#b91c1c", IT: "#15803d", PL: "#dc2626", TR: "#b91c1c",
  ID: "#1e40af", TH: "#15803d", VN: "#991b1b", PH: "#15803d", EG: "#1e40af",
  NG: "#2563eb", PK: "#FFCE00", BD: "#991b1b", AR: "#f59e0b", CO: "#FF0000",
  ZA: "#15803d", SA: "#FFCE00", MY: "#991b1b", CL: "#991b1b", PE: "#1e40af", AE: "#f59e0b",
};

const getCountryColor = (iso2: string, isStormActive = false): string => {
  const baseColor = countryColors[iso2] || "#666666";
  if (isStormActive) {
    const data = countryRequests[iso2];
    if (data && data.value > 3000000000) {
      return data.value > 10000000000 ? "#dc2626" : "#ef4444";
    }
  }
  return baseColor;
};

const top10Countries = new Set(topCountries.slice(0, 10).map((c) => c.code));

const getDotsToShow = (iso2: string): number => {
  const data = countryRequests[iso2];
  if (!data) return 2;
  const rate = (data.value / 260000) * 1000;
  if (rate < 400) return 2;
  if (rate < 1000) return 4;
  if (rate < 5000) return 8;
  if (rate < 10000) return 15;
  if (rate < 50000) return 25;
  return 35;
};

// Simple CSS-animated pixel (no Framer Motion)
const Pixel = memo(({ x, y, color, animate, delay }: { 
  x: number; y: number; color: string; animate: boolean; delay: number 
}) => (
  <rect 
    x={x} 
    y={y} 
    width={3} 
    height={3} 
    fill={color}
    className={animate ? "pixel-pulse" : ""}
    style={{ 
      animationDelay: animate ? `${delay}s` : undefined,
      opacity: animate ? undefined : 0.5
    }}
  />
));
Pixel.displayName = "Pixel";

const EdgeMarker = memo(
  ({ marker, delay, onHover }: { marker: (typeof regionMarkers)[0]; delay: number; onHover: (marker: (typeof regionMarkers)[0] | null) => void }) => (
    <Marker coordinates={marker.coordinates as Coordinates}>
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
        onMouseEnter={() => onHover(marker)}
        onMouseLeave={() => onHover(null)}
        style={{ cursor: "pointer", pointerEvents: "auto" }}
      >
        <polygon
          className="fill-[var(--ds-gray-1000)] stroke-[var(--ds-background-100)]"
          strokeWidth={1}
          strokeOpacity={0.5}
          style={{ paintOrder: "stroke" }}
          points="0,-2.3 -2,1.2 2,1.2"
        />
      </motion.g>
    </Marker>
  )
);
EdgeMarker.displayName = "EdgeMarker";

interface DottedMapProps {
  width?: number;
  height?: number;
}

export default function DottedMap({ width = 1000, height = 560 }: DottedMapProps) {
  const [hoveredMarker, setHoveredMarker] = useState<(typeof regionMarkers)[0] | null>(null);
  const [wavePosition, setWavePosition] = useState(0);
  const { isStormActive, stormMultiplier } = useStorm();

  // Wave animation - sweeps across the map
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePosition(prev => (prev + 2) % (width + 200));
    }, isStormActive ? 30 : 50);
    return () => clearInterval(interval);
  }, [width, isStormActive]);

  const projection = useMemo(
    () => geoMercator().scale(140).center([15, 25]).rotate([0, 0, 0]).translate([width / 2, height / 2]),
    [width, height]
  );

  const pixels = useMemo(() => {
    const arr: Array<{ key: string; x: number; y: number; color: string; animate: boolean; delay: number }> = [];

    Object.entries(dottedMapData as Record<string, Array<{ lon: number; lat: number; cityDistanceRank: number }>>).forEach(
      ([countryCode, cities]) => {
        const dotsToShow = getDotsToShow(countryCode);
        const color = getCountryColor(countryCode, isStormActive);
        const isTop10 = top10Countries.has(countryCode);

        cities.forEach((city) => {
          const coords = projection([city.lon, city.lat]);
          if (!coords) return;
          const [x, y] = coords;
          if (x < 0 || x > width || y < 0 || y > height) return;
          
          const isAnimated = city.cityDistanceRank < dotsToShow;
          const shouldPulse = isAnimated && isTop10 && city.cityDistanceRank < 5;
          
          arr.push({
            key: `${countryCode}-${city.cityDistanceRank}`,
            x, y, color,
            animate: shouldPulse,
            delay: (city.cityDistanceRank * 0.15) % 2
          });
        });
      }
    );
    return arr;
  }, [projection, width, height, isStormActive]);

  const markerDelays = useMemo(() => regionMarkers.map((_, i) => (i * 0.05) % 1), []);

  return (
    <div className="relative w-full">
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes pixel-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        .pixel-pulse {
          animation: pixel-pulse ${isStormActive ? '0.8s' : '1.2s'} ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
        @keyframes wave-sweep {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(${width + 200}px); }
        }
      `}</style>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-[var(--ds-background-100)]">
        {/* Wave effect overlay */}
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor={isStormActive ? "rgba(239,68,68,0.15)" : "rgba(6,182,212,0.1)"} />
            <stop offset="50%" stopColor={isStormActive ? "rgba(239,68,68,0.25)" : "rgba(6,182,212,0.2)"} />
            <stop offset="70%" stopColor={isStormActive ? "rgba(239,68,68,0.15)" : "rgba(6,182,212,0.1)"} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* All pixels in one group */}
        <g>
          {pixels.map((p) => (
            <Pixel key={p.key} x={p.x} y={p.y} color={p.color} animate={p.animate} delay={p.delay} />
          ))}
        </g>

        {/* Wave sweep effect */}
        <rect 
          x={wavePosition - 200} 
          y={0} 
          width={200} 
          height={height} 
          fill="url(#waveGradient)"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>

      {/* Edge markers overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [15, 25], rotate: [0, 0, 0] } as ProjectionConfig}
          width={width}
          height={height}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {() => null}
          </Geographies>
          {regionMarkers.map((marker, index) => (
            <EdgeMarker key={marker.id} marker={marker} delay={markerDelays[index]} onHover={setHoveredMarker} />
          ))}
        </ComposableMap>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredMarker && (() => {
          const coords = projection(hoveredMarker.coordinates);
          if (!coords) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none z-10 bg-[var(--ds-background-200)] border border-[var(--ds-gray-200)] rounded px-2.5 py-1.5 text-xs font-mono shadow-lg whitespace-nowrap"
              style={{ left: `${(coords[0] / width) * 100}%`, top: `${(coords[1] / height) * 100}%`, transform: "translate(-50%, -140%)" }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--ds-gray-1000)]">▲</span>
                <span className="text-[var(--ds-gray-1000)] font-medium">{hoveredMarker.id}</span>
                <span className="text-[var(--ds-gray-500)]">·</span>
                <span className="text-[var(--ds-gray-900)]">{hoveredMarker.name}</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
