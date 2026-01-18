"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { LiveCommitTicker } from "./LiveCommitTicker"
import CardWrapper from './CardWrapper'

interface CommitMessage {
  message: string
  repo: string
  author: string
  timestamp: string
}

interface AnalysisData {
  timestamp: string
  sentimentScore: number
  sentimentLabel: 'Positive' | 'Negative' | 'Neutral'
  topLanguages: Record<string, number>
  totalEventsAnalyzed: number
  recentCommits: CommitMessage[]
  eventTypeDistribution: Record<string, number>
}

export function LiveAnalysis() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/analysis')
        const json = await res.json()
        setData(json)
        setIsLoading(false)
      } catch (error) {
        console.error('Analysis fetch failed:', error)
        setIsLoading(false)
      }
    }

    // Fetch immediately
    fetchAnalysis()

    // Then refresh every 15 seconds
    const interval = setInterval(fetchAnalysis, 15000)

    return () => clearInterval(interval)
  }, [])

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'Positive': return '#10b981' // green
      case 'Negative': return '#ef4444' // red
      default: return '#a1a1aa' // gray (more visible)
    }
  }

  const getSentimentEmoji = (label: string) => {
    switch (label) {
      case 'Positive': return '😊'
      case 'Negative': return '😟'
      default: return '😐'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-alpha-100 p-4 md:p-6 w-full min-h-[120px] h-full animate-pulse">
        <div className="space-y-2">
          <div className="h-4 bg-gray-alpha-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-alpha-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <CardWrapper title={"Global Sentiment Analysis"} maxHeight="max-h-[400px]" className="h-full">
      <div className="space-y-2">
        {data ? (
          <>
            <div className="flex items-baseline gap-3">
              <motion.div
                className="text-3xl md:text-4xl tracking-normal font-mono tabular-nums"
                style={{ color: getSentimentColor(data.sentimentLabel) }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {data.sentimentLabel}
              </motion.div>
              <span className="text-lg">{getSentimentEmoji(data.sentimentLabel)}</span>
              <span className="text-sm text-gray-900 font-mono">
                Score: {data.sentimentScore > 0 ? '+' : ''}{data.sentimentScore.toFixed(2)}
              </span>
            </div>

            {/* Sentiment Gauge Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-900 uppercase">
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </div>
              <div className="relative h-2 bg-gray-alpha-200 rounded-full overflow-hidden">
                {/* Gradient background */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #ef4444 0%, #737373 50%, #10b981 100%)'
                  }}
                />
                {/* Score indicator */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 shadow-lg"
                  style={{
                    borderColor: getSentimentColor(data.sentimentLabel),
                    // Map score from [-5, 5] to [0%, 100%]
                    left: `${Math.min(100, Math.max(0, ((data.sentimentScore + 5) / 10) * 100))}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-gray-900">
                <span>-5</span>
                <span>0</span>
                <span>+5</span>
              </div>
            </div>

            {/* Events analyzed indicator */}
            <div className="mt-2 text-xs font-mono text-gray-900">
              <span className="text-gray-1000">{data.totalEventsAnalyzed}</span> events analyzed
            </div>

            {Object.keys(data.topLanguages).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-alpha-200">
                <h3 className="text-xs uppercase font-mono text-gray-900 mb-2">Top Languages Detected</h3>
                <ul className="space-y-1 list-none pl-0">
                  {Object.entries(data.topLanguages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([lang, count]) => (
                      <li key={lang} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-1000">{lang}</span>
                        <span className="text-gray-900">{count} events</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Live Commit Ticker */}
            <div className="mt-3 pt-3 border-t border-gray-alpha-200">
              <LiveCommitTicker
                commits={data.recentCommits || []}
                isLoading={isLoading}
              />
            </div>
          </>
        ) : (
          <div className="text-gray-900 text-sm">Analysis unavailable</div>
        )}
      </div>
    </CardWrapper>
  )
}
