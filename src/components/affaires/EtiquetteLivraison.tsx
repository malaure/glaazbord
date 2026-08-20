import { X, Printer } from 'lucide-react'
import type { Affaire, Client } from '@/types'
import glaazLogo from '@/assets/glaaz-logo.png'

interface Props {
  affaire: Affaire
  client?: Client
  onClose: () => void
}

const GLAAZ_EXPEDITEUR = {
  nom: 'Luis-Mario De Carvalho EI',
  adresse: '1 Rue des Sakuras',
  villeCp: '59770 Marly, France',
}

function handlePrint() {
  const style = document.createElement('style')
  style.id = 'etiquette-page-style'
  style.textContent = '@page { size: 100mm 150mm; margin: 0; }'
  document.head.appendChild(style)
  const cleanup = () => {
    style.remove()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}

export function EtiquetteLivraison({ affaire, client, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-medium text-text-main">Étiquette de livraison</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={18} /></button>
        </div>

        <div className="p-5 bg-surface flex justify-center overflow-auto">
          <div
            id="etiquette-print"
            style={{
              width: '100mm',
              height: '150mm',
              padding: '5mm',
              background: '#ffffff',
              color: '#000000',
              fontFamily: 'Inter, system-ui, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 0 1px #000',
            }}
          >
            {/* Expéditeur */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3mm', paddingBottom: '3mm', borderBottom: '0.6mm solid #000' }}>
              <img src={glaazLogo} alt="GLAAZ" style={{ width: '13mm', height: '13mm', flexShrink: 0 }} />
              <div style={{ fontSize: '9pt', lineHeight: 1.45 }}>
                <div style={{ fontWeight: 800, fontSize: '13pt', letterSpacing: '0.03em' }}>GLAAZ</div>
                <div>{GLAAZ_EXPEDITEUR.nom}</div>
                <div>{GLAAZ_EXPEDITEUR.adresse}</div>
                <div>{GLAAZ_EXPEDITEUR.villeCp}</div>
              </div>
            </div>

            {/* Destinataire */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4mm 0' }}>
              <div style={{ fontSize: '9pt', fontWeight: 700, letterSpacing: '0.12em' }}>DESTINATAIRE</div>
              <div style={{ fontSize: '19pt', fontWeight: 800, marginTop: '3mm', lineHeight: 1.15 }}>
                {affaire.societe}
              </div>
              {affaire.interlocuteur && (
                <div style={{ fontSize: '12pt', fontWeight: 600, marginTop: '1.5mm' }}>{affaire.interlocuteur}</div>
              )}
              <div style={{ fontSize: '13pt', marginTop: '3mm', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                {client?.adresse || 'ADRESSE NON RENSEIGNÉE'}
              </div>
            </div>

            {/* Contenu du colis */}
            <div style={{ borderTop: '0.6mm solid #000', paddingTop: '3mm', fontSize: '9.5pt', lineHeight: 1.55 }}>
              <div><strong>Réf. devis :</strong> {affaire.refDevis}</div>
              {affaire.refCommandeClient && (
                <div><strong>Réf. commande client :</strong> {affaire.refCommandeClient}</div>
              )}
              <div><strong>Contenu :</strong> {affaire.designation}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-main">Fermer</button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-lavender-500 to-powder-500">
            <Printer size={14} /> Imprimer
          </button>
        </div>
      </div>
    </div>
  )
}
