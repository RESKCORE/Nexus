"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatNumber, topCountries } from "../data/country-data"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Info } from "lucide-react"
import { useStorm } from "../context/StormContext"
import { LiveAnalysis } from "./LiveAnalysis"
import CardWrapper from './CardWrapper'
import { useSupabaseData } from "@/lib/hooks/useSupabaseData"

const weighted = [
  { code: "US", weight: 40 },
  { code: "DE", weight: 10 },
  { code: "IN", weight: 12 },
  { code: "GB", weight: 8 },
  { code: "BR", weight: 6 },
  { code: "JP", weight: 5 },
  { code: "SG", weight: 4 },
  { code: "FR", weight: 5 },
  { code: "CA", weight: 4 },
  { code: "SE", weight: 3 },
  { code: "AU", weight: 2 },
  { code: "KR", weight: 2 },
  { code: "NL", weight: 2 },
]

function pickCountry() {
  let r = Math.random() * weighted.reduce((s, c) => s + c.weight, 0)
  for (const c of weighted) {
    if (r < c.weight) return c.code
    r -= c.weight
  }
  return "US"
}

function useAnimatedNumber(baseValue: number, incrementRatePerSecond: number, stormMultiplier = 1) {
  const [value, setValue] = useState(baseValue)
  const [displayRate, setDisplayRate] = useState(incrementRatePerSecond)

  useEffect(() => {
    const updatesPerSecond = 20
    const baseIncrement = incrementRatePerSecond / updatesPerSecond

    const interval = setInterval(() => {
      const variation = 0.7 + Math.random() * 0.6
      const increment = Math.max(1, Math.floor(baseIncrement * variation * stormMultiplier))
      setValue((v) => v + increment)

      const rateVariation = 0.85 + Math.random() * 0.3
      setDisplayRate(Math.floor(incrementRatePerSecond * rateVariation * stormMultiplier))
    }, 1000 / updatesPerSecond)

    return () => clearInterval(interval)
  }, [incrementRatePerSecond, stormMultiplier])

  return { value, rate: displayRate }
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function PixelGridTransition({
  firstContent,
  secondContent,
  isActive,
  gridSize = 30,
  animationStepDuration = 0.3,
  className,
}: {
  firstContent: React.ReactNode
  secondContent: React.ReactNode
  isActive: boolean
  gridSize?: number
  animationStepDuration?: number
  className?: string
}) {
  const [showPixels, setShowPixels] = useState(false)
  const [animState, setAnimState] = useState<"idle" | "growing" | "shrinking">("idle")
  const hasActivatedRef = useRef(false)

  const pixels = useMemo(() => {
    const total = gridSize * gridSize
    const result = []
    for (let n = 0; n < total; n++) {
      const row = Math.floor(n / gridSize)
      const col = n % gridSize
      const color = Math.random() > 0.85 ? "var(--ds-blue-800, #0070f3)" : "var(--ds-gray-200, #333)"
      result.push({ id: n, row, col, color })
    }
    return result
  }, [gridSize])

  const [shuffledOrder, setShuffledOrder] = useState<number[]>([])

  useEffect(() => {
    if (!hasActivatedRef.current && !isActive) return
    if (isActive) hasActivatedRef.current = true

    const indices = pixels.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    setShuffledOrder(indices)

    setShowPixels(true)
    setAnimState("growing")

    const shrinkTimer = setTimeout(() => setAnimState("shrinking"), animationStepDuration * 1000)
    const hideTimer = setTimeout(() => {
      setShowPixels(false)
      setAnimState("idle")
    }, animationStepDuration * 2000)

    return () => {
      clearTimeout(shrinkTimer)
      clearTimeout(hideTimer)
    }
  }, [isActive, animationStepDuration, pixels])

  const delayPerPixel = useMemo(() => animationStepDuration / pixels.length, [animationStepDuration, pixels.length])
  const orderMap = useMemo(() => {
    const map = new Map<number, number>()
    shuffledOrder.forEach((idx, order) => map.set(idx, order))
    return map
  }, [shuffledOrder])

  return (
    <div className={`w-full overflow-hidden max-w-full relative ${className || ""}`}>
      <motion.div
        className="h-full"
        aria-hidden={isActive}
        initial={{ opacity: 1 }}
        animate={{ opacity: isActive ? 0 : 1 }}
        transition={{ duration: 0, delay: animationStepDuration }}
      >
        {firstContent}
      </motion.div>

      <motion.div
        className="absolute inset-0 w-full h-full z-[2] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0, delay: animationStepDuration }}
        style={{ pointerEvents: isActive ? "auto" : "none" }}
        aria-hidden={!isActive}
      >
        {secondContent}
      </motion.div>

      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        <AnimatePresence>
          {showPixels &&
            pixels.map((pixel) => {
              const order = orderMap.get(pixel.id) ?? 0
              return (
                <motion.div
                  key={pixel.id}
                  style={{
                    backgroundColor: pixel.color,
                    aspectRatio: "1 / 1",
                    gridArea: `${pixel.row + 1} / ${pixel.col + 1}`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: animState === "growing" ? 1 : 0,
                    scale: animState === "growing" ? 1 : 0,
                  }}
                  transition={{ duration: 0.01, delay: order * delayPerPixel }}
                />
              )
            })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatCard({
  title,
  baseValue,
  incrementRate,
  children,
  infoContent,
  infoTitle,
  href,
  className,
  stormMultiplier = 1,
}: {
  title: string
  baseValue?: number
  incrementRate?: number
  children?: React.ReactNode
  infoContent?: string
  infoTitle?: string
  href?: string
  className?: string
  stormMultiplier?: number
}) {
  const [showInfo, setShowInfo] = useState(false)
  const { value } = useAnimatedNumber(baseValue || 0, incrementRate || 0, stormMultiplier)

  const statsContent = (
    <div className="bg-gray-alpha-100 p-4 md:p-6 w-full min-h-[120px] h-full">
      <div className="space-y-2">
        <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 pr-6">{title}</h2>
        {baseValue !== undefined && (
          <div className="text-3xl md:text-4xl tracking-normal font-mono tabular-nums">{formatNumber(value)}</div>
        )}
        {children}
      </div>
    </div>
  )

  const infoContentView = (
    <div className="bg-gray-alpha-100 p-4 md:p-6 w-full h-full overflow-y-auto flex flex-col gap-y-2">
      {href ? (
        <a
          href={href}
          tabIndex={showInfo ? 0 : -1}
          className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 hover:underline underline-offset-2 inline-flex gap-x-0.5 items-center w-fit shrink-0"
        >
          {title}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.75011 4H6.00011V5.5H6.75011H9.43945L5.46978 9.46967L4.93945 10L6.00011 11.0607L6.53044 10.5303L10.499 6.56182V9.25V10H11.999V9.25V5C11.999 4.44772 11.5512 4 10.999 4H6.75011Z"
            />
          </svg>
        </a>
      ) : (
        <span className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 shrink-0">
          {title}
        </span>
      )}
      <span className="tracking-tight text-sm text-gray-900 leading-relaxed line-clamp-6">{infoContent}</span>
    </div>
  )

  return (
    <div className={`relative group rounded-md overflow-hidden ${className || ""}`}>
      <div className="bg-gray-alpha-100 p-4 md:p-6 w-full min-h-[120px] h-full">
        <div className="space-y-2">
          <div className="flex items-start justify-between pr-0">
            <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000">{title}</h2>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label={`Learn more about ${title}`}
                  type="button"
                  className="p-1.5 m-0 bg-transparent text-gray-400 hover:text-cyan-400 border-none hover:bg-gray-800/50 transition-all duration-150 flex items-center justify-center outline-none rounded cursor-pointer shrink-0"
                >
                  <Info className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="left"
                align="start"
                sideOffset={8}
                className="w-80 bg-gray-900/95 border border-gray-700 text-gray-200 shadow-2xl rounded-xl p-5"
              >
                <div className="space-y-3">
                  <h3 className="font-mono font-medium text-sm uppercase text-gray-100">{infoTitle || title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{infoContent}</p>
                  {baseValue !== undefined && (
                    <p className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                      Current simulated value: <span className="text-cyan-400 font-mono">{formatNumber(value)}</span>
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {baseValue !== undefined && (
            <div className="text-3xl md:text-4xl tracking-normal font-mono tabular-nums">{formatNumber(value)}</div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  baseValue,
  incrementRate,
  showRate = false,
  stormMultiplier = 1,
}: { label: string; baseValue: number; incrementRate: number; showRate?: boolean; stormMultiplier?: number }) {
  const { value, rate } = useAnimatedNumber(baseValue, incrementRate, stormMultiplier)

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3">
      <h3 className="m-0 font-mono font-normal text-sm text-gray-900 uppercase">{label}</h3>
      <div className="flex items-center gap-3 md:gap-4 text-right">
        <div className="text-gray-1000 text-sm font-mono tabular-nums">{formatNumber(value)}</div>
        {showRate && (
          <div className="w-16 text-gray-900 text-right text-sm font-mono tabular-nums">
            <span>{formatNumber(rate)}</span>
            <span aria-label="per second">/s</span>
          </div>
        )}
      </div>
    </li>
  )
}

export function TotalContributions() {
  const { isStormActive, stormMultiplier, toggleStorm } = useStorm()
  const { totalContributions, overview, loading } = useSupabaseData()

  // Use real total from database, with fallback for loading state
  const realTotal = useMemo(() => {
    if (loading || !overview) return 115833330378 // Fallback while loading
    // Use the calculated total from country stats, or compute from overview
    return totalContributions > 0 ? totalContributions : (overview.totalStars + overview.totalCommits)
  }, [totalContributions, overview, loading])

  // Calculate dynamic increment rate based on database size
  const incrementRate = useMemo(() => {
    // Base rate scales with total size (roughly 0.4% of total per second as simulation)
    const baseRate = Math.max(100000, Math.floor(realTotal * 0.000004))
    return baseRate
  }, [realTotal])

  const { value, rate } = useAnimatedNumber(realTotal, incrementRate, stormMultiplier)

  return (
    <div className="space-y-2 relative">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-900">Total contributions</h2>
      <div className="text-4xl md:text-5xl tracking-normal font-mono tabular-nums">{formatNumber(value)}</div>
      <motion.div
        className="text-sm text-gray-900 font-mono tabular-nums"
        animate={{
          color: isStormActive ? ["#737373", "#ef4444", "#737373"] : "#737373",
        }}
        transition={{
          duration: isStormActive ? 0.8 : 0.3,
          repeat: isStormActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {formatNumber(rate)}/s
      </motion.div>
      <button
        onClick={toggleStorm}
        className="absolute bottom-0 right-0 text-xs font-mono uppercase px-2 py-1 bg-gray-alpha-100 hover:bg-gray-alpha-200 border border-gray-alpha-400 rounded text-gray-900 transition-colors"
      >
        {isStormActive ? "End Storm" : "Peak Storm"}
      </button>
    </div>
  )
}

function CountryRow({
  country,
  incrementRate,
  stormMultiplier = 1,
}: { country: (typeof topCountries)[0]; incrementRate: number; stormMultiplier?: number }) {
  const { value, rate } = useAnimatedNumber(country.requests, incrementRate, stormMultiplier)

  return (
    <li className="flex items-center w-full md:w-fit justify-between md:justify-start">
      <span aria-hidden="true" className="inline-block translate-y-[-2px] translate-x-[2px]">
        <span style={{ color: country.color, opacity: 1 }}>■</span>
      </span>
      <div className="text-left">
        <h3 className="inline-block my-0 font-medium text-[16px]" style={{ color: country.color }}>
          &nbsp;{country.code}
        </h3>
      </div>
      <div className="w-[16ch] text-right">
        <span className="inline-flex tabular-nums">{formatNumber(value)}</span>
      </div>
      <div className="w-[10ch] ml-auto text-right text-gray-900">
        <span>{formatNumber(rate)}</span>
        <span className="lowercase" aria-label="per second">
          /s
        </span>
      </div>
    </li>
  )
}

export function TopCountries() {
  const { stormMultiplier } = useStorm()
  const { topCountries: realTopCountries, loading } = useSupabaseData()

  // Map real country data to match the expected format
  const countriesWithColors = useMemo(() => {
    // Country code to color mapping
    const colorMap: Record<string, string> = {
      US: "#1e40af", DE: "#FFCE00", GB: "#2563eb", IN: "#f59e0b",
      BR: "#FF0000", SG: "#f59e0b", JP: "#dc143c", FR: "#1d4ed8",
      CA: "#b91c1c", SE: "#2563eb", AU: "#3b82f6", KR: "#3b82f6",
      NL: "#ea580c", CN: "#991b1b", ES: "#b91c1c", IT: "#15803d",
    }

    return realTopCountries.map(country => ({
      code: country.code,
      name: country.code, // Could be expanded with full names
      requests: country.totalContributions,
      color: colorMap[country.code] || "#3b82f6",
    }))
  }, [realTopCountries])

  // Calculate increment rates based on actual contribution values
  const calculateIncrementRate = (totalContributions: number) => {
    // Roughly 0.4% of total per second as base rate
    return Math.max(1000, Math.floor(totalContributions * 0.000004))
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-900">
          Top countries by contributions
        </h2>
        <div className="text-gray-900 text-sm font-mono animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-900">
        Top countries by contributions
      </h2>
      <ul className="list-none pl-0 space-y-1">
        {countriesWithColors.slice(0, 8).map((country) => (
          <CountryRow
            key={country.code}
            country={country}
            incrementRate={calculateIncrementRate(country.requests)}
            stormMultiplier={stormMultiplier}
          />
        ))}
      </ul>
    </div>
  )
}

export function RegionCount() {
  const { activeRegions, loading } = useSupabaseData()
  const [regionCount, setRegionCount] = useState(activeRegions || 19)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      // Fluctuate between 18-21
      setRegionCount(prev => {
        const baseValue = activeRegions || 19
        const change = Math.random() > 0.5 ? 1 : -1
        const newVal = prev + (Math.random() > 0.7 ? change : 0)
        return Math.max(baseValue - 2, Math.min(baseValue + 2, newVal))
      })
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [activeRegions])

  // Sync display when real data arrives
  useEffect(() => {
    if (activeRegions > 0) {
      setRegionCount(activeRegions)
    }
  }, [activeRegions])


  return (
    <div className="flex items-center w-full md:w-fit justify-between md:justify-start mt-2">
      <span aria-hidden="true" className="inline-block translate-y-[-2px] translate-x-[2px]">
        <span className="text-[10px]">▲</span>
      </span>
      <div className="text-left">
        {mounted ? (
          <motion.span
            key={regionCount}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block my-0 font-medium text-[16px]"
          >
            &nbsp;{regionCount}
          </motion.span>
        ) : (
          <span className="inline-block my-0 font-medium text-[16px]">&nbsp;{activeRegions || 19}</span>
        )}
        <span className="font-medium text-[16px] text-gray-900 tracking-tight">&nbsp;Global regions</span>
      </div>
    </div>
  )
}

// Dynamic metrics that update in real-time
function useDynamicMetrics() {
  const { stormMultiplier } = useStorm()
  const [mergeTime, setMergeTime] = useState(4.2)
  const [peakHour, setPeakHour] = useState(14)
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [threatPercent, setThreatPercent] = useState(15)
  const [hitRate, setHitRate] = useState(99.7)
  const [bandwidthSaved, setBandwidthSaved] = useState(847)
  const [responseTime, setResponseTime] = useState(12)
  const [blockedBots, setBlockedBots] = useState(['spam-bot-4821', 'fake-contributor'])

  useEffect(() => {
    const interval = setInterval(() => {
      // Merge time varies 3-6 hours, faster during storm
      const baseMergeTime = stormMultiplier > 1 ? 3.2 : 4.5
      setMergeTime(baseMergeTime + (Math.random() - 0.5) * 1.2)

      // Peak hour shifts gradually
      setPeakHour(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
        return Math.max(0, Math.min(23, prev + change))
      })

      // Threat level based on storm and random spikes
      const threatValue = (stormMultiplier - 1) * 20 + Math.random() * 40
      if (threatValue > 50) {
        setThreatLevel('HIGH')
        setThreatPercent(65 + Math.random() * 25)
      } else if (threatValue > 25) {
        setThreatLevel('MEDIUM')
        setThreatPercent(35 + Math.random() * 20)
      } else {
        setThreatLevel('LOW')
        setThreatPercent(10 + Math.random() * 15)
      }

      // Cache hit rate 98.5-99.9%
      setHitRate(98.5 + Math.random() * 1.4)

      // Bandwidth saved increments
      setBandwidthSaved(prev => prev + Math.floor(Math.random() * 3))

      // Response time 10-20ms
      setResponseTime(10 + Math.random() * 10)

      // Random bot names every few seconds
      if (Math.random() > 0.7) {
        const prefixes = ['spam-bot', 'fake-user', 'malware-acc', 'bot-farm', 'phish-actor']
        const newBot = `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${Math.floor(Math.random() * 9999)}`
        setBlockedBots([newBot, blockedBots[0]])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [stormMultiplier, blockedBots])

  return { mergeTime, peakHour, threatLevel, threatPercent, hitRate, bandwidthSaved, responseTime, blockedBots }
}

// Animated Activity Chart - bars that update in real-time
function ActivityChart() {
  // Fixed initial values for SSR
  const initialValues = [3, 5, 4, 6, 8, 7, 9, 12, 14, 11, 9, 8, 6, 10, 15, 18, 16, 12, 9, 7, 5, 4, 3, 4]
  const [baseValues, setBaseValues] = useState(initialValues)
  const [barHeights, setBarHeights] = useState(initialValues)
  const { stormMultiplier } = useStorm()

  // Randomize base values only on client mount
  useEffect(() => {
    const randomBases = Array.from({ length: 24 }, () => 5 + Math.floor(Math.random() * 14))
    setBaseValues(randomBases)
    setBarHeights(randomBases)
  }, [])

  // Animate bars every second with smooth random variations
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights(prev => prev.map((base, i) => {
        // Random fluctuation ±30% of base value, affected by storm
        const variation = (Math.random() - 0.5) * 0.6 * baseValues[i]
        const stormBoost = stormMultiplier > 1 ? (stormMultiplier - 1) * 3 : 0
        const newVal = baseValues[i] + variation + stormBoost
        return Math.max(2, Math.min(20, newVal)) // Clamp between 2-20
      }))
    }, 800) // Update every 800ms for smooth feel

    return () => clearInterval(interval)
  }, [stormMultiplier])

  return (
    <div className="mt-3">
      <div className="text-[10px] font-mono text-gray-900 uppercase mb-1">Activity (24h)</div>
      <div className="flex gap-0.5 h-28">
        {barHeights.map((v, i) => (
          <div key={i} className="flex-1 bg-cyan-500/20 rounded-sm relative overflow-hidden">
            <motion.div
              className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-sm"
              initial={{ height: `${(baseValues[i] / 20) * 100}%` }}
              animate={{ height: `${(v / 20) * 100}%` }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 w-full bg-gradient-to-t from-white/30 to-transparent rounded-sm"
              initial={{ height: `${(baseValues[i] / 20) * 100}%` }}
              animate={{
                height: `${(v / 20) * 100}%`,
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                height: { duration: 0.5, ease: "easeInOut" },
                opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </div>
        ))}
      </div>
      {/* Time labels for non-technical users */}
      <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-900">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>Now</span>
      </div>
    </div>
  )
}

export function StatsGrid() {
  const { overview, topLanguages, allLanguages, topRepos, recentTrends, loading, lastUpdated } = useSupabaseData()

  // Compute real stats from database
  const totalForks = topRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0)
  const totalPRs = topRepos.reduce((sum, r) => sum + (r.pull_requests || 0), 0)
  const totalContributors = topRepos.reduce((sum, r) => sum + (r.contributors || 0), 0)

  // Language distribution sorted by stars
  const languagesByStars = [...(allLanguages || [])].sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0))
  const languagesByRepos = [...(allLanguages || [])].sort((a, b) => b.repo_count - a.repo_count)

  // License breakdown from repos  
  const licenseStats = topRepos.reduce((acc, r) => {
    const license = r.licence || 'Unknown'
    acc[license] = (acc[license] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topLicenses = Object.entries(licenseStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / topRepos.length) * 100) }))

  // Format large numbers
  const formatNum = (n: number) => {
    if (n >= 1000000000) return `${(n / 1000000000).toFixed(1)}B`
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString()
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-1.5 h-auto lg:h-[600px]">
      {/* 
        Grid Layout Strategy:
        We define a strict 4-column, 2-row grid for desktop (lg).
        Height is constrained to 600px total on desktop to match the previous design intent but with strict alignment.
        On mobile/tablet, it flows naturally.
      */}

      {/* 1. Database Overview (Col 1, Row 1) */}
      <CardWrapper title={"Database Overview"} maxHeight="max-h-[400px]" className="h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">REPOSITORIES</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-cyan-400 font-mono text-xl font-medium"
              >
                {formatNum(overview?.totalRepos || 0)}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">TOTAL STARS</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400 font-mono text-xl font-medium"
              >
                {formatNum(overview?.totalStars || 0)}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">TOTAL COMMITS</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 font-mono text-xl font-medium"
              >
                {formatNum(overview?.totalCommits || 0)}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">LANGUAGES</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-purple-400 font-mono text-xl font-medium"
              >
                {overview?.uniqueLanguages || 0}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">TOTAL FORKS</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-orange-400 font-mono text-xl font-medium"
              >
                {formatNum(totalForks)}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">PULL REQUESTS</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-pink-400 font-mono text-xl font-medium"
              >
                {formatNum(totalPRs)}
              </motion.span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-1000 text-sm font-mono">CONTRIBUTORS</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-400 font-mono text-xl font-medium"
              >
                {formatNum(totalContributors)}
              </motion.span>
            </div>
          </div>
        )}
        {lastUpdated && (
          <div className="text-[10px] font-mono text-gray-500 text-center">Last updated: {lastUpdated.toLocaleTimeString()}</div>
        )}
      </CardWrapper>

      {/* 2. Top Repositories (Col 2, Row 1 & 2 - Spans 2 Rows) */}
      <CardWrapper title={"Top Repositories"} maxHeight="max-h-[600px]" className="lg:row-span-2 h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-2">
            {topRepos.slice(0, 20).map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="list-item repo-item flex flex-col p-3 bg-gray-900/40 rounded border border-gray-alpha-200 hover:border-cyan-500/30 transition-all duration-150"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-1000 font-mono text-sm truncate max-w-[160px]">
                    <span className="text-gray-500 text-xs mr-2">{i + 1}.</span> {repo.name}
                  </span>
                  <span className="text-yellow-400 font-mono text-sm whitespace-nowrap ml-2 flex items-center gap-1">
                    <span className="font-mono">{formatNum(repo.stars_count)}</span>
                    <span aria-hidden className="star-icon">⭐</span>
                  </span>
                </div>
                <div className="flex gap-3 mt-2 text-[11px] font-mono text-gray-400">
                  {repo.primary_language && (
                    <span className="text-purple-400">{repo.primary_language}</span>
                  )}
                  <span className="text-gray-500">🍴 <span className="font-mono">{formatNum(repo.forks_count)}</span></span>
                  {repo.commit_count > 0 && <span className="text-gray-500">📝 <span className="font-mono">{formatNum(repo.commit_count)}</span></span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardWrapper>

      {/* 3. Languages by Stars (Col 3, Row 1) */}
      <CardWrapper title={"Languages by Stars"} maxHeight="max-h-[400px]" className="h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-1.5">
            {languagesByStars.slice(0, 15).map((lang, i) => (
              <div key={i} className="list-item lang-item flex justify-between items-center text-xs font-mono p-2 rounded">
                <span className="text-gray-1000 truncate">
                  <span className="text-gray-500 mr-2">{i + 1}.</span> {lang.primary_language}
                </span>
                <span className="text-yellow-400 font-mono">{formatNum(lang.total_stars || 0)} <span aria-hidden className="star-icon">⭐</span></span>
              </div>
            ))}
          </div>
        )}
      </CardWrapper>

      {/* 4. License Distribution (Col 4, Row 1) */}
      <CardWrapper title={"License Distribution"} maxHeight="max-h-[400px]" className="h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-2">
            {topLicenses.map((license, i) => (
              <div key={i} className="license-item list-item space-y-1 p-2 rounded">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-1000 truncate max-w-[120px]">{license.name}</span>
                  <span className="text-cyan-400 font-mono">{license.count} (<span className="text-gray-400">{license.percentage}%</span>)</span>
                </div>
                <div className="h-1 bg-gray-alpha-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${license.percentage}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardWrapper>

      {/* 5. Live Analysis (Col 1, Row 2) 
          Note: In CSS Grid, order is strictly by DOM order unless customized with grid-row/col.
          We want this in the first column, second row.
      */}
      <div className="rounded-md overflow-hidden h-full">
        {/* LiveAnalysis contains its own card-root, so we just wrap it to ensure it fills the grid cell */}
        <LiveAnalysis />
      </div>

      {/* 6. Languages by Repos (Col 3, Row 2) */}
      <CardWrapper title={"Languages by Repos"} maxHeight="max-h-[400px]" className="h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-1.5">
            {languagesByRepos.slice(0, 15).map((lang, i) => (
              <div key={i} className="list-item lang-item flex justify-between items-center text-xs font-mono p-2 rounded">
                <span className="text-gray-1000 truncate">
                  <span className="text-gray-500 mr-2">{i + 1}.</span> {lang.primary_language}
                </span>
                <div className="flex gap-2">
                  <span className="text-cyan-400 font-mono">{lang.repo_count} repos</span>
                  <span className="text-gray-500">({formatNum(lang.avg_stars)} avg)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardWrapper>

      {/* 7. Yearly Trends (Col 4, Row 2) */}
      <CardWrapper title={"Yearly Trends"} maxHeight="max-h-[400px]" className="h-full">
        {loading ? (
          <div className="text-gray-400 text-sm font-mono animate-pulse px-2 py-4">Loading...</div>
        ) : (
          <div className="space-y-2">
            {recentTrends.slice(0, 10).map((trend, i) => (
              <motion.div
                key={trend.year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="list-item trend-item flex justify-between items-center text-xs font-mono p-2 bg-transparent rounded border border-gray-alpha-200 hover:border-cyan-500/20 transition-all duration-150"
              >
                <span className="text-gray-1000 font-medium">{trend.year}</span>
                <div className="flex gap-3">
                  <span className="text-cyan-400 font-mono">{trend.repos_created} repos</span>
                  <span className="text-yellow-400 font-mono">{formatNum(trend.avg_stars)} avg <span aria-hidden className="star-icon">⭐</span></span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardWrapper>
    </div>
  )
}
