import { useState } from 'react'
import { ChevronDown, ChevronRight, Zap, Printer, Eye, EyeOff } from 'lucide-react'
import { formaterEuros } from '@/utils/calculs'
import clsx from 'clsx'

// ─── Constantes machine ───────────────────────────────────────────────────────
// Source : feuille ⚙️ Paramètres — GLAAZ_Calculateur_Gravure_Laser.xlsx (10/06/2026)
const AMORTISSEMENT  = 4570 / (4 * 600)                           // 1.9042 €/h
const ELECTRICITE    = (920 / 1000) * 0.65 * 0.2516               // 0.1505 €/h
const FILTRES_AP2    = 20.99 * (1/100 + 1/200 + 1/600 + 1/300 + 1/300) // 0.4898 €/h
const OPTIQUES_P2S   = 25/500 + 35/1000 + 15/800                  // 0.1038 €/h
const COUT_MACHINE_H = AMORTISSEMENT + ELECTRICITE + FILTRES_AP2 + OPTIQUES_P2S // ~2.648 €/h

const COEFF_MATIERE  = 2.306   // laser : fixe (source grille laser)
const TAUX_BIEN      = 0.133   // BIC ventes : 12,3% cot. + 1% IR
const TAUX_SERVICE   = 0.278   // BNC créa : 25,6% cot. + 2,2% IR

// Adhésif 3M — prix HT fournisseur pour la plaque complète, ajouté à l'achat matière (avant TVA)
const ADHESIF_467MP  = 6.18    // standard
const ADHESIF_468MP  = 11.59   // renforcé
type AdhesifType = 'aucun' | '467' | '468'

type TabId = 'laser' | 'pao'

function fmt(n: number) { return formaterEuros(n) }

function InputField({ label, value, onChange, unit = '€', placeholder = '0' }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-muted">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" min="0" step="any" value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded border border-border text-sm text-text-main bg-white focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-100"
        />
        <span className="text-xs text-text-muted shrink-0">{unit}</span>
      </div>
    </div>
  )
}

function ResultRow({ label, value, accent = false, muted = false, hide = false }: {
  label: string; value: string; accent?: boolean; muted?: boolean; hide?: boolean
}) {
  if (hide) return null
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
      <span className={`text-xs ${muted ? 'text-text-muted' : 'text-text-main'}`}>{label}</span>
      <span className={clsx(
        'text-sm font-medium tabular-nums',
        accent ? 'text-mint-600' : muted ? 'text-text-muted' : 'text-text-main'
      )}>
        {value}
      </span>
    </div>
  )
}

