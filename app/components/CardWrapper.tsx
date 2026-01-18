"use client"

import React from 'react'

interface CardWrapperProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxHeight?: string // e.g. 'max-h-[400px]'
}

export default function CardWrapper({ title, subtitle, children, className = '', maxHeight = 'max-h-[400px]' }: CardWrapperProps) {
  return (
    <div className={`card-root bg-[#1a1a1a] ${maxHeight} ${className} rounded-md border border-gray-800 overflow-hidden flex flex-col`}>
      <div className="flex-none px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase text-gray-1000 tracking-tight">{title}</div>
          {subtitle ? <div className="text-xs text-gray-400 font-mono">{subtitle}</div> : null}
        </div>
      </div>

      {/* Scrollable content area - hidden scrollbar on supported browsers, smooth scrolling, good padding */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth px-3 py-3" style={{ WebkitOverflowScrolling: 'touch' as any }}>
        <div className="pt-0 pb-6">{children}</div>
      </div>
    </div>
  )
}
