"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitCommit, RefreshCw } from "lucide-react"

interface CommitMessage {
  message: string
  repo: string
  author: string
  timestamp: string
}

interface TickerProps {
  commits: CommitMessage[]
  isLoading: boolean
}

export function LiveCommitTicker({ commits, isLoading }: TickerProps) {
  const [visibleCommits, setVisibleCommits] = useState<CommitMessage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rotate through commits one at a time for ticker effect
  useEffect(() => {
    if (commits.length === 0) return

    // Initialize with first few commits
    setVisibleCommits(commits.slice(0, 3))

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % commits.length
        return next
      })
    }, 3000) // Show new commit every 3 seconds

    return () => clearInterval(interval)
  }, [commits])

  // Update visible commits when index changes
  useEffect(() => {
    if (commits.length === 0) return
    
    // Get 3 commits starting from currentIndex, wrapping around
    const newVisible: CommitMessage[] = []
    for (let i = 0; i < Math.min(3, commits.length); i++) {
      const idx = (currentIndex + i) % commits.length
      newVisible.push(commits[idx])
    }
    setVisibleCommits(newVisible)
  }, [currentIndex, commits])

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    
    if (diffSec < 60) return `${diffSec}s ago`
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
    return `${Math.floor(diffSec / 3600)}h ago`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-900 uppercase mb-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Loading...
        </div>
        <div className="h-[100px] space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-alpha-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className="h-[100px] flex items-center justify-center text-xs font-mono text-gray-900">
        No recent commits in stream
      </div>
    )
  }

  return (
    <div className="flex flex-col" ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-900 uppercase">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <GitCommit className="h-3 w-3 text-green-500" />
          </motion.div>
          Live Commit Stream
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-900">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="h-[100px] overflow-hidden space-y-1">
        <AnimatePresence mode="sync">
          {visibleCommits.map((commit, index) => (
            <motion.div
              key={`${commit.repo}-${commit.message}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.2,
                delay: index * 0.03
              }}
              className="bg-gray-alpha-100 rounded px-2 py-1.5 border-l-2 border-green-500/50 h-[30px] overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-mono text-gray-1000 truncate flex-1 leading-tight">
                  "{commit.message}"
                </p>
                <span className="text-[9px] font-mono text-gray-900 whitespace-nowrap shrink-0">
                  {getTimeAgo(commit.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-cyan-400 truncate">
                  {commit.repo}
                </span>
                <span className="text-[10px] text-gray-900">•</span>
                <span className="text-[10px] font-mono text-gray-900 truncate">
                  {commit.author}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
