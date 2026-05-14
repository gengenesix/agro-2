'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback }       from 'react'
import { SearchIcon, CloseIcon }       from '@/components/shared/icons'

interface ProduceSearchProps {
  initialValue?: string
}

export function ProduceSearch({ initialValue = '' }: ProduceSearchProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialValue)

  const submit = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term.trim()) {
      params.set('search', term.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  return (
    <form
      onSubmit={e => { e.preventDefault(); submit(value) }}
      className="relative"
    >
      <SearchIcon
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search maize, tomatoes, fertiliser…"
        className="w-full pl-10 pr-10 py-3 bg-white border border-border rounded-2xl text-sm
                   text-forest placeholder:text-muted-foreground focus:border-forest focus:outline-none
                   focus:ring-2 focus:ring-forest/10 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); submit('') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-forest"
        >
          <CloseIcon size={15} />
        </button>
      )}
    </form>
  )
}
