"use client"

import React, { useRef, useState, useEffect } from 'react'

interface ScrollableBodyProps {
    children: React.ReactNode
    className?: string
}

/**
 * Premium Scrollable Body Component
 * Implements mandatory CardBody -> ScrollContainer structure
 * with dynamic scroll fade masks.
 */
export function ScrollableBody({ children, className = "" }: ScrollableBodyProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [fadeState, setFadeState] = useState<'none' | 'top' | 'bottom' | 'both'>('none')

    const updateFadeState = () => {
        const el = scrollRef.current
        if (!el) return

        const { scrollTop, scrollHeight, clientHeight } = el
        const isScrollable = scrollHeight > clientHeight

        if (!isScrollable) {
            setFadeState('none')
            return
        }

        const isAtTop = scrollTop <= 4
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 4

        if (!isAtTop && !isAtBottom) {
            setFadeState('both')
        } else if (isAtTop) {
            setFadeState('bottom')
        } else if (isAtBottom) {
            setFadeState('top')
        }
    }

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        updateFadeState()

        // Check on resize (content might change)
        const observer = new ResizeObserver(updateFadeState)
        observer.observe(el)

        // Also check children specifically if they change height
        const childObserver = new MutationObserver(updateFadeState)
        childObserver.observe(el, { childList: true, subtree: true })

        return () => {
            observer.disconnect()
            childObserver.disconnect()
        }
    }, [])

    const getMaskClass = () => {
        switch (fadeState) {
            case 'top': return 'scroll-mask-top'
            case 'bottom': return 'scroll-mask-bottom'
            case 'both': return 'scroll-mask-both'
            default: return ''
        }
    }

    return (
        <div className={`card-body ${className}`}>
            <div
                ref={scrollRef}
                onScroll={updateFadeState}
                className={`card-scroll-container ${getMaskClass()} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth`}
            >
                <div className="card-scroll-content">
                    {children}
                </div>
            </div>
        </div>
    )
}
