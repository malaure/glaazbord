import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
}

export function Autocomplete({ value, onChange, suggestions, placeholder, className }: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setFilter(value) }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(filter.toLowerCase())
  ).slice(0, 8)

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={filter}
        placeholder={placeholder}
        className={clsx(
          'w-full px-3 py-1.5 text-sm rounded border border-border bg-white',
          'focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-500',
          'placeholder:text-text-muted',
          className
        )}
        onChange={e => {
          setFilter(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-border rounded shadow-modal max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-surface text-text-main"
              onMouseDown={() => {
                onChange(s)
                setFilter(s)
                setOpen(false)
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
