"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface StormContextType {
  isStormActive: boolean
  stormMultiplier: number
  toggleStorm: () => void
  baseMultiplier: number
}

const StormContext = createContext<StormContextType | undefined>(undefined)

export function StormProvider({ children }: { children: React.ReactNode }) {
  const [isStormActive, setIsStormActive] = useState(false)
  const [stormMultiplier, setStormMultiplier] = useState(1)
  const [autoRevertTimer, setAutoRevertTimer] = useState<NodeJS.Timeout | null>(null)

  // Generate random multiplier between 8-15 when storm activates
  const generateStormMultiplier = useCallback(() => {
    return 8 + Math.random() * 7 // 8-15 range
  }, [])

  const toggleStorm = useCallback(() => {
    setIsStormActive((prev) => {
      const newState = !prev
      
      if (newState) {
        // Activate Peak Storm with random multiplier
        const multiplier = generateStormMultiplier()
        setStormMultiplier(multiplier)
        
        // Auto-revert after 45 seconds (between 30-60s)
        const revertTime = 30000 + Math.random() * 30000
        const timer = setTimeout(() => {
          setIsStormActive(false)
          setStormMultiplier(1)
        }, revertTime)
        
        setAutoRevertTimer(timer)
      } else {
        // Deactivate storm manually
        setStormMultiplier(1)
        if (autoRevertTimer) {
          clearTimeout(autoRevertTimer)
          setAutoRevertTimer(null)
        }
      }
      
      return newState
    })
  }, [generateStormMultiplier, autoRevertTimer])

  // Add subtle fluctuation to multiplier during storm
  useEffect(() => {
    if (!isStormActive) return

    const fluctuationInterval = setInterval(() => {
      setStormMultiplier((current) => {
        const base = 8 + Math.random() * 7
        // Blend current with new random value for smooth transitions
        return current * 0.7 + base * 0.3
      })
    }, 2000)

    return () => clearInterval(fluctuationInterval)
  }, [isStormActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRevertTimer) clearTimeout(autoRevertTimer)
    }
  }, [autoRevertTimer])

  return (
    <StormContext.Provider
      value={{
        isStormActive,
        stormMultiplier: isStormActive ? stormMultiplier : 1,
        toggleStorm,
        baseMultiplier: isStormActive ? stormMultiplier : 1,
      }}
    >
      {children}
    </StormContext.Provider>
  )
}

export function useStorm() {
  const context = useContext(StormContext)
  if (context === undefined) {
    throw new Error("useStorm must be used within a StormProvider")
  }
  return context
}