export function CalculateurLaser() {
  const [tab, setTab]   = useState<TabId>('laser')
  const [prive, setPrive] = useState(false)

  // ── Laser ─────────────────────────────────────────────────────────────────
  const [tauxHoraire, setTauxHoraire] = useState(() => parseFloat(localStorage.getItem('laser-taux-horaire') ?? '25'))
  const [tauxInput, setTauxInput]     = useState(() => localStorage.getItem('laser-taux-horaire') ?? '25')
  // Achat direct : saisie HT (matière + port), TVA 20% ajoutée automatiquement (non récupérable en micro-entreprise)
  const [achatMatHT, setAchatMatHT]           = useState('')
  const [achatPortHT, setAchatPortHT]         = useState('')
  const [adhesif, setAdhesif]                 = useState<AdhesifType>('aucun')   // 3M 467MP / 468MP — ajouté à l'achat HT, prix plaque complète
  const [minutesGravure, setMinutesGravure]   = useState('')   // durée gravure PAR PLAQUE — × nbPieces (champ partagé)
  const [minutesPrepa, setMinutesPrepa]       = useState('')   // prépa fichier : globale, pas multipliée
  const [showParams, setShowParams]           = useState(false)

  // Mode « depuis une plaque » : coût matière au prorata de la surface utilisée — même logique HT + port + TVA 20%
  const [plaqueMode, setPlaqueMode] = useState(() => localStorage.getItem('laser-plaque-mode') === '1')
  const [prixPlaqueHT, setPrixPlaqueHT] = useState(() => localStorage.getItem('laser-plaque-prix-ht') ?? '')
  const [portPlaqueHT, setPortPlaqueHT] = useState(() => localStorage.getItem('laser-plaque-port-ht') ?? '')
  const [plaqueL, setPlaqueL]       = useState(() => localStorage.getItem('laser-plaque-L') ?? '')
  const [plaquel, setPlaquel]       = useState(() => localStorage.getItem('laser-plaque-l') ?? '')
  const [pieceL, setPieceL]         = useState('')
  const [piecel, setPiecel]         = useState('')
  const [nbPieces, setNbPieces]     = useState('1')
  const [margeCoupe, setMargeCoupe] = useState(() => localStorage.getItem('laser-plaque-marge') ?? '5')
  const togglePlaque = () => setPlaqueMode(v => { const n = !v; localStorage.setItem('laser-plaque-mode', n ? '1' : '0'); return n })
  const persist = (key: string, set: (v: string) => void) => (v: string) => { set(v); localStorage.setItem(key, v) }

  // Découpe sous-traitée (alu/métal) : Marie fournit la plaque, le sous-traitant ne facture que la découpe
  // (tarif variable à la pièce, communiqué au cas par cas — saisie manuelle). Coefficient dédié, distinct de COEFF_MATIERE.
  const [decoupeST, setDecoupeST]           = useState(() => localStorage.getItem('laser-decoupe-st') === '1')
  const [coutDecoupe, setCoutDecoupe]       = useState('')   // tarif du sous-traitant PAR PLAQUE — × nbPieces (champ partagé)
  const [coeffDecoupe, setCoeffDecoupe]         = useState(() => parseFloat(localStorage.getItem('laser-coeff-decoupe') ?? '1.5'))
  const [coeffDecoupeInput, setCoeffDecoupeInput] = useState(() => localStorage.getItem('laser-coeff-decoupe') ?? '1.5')
  const toggleDecoupeST = (v: boolean) => { setDecoupeST(v); localStorage.setItem('laser-decoupe-st', v ? '1' : '0') }
  const handleCoeffDecoupeChange = (v: string) => {
    setCoeffDecoupeInput(v)
    const n = parseFloat(v)
    if (!isNaN(n) && n > 0) { setCoeffDecoupe(n); localStorage.setItem('laser-coeff-decoupe', v) }
  }

  // ── PAO ───────────────────────────────────────────────────────────────────
  // Nouveau défaut aligné sur le coefficient matière laser (2.306) — si l'ancien défaut 2.13 était encore
  // en cache localStorage (jamais modifié manuellement), on bascule sur le nouveau défaut.
  const coeffPaoStocke = localStorage.getItem('pao-coeff')
  const coeffPaoDefaut = (coeffPaoStocke === null || coeffPaoStocke === '2.13') ? '2.306' : coeffPaoStocke
  const [coeffMat, setCoeffMat]     = useState(() => parseFloat(coeffPaoDefaut))
  const [coeffInput, setCoeffInput] = useState(() => coeffPaoDefaut)
  const [tauxNetPao, setTauxNetPao] = useState(() => localStorage.getItem('pao-taux-net') ?? '85')
  const [achatPao, setAchatPao]     = useState('')
  const [qtePao, setQtePao]         = useState('1')
  const [heuresPao, setHeuresPao]   = useState('')

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTauxChange = (v: string) => {
    setTauxInput(v)
    const n = parseFloat(v)
    if (!isNaN(n) && n > 0) { setTauxHoraire(n); localStorage.setItem('laser-taux-horaire', v) }
  }
  const handleCoeffChange = (v: string) => {
    setCoeffInput(v)
    const n = parseFloat(v)
    if (!isNaN(n) && n > 0) { setCoeffMat(n); localStorage.setItem('pao-coeff', v) }
  }
  const handleTauxNetChange = (v: string) => {
    setTauxNetPao(v)
    const n = parseFloat(v)
    if (!isNaN(n) && n > 0) localStorage.setItem('pao-taux-net', v)
  }

  // ── Calculs laser ─────────────────────────────────────────────────────────
  // Achat HT + port HT + adhésif HT → TTC avec TVA 20% (non récupérable, franchise en base de TVA)
  const adhesifHT = adhesif === '467' ? ADHESIF_467MP : adhesif === '468' ? ADHESIF_468MP : 0
  const achatDirectTTC = ((parseFloat(achatMatHT) || 0) + (parseFloat(achatPortHT) || 0) + adhesifHT) * 1.20
  const prixPlaqueTTC  = ((parseFloat(prixPlaqueHT) || 0) + (parseFloat(portPlaqueHT) || 0) + adhesifHT) * 1.20
  // Coût matière au prorata si mode plaque : prix plaque × (surface pièces / surface plaque)
  // Marge de coupe : +marge mm sur chaque bord → +2×marge sur chaque dimension
  const marge      = parseFloat(margeCoupe) || 0
  const pL         = parseFloat(pieceL) || 0
  const pl         = parseFloat(piecel) || 0
  const surfPlaque = (parseFloat(plaqueL) || 0) * (parseFloat(plaquel) || 0)
  const surfPiece  = (pL > 0 && pl > 0) ? (pL + 2 * marge) * (pl + 2 * marge) : 0
  const nbP        = parseFloat(nbPieces) || 0
  const partPlaque = surfPlaque > 0 ? (surfPiece * nbP) / surfPlaque : 0
  const coutPlaque = prixPlaqueTTC * partPlaque
  const coutBase   = plaqueMode ? coutPlaque : achatDirectTTC
  const coutDecoupeUnit = parseFloat(coutDecoupe) || 0
  const coutDecoupeVal = decoupeST ? (coutDecoupeUnit * nbP) : 0   // tarif par plaque × nombre de pièces (champ partagé)
  const achat      = coutBase + coutDecoupeVal
  const pvHT       = coutBase * COEFF_MATIERE + coutDecoupeVal * coeffDecoupe   // matière × 2.306, découpe sous-traitée × coeff dédié
  const chargesMat = pvHT * TAUX_BIEN
  const netMat     = pvHT - achat - chargesMat   // net = marge (PV − achat) − charges

  const minGravUnit  = parseFloat(minutesGravure) || 0
  const minGrav       = minGravUnit * nbP   // durée gravure totale = par plaque × nombre de pièces (champ partagé)
  const minPrep    = parseFloat(minutesPrepa)   || 0   // prépa fichier : globale, pas multipliée
  const dureeH     = (minGrav + minPrep) / 60
  const pvService  = dureeH * (COUT_MACHINE_H + tauxHoraire)
  const chargesSvc = pvService * TAUX_SERVICE
  const netSvc     = pvService * (1 - TAUX_SERVICE)

  const totalDevis = pvHT + pvService
  const netTotal   = netMat + netSvc
  const margeRate  = totalDevis > 0 ? (netTotal / totalDevis) * 100 : 0
  const hasMatiere = achat > 0
  const hasService = minGrav + minPrep > 0

  // ── Calculs PAO ───────────────────────────────────────────────────────────
  const qte         = parseFloat(qtePao) || 1
  const coutMatTTC  = (parseFloat(achatPao) || 0) * qte
  const pvMatPao    = coutMatTTC * coeffMat
  const chargesMatPao = pvMatPao * TAUX_BIEN
  const netMatPao   = pvMatPao - coutMatTTC - chargesMatPao   // net = marge (PV − achat) − charges

  const tauxNet     = parseFloat(tauxNetPao) || 0
  const tauxFacture = tauxNet > 0 ? tauxNet / (1 - TAUX_SERVICE) : 0
  const heures      = parseFloat(heuresPao) || 0
  const pvCrea      = tauxFacture * heures
  const chargesCrea = pvCrea * TAUX_SERVICE
  const netCrea     = tauxNet * heures

  const totalPao       = pvMatPao + pvCrea
  const netTotalPao    = netMatPao + netCrea
  const margeRatePao   = totalPao > 0 ? (netTotalPao / totalPao) * 100 : 0
  const hasMatierePao  = coutMatTTC > 0
  const hasCrea        = heures > 0

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 max-w-3xl">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
            {tab === 'laser'
              ? <Zap size={16} className="text-purple-500" strokeWidth={1.75} />
              : <Printer size={16} className="text-purple-500" strokeWidth={1.75} />
            }
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-main">Calculateur devis</h1>
            <p className="text-xs text-text-muted">
              {tab === 'laser'
                ? `xTool P2S 55W — coût machine ${fmt(COUT_MACHINE_H)}/h`
                : 'PAO / impression — revente matière + création graphique'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'laser' && (
            <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-text-muted">Nombre de pièces</span>
              <input
                type="number" min="1" step="1" value={nbPieces}
                onChange={e => setNbPieces(e.target.value)}
                className="w-12 text-sm font-medium text-text-main text-right focus:outline-none"
              />
            </div>
          )}
          {tab === 'laser' && (
            <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-text-muted">Taux horaire</span>
              <input
                type="number" min="1" step="1" value={tauxInput}
                onChange={e => handleTauxChange(e.target.value)}
                className="w-14 text-sm font-medium text-text-main text-right focus:outline-none"
              />
              <span className="text-xs text-text-muted">€/h</span>
            </div>
          )}

          {/* Bouton mode privé */}
          <button
            onClick={() => setPrive(v => !v)}
            title={prive ? 'Afficher toutes les données' : 'Masquer les données financières'}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors',
              prive
                ? 'bg-peach-50 border-peach-200 text-peach-700'
                : 'bg-white border-border text-text-muted hover:text-text-main'
            )}
          >
            {prive ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{prive ? 'Mode privé' : 'Mode privé'}</span>
          </button>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border self-start">
        {([
          { id: 'laser', icon: <Zap size={12} />, label: 'Laser' },
          { id: 'pao',   icon: <Printer size={12} />, label: 'PAO / Print' },
        ] as { id: TabId; icon: React.ReactNode; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              tab === t.id ? 'bg-white text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════ LASER ══════════════════════════ */}
      {tab === 'laser' && (
        <>
          <button
            onClick={() => setShowParams(v => !v)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors self-start"
          >
            {showParams ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            Détail coût machine / heure
          </button>

          {showParams && (
            <div className="bg-surface rounded-lg border border-border px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs -mt-3">
              <ResultRow label="Amortissement machine" value={`${AMORTISSEMENT.toFixed(4)} €/h`} muted />
              <ResultRow label="Électricité (920W × 65%)" value={`${ELECTRICITE.toFixed(4)} €/h`} muted />
              <ResultRow label="Filtres AP2 (5 filtres)" value={`${FILTRES_AP2.toFixed(4)} €/h`} muted />
              <ResultRow label="Optiques P2S (lentille + miroirs + buses)" value={`${OPTIQUES_P2S.toFixed(4)} €/h`} muted />
              <div className="col-span-2 pt-1 flex justify-between items-center border-t border-border mt-1">
                <span className="font-medium text-text-main">Total machine</span>
                <span className="font-semibold text-text-main">{fmt(COUT_MACHINE_H)} / heure</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matière */}
            <div className="bg-white rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-medium text-text-main">Ligne matière</span>
                </div>
                <div className="flex items-center rounded-md border border-border overflow-hidden text-2xs">
                  <button
                    onClick={() => plaqueMode && togglePlaque()}
                    className={clsx('px-2 py-1 transition-colors', !plaqueMode ? 'bg-lavender-100 text-lavender-700 font-medium' : 'text-text-muted hover:text-text-main')}
                  >Achat direct</button>
                  <button
                    onClick={() => !plaqueMode && togglePlaque()}
                    className={clsx('px-2 py-1 transition-colors', plaqueMode ? 'bg-lavender-100 text-lavender-700 font-medium' : 'text-text-muted hover:text-text-main')}
                  >Depuis une plaque</button>
                </div>
              </div>

              {plaqueMode ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Plaque HT" value={prixPlaqueHT} onChange={persist('laser-plaque-prix-ht', setPrixPlaqueHT)} />
                    <InputField label="Port HT" value={portPlaqueHT} onChange={persist('laser-plaque-port-ht', setPortPlaqueHT)} />
                  </div>
                  {prixPlaqueTTC > 0 && (
                    <p className="text-2xs text-text-muted -mt-1.5">→ TTC (TVA 20%) : {fmt(prixPlaqueTTC)}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Plaque — longueur" value={plaqueL} onChange={persist('laser-plaque-L', setPlaqueL)} unit="mm" />
                    <InputField label="Plaque — largeur" value={plaquel} onChange={persist('laser-plaque-l', setPlaquel)} unit="mm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Pièce — longueur" value={pieceL} onChange={setPieceL} unit="mm" />
                    <InputField label="Pièce — largeur" value={piecel} onChange={setPiecel} unit="mm" />
                  </div>
                  <InputField label="Marge de coupe (par bord)" value={margeCoupe} onChange={persist('laser-plaque-marge', setMargeCoupe)} unit="mm" />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="Matière HT" value={achatMatHT} onChange={setAchatMatHT} />
                    <InputField label="Port HT" value={achatPortHT} onChange={setAchatPortHT} />
                  </div>
                  {achatDirectTTC > 0 && (
                    <p className="text-2xs text-text-muted -mt-1.5">→ TTC (TVA 20%) : {fmt(achatDirectTTC)}</p>
                  )}
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted">Adhésif (plaque complète)</label>
                <select
                  value={adhesif}
                  onChange={e => setAdhesif(e.target.value as AdhesifType)}
                  className="w-full px-3 py-1.5 rounded border border-border text-sm text-text-main bg-white focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-100"
                >
                  <option value="aucun">Aucun</option>
                  <option value="467">3M 467MP — +{fmt(ADHESIF_467MP)} HT</option>
                  <option value="468">3M 468MP (renforcé) — +{fmt(ADHESIF_468MP)} HT</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-border">
                <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer">
                  <input
                    type="checkbox" checked={decoupeST}
                    onChange={e => toggleDecoupeST(e.target.checked)}
                    className="rounded border-border text-lavender-600 focus:ring-lavender-200"
                  />
                  Découpe sous-traitée (alu/métal)
                </label>
                {decoupeST && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-2xs text-text-muted">coeff.</span>
                    <input
                      type="number" min="0.1" step="0.01" value={coeffDecoupeInput}
                      onChange={e => handleCoeffDecoupeChange(e.target.value)}
                      className="w-12 text-xs font-medium text-text-main text-right focus:outline-none border-b border-border"
                    />
                  </div>
                )}
              </div>
              {decoupeST && (
                <InputField label="Découpe TTC (par plaque)" value={coutDecoupe} onChange={setCoutDecoupe} placeholder="tarif communiqué par le sous-traitant" />
              )}

              {hasMatiere ? (
                <div className="mt-1 bg-surface rounded-md px-3 py-1">
                  {plaqueMode && (
                    <ResultRow label={`Surface utilisée (${(partPlaque * 100).toFixed(1)} % de la plaque${marge > 0 ? `, +${marge} mm/bord` : ''})`} value={`${(surfPiece * nbP).toFixed(0)} / ${surfPlaque.toFixed(0)} mm²`} muted hide={prive} />
                  )}
                  {adhesif !== 'aucun' && (
                    <ResultRow label={`Adhésif 3M ${adhesif}MP (plaque complète)`} value={fmt(adhesifHT)} muted hide={prive} />
                  )}
                  {decoupeST && (
                    <>
                      <ResultRow label={prive ? (plaqueMode ? 'Coût plaque' : 'Coût matière') : `${plaqueMode ? 'Coût plaque' : 'Coût matière'} (× ${COEFF_MATIERE})`} value={fmt(coutBase)} muted hide={prive} />
                      {coutDecoupeUnit > 0 && nbP > 1 && (
                        <ResultRow label="Découpe" value={`${fmt(coutDecoupeUnit)} × ${nbP} pièces`} muted hide={prive} />
                      )}
                      <ResultRow label={prive ? 'Coût découpe sous-traitée' : `Coût découpe sous-traitée (× ${coeffDecoupe})`} value={fmt(coutDecoupeVal)} muted hide={prive} />
                    </>
                  )}
                  <ResultRow label={prive ? 'Prix vente HT' : (decoupeST ? 'Prix vente HT (matière + découpe)' : `Prix vente HT (× ${COEFF_MATIERE})`)} value={fmt(pvHT)} />
                  <ResultRow label="Coût matière TTC" value={`− ${fmt(achat)}`} muted hide={prive} />
                  <ResultRow label="Charges URSSAF (13,3%)" value={`− ${fmt(chargesMat)}`} muted hide={prive} />
                  <ResultRow label="Net matière" value={fmt(netMat)} accent hide={prive} />
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Saisir un achat TTC pour calculer</p>
              )}
            </div>

            {/* Service */}
            <div className="bg-white rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm font-medium text-text-main">Ligne service (gravure)</span>
              </div>
              <InputField label="Durée gravure (par plaque)" value={minutesGravure} onChange={setMinutesGravure} unit="min" />
              <InputField label="Durée préparation / fichier (globale)" value={minutesPrepa} onChange={setMinutesPrepa} unit="min" />
              {hasService ? (
                <div className="mt-1 bg-surface rounded-md px-3 py-1">
                  {minGravUnit > 0 && nbP > 1 && (
                    <ResultRow label="Gravure" value={`${minGravUnit} min × ${nbP} pièces = ${minGrav} min`} muted hide={prive} />
                  )}
                  <ResultRow label="Durée totale" value={`${minGrav + minPrep} min (${dureeH.toFixed(2)} h)`} muted />
                  <ResultRow label="PV service HT (machine + MO)" value={fmt(pvService)} />
                  <ResultRow label="Charges BNC (27,8%)" value={`− ${fmt(chargesSvc)}`} muted hide={prive} />
                  <ResultRow label="Net service" value={fmt(netSvc)} accent hide={prive} />
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Saisir les temps pour calculer</p>
              )}
            </div>
          </div>

          {(hasMatiere || hasService) && (
            <div className="bg-white rounded-lg border border-lavender-200 px-5 py-4">
              <div className={clsx('grid gap-4', prive ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3')}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-muted uppercase tracking-wide">Total devis HT</span>
                  <span className="text-xl font-semibold text-text-main tabular-nums">{fmt(totalDevis)}</span>
                  {!prive && hasMatiere && hasService && (
                    <span className="text-2xs text-text-muted">{fmt(pvHT)} matière + {fmt(pvService)} service</span>
                  )}
                  {nbP > 1 && (
                    <span className="text-2xs text-lavender-600 font-medium">soit {fmt(totalDevis / nbP)} / pièce ({nbP} pièces)</span>
                  )}
                </div>
                {!prive && (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-text-muted uppercase tracking-wide">Net encaissé</span>
                      <span className="text-xl font-semibold text-mint-600 tabular-nums">{fmt(netTotal)}</span>
                      {hasMatiere && hasService && (
                        <span className="text-2xs text-text-muted">{fmt(netMat)} + {fmt(netSvc)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-text-muted uppercase tracking-wide">Taux net</span>
                      <span className="text-xl font-semibold text-text-main tabular-nums">{margeRate.toFixed(1)} %</span>
                      <span className="text-2xs text-text-muted">du CA facturé</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════ PAO ══════════════════════════ */}
      {tab === 'pao' && (
        <>
          {/* Paramètres PAO */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-text-muted">Coeff. matière</span>
              <input
                type="number" min="1" step="0.01" value={coeffInput}
                onChange={e => handleCoeffChange(e.target.value)}
                className="w-14 text-sm font-medium text-text-main text-right focus:outline-none"
              />
              <span className="text-xs text-text-muted">× achat</span>
            </div>
            <div className={clsx(
              'flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2',
              prive && 'opacity-0 pointer-events-none select-none'
            )}>
              <span className="text-xs text-text-muted">Taux net créa</span>
              <input
                type="number" min="1" step="1" value={tauxNetPao}
                onChange={e => handleTauxNetChange(e.target.value)}
                className="w-14 text-sm font-medium text-text-main text-right focus:outline-none"
              />
              <span className="text-xs text-text-muted">€/h net</span>
            </div>
            {!prive && tauxFacture > 0 && (
              <span className="text-xs text-text-muted">
                → facturé <span className="font-medium text-text-main">{fmt(tauxFacture)}/h</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matière / fourniture */}
            <div className="bg-white rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-text-main">Matière / fourniture</span>
              </div>
              <InputField label="Achat TTC (par unité)" value={achatPao} onChange={setAchatPao} />
              <InputField label="Quantité" value={qtePao} onChange={setQtePao} unit="×" placeholder="1" />
              {hasMatierePao ? (
                <div className="mt-1 bg-surface rounded-md px-3 py-1">
                  <ResultRow label={prive ? 'Prix vente HT' : `Prix vente HT (× ${coeffMat.toFixed(3)})`} value={fmt(pvMatPao)} />
                  <ResultRow label={qte > 1 ? `Coût matière TTC (× ${qte})` : 'Coût matière TTC'} value={`− ${fmt(coutMatTTC)}`} muted hide={prive} />
                  <ResultRow label="Charges URSSAF (13,3%)" value={`− ${fmt(chargesMatPao)}`} muted hide={prive} />
                  <ResultRow label="Net matière" value={fmt(netMatPao)} accent hide={prive} />
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Saisir un achat TTC pour calculer</p>
              )}
            </div>

            {/* Création graphique */}
            <div className="bg-white rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-sm font-medium text-text-main">Création graphique</span>
              </div>
              <InputField label="Heures de travail" value={heuresPao} onChange={setHeuresPao} unit="h" />
              {hasCrea ? (
                <div className="mt-1 bg-surface rounded-md px-3 py-1">
                  <ResultRow label="Taux facturé (÷ 72,2%)" value={`${fmt(tauxFacture)}/h`} muted hide={prive} />
                  <ResultRow label="Total créa HT" value={fmt(pvCrea)} />
                  <ResultRow label="Charges BNC (27,8%)" value={`− ${fmt(chargesCrea)}`} muted hide={prive} />
                  <ResultRow label={`Net créa (${tauxNet} €/h × ${heures} h)`} value={fmt(netCrea)} accent hide={prive} />
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">Saisir les heures pour calculer</p>
              )}
            </div>
          </div>

          {(hasMatierePao || hasCrea) && (
            <div className="bg-white rounded-lg border border-lavender-200 px-5 py-4">
              <div className={clsx('grid gap-4', prive ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3')}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-muted uppercase tracking-wide">Total devis HT</span>
                  <span className="text-xl font-semibold text-text-main tabular-nums">{fmt(totalPao)}</span>
                  {!prive && hasMatierePao && hasCrea && (
                    <span className="text-2xs text-text-muted">{fmt(pvMatPao)} matière + {fmt(pvCrea)} créa</span>
                  )}
                </div>
                {!prive && (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-text-muted uppercase tracking-wide">Net encaissé</span>
                      <span className="text-xl font-semibold text-mint-600 tabular-nums">{fmt(netTotalPao)}</span>
                      {hasMatierePao && hasCrea && (
                        <span className="text-2xs text-text-muted">{fmt(netMatPao)} + {fmt(netCrea)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-text-muted uppercase tracking-wide">Taux net</span>
                      <span className="text-xl font-semibold text-text-main tabular-nums">{margeRatePao.toFixed(1)} %</span>
                      <span className="text-2xs text-text-muted">du CA facturé</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
