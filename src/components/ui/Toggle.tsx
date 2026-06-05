import clsx from 'clsx'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  date?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, date, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex flex-col items-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-default group'
      )}
    >
      <div className={clsx(
        'w-8 h-4 rounded-full transition-colors relative',
        checked ? 'bg-mint-500' : 'bg-gray-200 group-hover:bg-gray-300'
      )}>
        <div className={clsx(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )} />
      </div>
      {date && (
        <span className="text-2xs text-text-muted whitespace-nowrap">
          {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
        </span>
      )}
      {!date && label && (
        <span className="text-2xs text-text-muted">{label}</span>
      )}
    </button>
  )
}
