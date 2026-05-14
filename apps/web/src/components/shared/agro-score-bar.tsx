'use client'

import { useEffect, useState } from 'react'

interface AgroScoreBarProps {
  score:       number
  showLabel?:  boolean
  size?:       'sm' | 'md' | 'lg'
  animated?:   boolean
}

export function AgroScoreBar({ score, showLabel = true, size = 'md', animated = true }: AgroScoreBarProps) {
  const [width, setWidth] = useState(animated ? 0 : (score / 110) * 100)

  useEffect(() => {
    if (!animated) return
    const t = setTimeout(() => setWidth((score / 110) * 100), 100)
    return () => clearTimeout(t)
  }, [score, animated])

  const color = score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'
  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Building'
  const heights: Record<string, string> = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">AgroScore</span>
          <span className="text-[11px] font-bold text-forest font-mono">
            {score}/110 · {label}
          </span>
        </div>
      )}
      <div
        className={`w-full bg-cream-dark rounded-full overflow-hidden ${heights[size]}`}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemax={110}
        aria-label={`AgroScore: ${score} out of 110`}
      >
        <div
          className={`h-full rounded-full ${color} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
