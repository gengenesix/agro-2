'use client'

import { useState } from 'react'
import Image        from 'next/image'
import { ChevronRightIcon, ArrowLeftIcon } from '@/components/shared/icons'

interface PhotoGalleryProps {
  photos: string[]
  title:  string
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [active, setActive] = useState(0)
  const list = photos.length > 0 ? photos : ['/placeholder-farm.jpg']

  function prev() { setActive(i => (i - 1 + list.length) % list.length) }
  function next() { setActive(i => (i + 1) % list.length) }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video bg-cream-dark rounded-2xl overflow-hidden">
        <Image
          key={list[active]}
          src={list[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />
        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm
                         rounded-full flex items-center justify-center text-white hover:bg-black/60
                         transition-colors"
            >
              <ArrowLeftIcon size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm
                         rounded-full flex items-center justify-center text-white hover:bg-black/60
                         transition-colors"
            >
              <ChevronRightIcon size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2 h-2 rounded-full transition-all
                    ${i === active ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-semibold
                        px-2.5 py-1 rounded-full backdrop-blur-sm">
          {active + 1}/{list.length}
        </div>
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all
                          ${i === active ? 'border-forest' : 'border-border hover:border-forest/40'}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
