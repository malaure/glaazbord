import clsx from 'clsx'
import type { StatutAffaire, TypeAffaire } from '@/types'

const statutStyles: Record<StatutAffaire, string> = {
  DEVIS: 'bg-powder-50 text-powder-600 border-powder-100',
  FACTURE: 'bg-lavender-50 text-lavender-600 border-lavender-100',
  PAYE: 'bg-mint-50 text-mint-600 border-mint-100',
  ANNULE: 'bg-gray-50 text-gray-400 border-gray-100',
}

const statutLabels: Record<StatutAffaire, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facturé',
  PAYE: 'Payé',
  ANNULE: 'Annulé',
}

const typeStyles: Record<TypeAffaire, string> = {
  BIEN: 'bg-amber-50 text-amber-600',
  SERVICE: 'bg-violet-50 text-violet-500',
  MIXTE: 'bg-teal-50 text-teal-600',
}

export function BadgeStatut({ statut }: { statut: StatutAffaire }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      statutStyles[statut]
    )}>
      {statutLabels[statut]}
    </span>
  )
}

export function BadgeType({ type }: { type: TypeAffaire }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      typeStyles[type]
    )}>
      {type}
    </span>
  )
}
