import { useState, useCallback, useRef, useMemo } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import type { Affaire, StatutProd, TypeAffaire } from '@/types'
import { calculerAffaire, formaterEuros, calculerDateEcheance } from '@/utils/calculs'
import { Autocomplete } from '@/components/ui/Autocomplete'
import clsx from 'clsx'

interface Props {
  affaire?: Affaire
  clients: { societe: string; interlocuteurs: string[]; delaiPaiementJours: number }[]
  fournisseurs: { nom: string }[]
  affairesExistantes: { id: string; refDevis: string; designation: string }[]
  onSave: (data: Partial<Affaire>) => Promise<void>
  onClose: () => void
}

type FormData = {
  refDevis: string
  refFacture: string
  dateDevis: string
  dateFacture: string
  societe: string
  interlocuteur: string
  designation: string
  notes: string
  type: TypeAffaire
  prixVenteHT: string
  montantBienHT: string
  montantServiceHT: string
  coutAchatTTC: string
  fournisseur: string
  notesFournisseur: string
  delaiPaiementJours: string
  dateEcheance: string
  fournisseurPaye: boolean
  datePaiementFournisseur: string
  clientPaye: boolean
  datePaiementClient: string
  affaireParentId: string
  statutProd: StatutProd
  refCommandeClient: string
}

function toFormData(a?: Affaire): FormData {
  return {
    refDevis: a?.refDevis ?? '',
    refFacture: a?.refFacture ?? '',
    dateDevis: a?.dateDevis ?? new Date().toISOString().split('T')[0],
    dateFacture: a?.dateFacture ?? '',
    societe: a?.societe ?? '',
    interlocuteur: a?.interlocuteur ?? '',
    designation: a?.designation ?? '',
    notes: a?.notes ?? '',
    type: a?.type ?? 'BIEN',
    prixVenteHT: a?.prixVenteHT?.toString() ?? '',
    montantBienHT: a?.montantBienHT?.toString() ?? '',
    montantServiceHT: a?.montantServiceHT?.toString() ?? '',
    coutAchatTTC: a?.coutAchatTTC?.toString() ?? '',
    fournisseur: a?.fournisseur ?? '',
    notesFournisseur: a?.notesFournisseur ?? '',
    delaiPaiementJours: a?.delaiPaiementJours?.toString() ?? '',
    dateEcheance: a?.dateEcheance ?? '',
    fournisseurPaye: a?.fournisseurPaye ?? false,
    datePaiementFournisseur: a?.datePaiementFournisseur ?? '',
    clientPaye: a?.clientPaye ?? false,
    datePaiementClient: a?.datePaiementClient ?? '',
    affaireParentId: a?.affaireParentId ?? '',
    statutProd: a?.statutProd ?? 'COMMANDE_RECUE',
    refCommandeClient: a?.refCommandeClient ?? '',
  }
}

function fromFormData(f: FormData): Partial<Affaire> {
  return {
    refDevis: f.refDevis,
    refFacture: f.refFacture || undefined,
    dateDevis: f.dateDevis || undefined,
    dateFacture: f.dateFacture || undefined,
    societe: f.societe,
    interlocuteur: f.interlocuteur || undefined,
    designation: f.designation,
    notes: f.notes || undefined,
    type: f.type,
    prixVenteHT: f.prixVenteHT ? parseFloat(f.prixVenteHT) : undefined,
    montantBienHT: f.montantBienHT ? parseFloat(f.montantBienHT) : undefined,
    montantServiceHT: f.montantServiceHT ? parseFloat(f.montantServiceHT) : undefined,
    coutAchatTTC: f.coutAchatTTC ? parseFloat(f.coutAchatTTC) : undefined,
    fournisseur: f.fournisseur || undefined,
    notesFournisseur: f.notesFournisseur || undefined,
    delaiPaiementJours: f.delaiPaiementJours ? parseInt(f.delaiPaiementJours) : undefined,
    dateEcheance: f.dateEcheance || undefined,
    fournisseurPaye: f.fournisseurPaye,
    datePaiementFournisseur: f.datePaiementFournisseur || undefined,
    clientPaye: f.clientPaye,
    datePaiementClient: f.datePaiementClient || undefined,
    affaireParentId: f.affaireParentId || undefined,
    statutProd: f.statutProd,
    refCommandeClient: f.refCommandeClient || undefined,
  }
}

async function parsePDF(file: File): Promise<Partial<FormData>> {
  const pdfjsLib = await import('pdfjs-dist')
  // Worker via unpkg — fonctionne sans configuration Vite supplémentaire
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n'
  }

  const extracted: Partial<FormData> = {}

  // Format Indy — "Devis 202606-16" ou "Facture 202606-3"
  const devisMatch = fullText.match(/\bDevis\s+(\d{6}-\d+)/)
  if (devisMatch) extracted.refDevis = `D ${devisMatch[1]}`

  const factureMatch = fullText.match(/\bFacture\s+(\d{6}-\d+)/)
  if (factureMatch) extracted.refFacture = `F ${factureMatch[1]}`

  // Date émission — "Émis le 04/06/2026"
  const dateMatch = fullText.match(/[EÉ]mis le\s+(\d{2})\/(\d{2})\/(\d{4})/)
  if (dateMatch) extracted.dateDevis = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`

  // Client — apparaît après le N° TVA GLAAZ (FR48100130590) dans le flux Indy
  const clientMatch = fullText.match(/FR48100130590\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\s\.&,'\-]+?)(?=\s+(?:TSA|BP|ZI|Rue|Avenue|Route|\d{5})|SIRET)/)
  if (clientMatch) extracted.societe = clientMatch[1].trim()

  // Interlocuteur — apparaît juste après le numéro de devis/facture, avant "Émis le"
  const interloMatch = fullText.match(/(?:Devis|Facture)\s+\d{6}-\d+\s+([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][A-Za-zÀ-ÿ\-]+)+)(?=\s+[EÉ]mis)/)
  if (interloMatch) extracted.interlocuteur = interloMatch[1].trim()

  // Désignation — titre projet en majuscules entre "Valide jusqu'au" et "Libellé"
  const designMatch = fullText.match(/Valide jusqu.au\s+[\d\/]+\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-\/0-9]{2,60}?)\s+(?:Libellé|Tableau|Format|Impression|Panneau)/)
  if (designMatch) {
    extracted.designation = designMatch[1].trim()
  } else {
    // Fallback : première ligne du tableau (libellé de prestation)
    const libelleMatch = fullText.match(/Libellé\s+Quantité[^\n]+\s+([^\n]+?)(?=\s+\d+\s+[\d,]+\s*€)/)
    if (libelleMatch) extracted.designation = libelleMatch[1].trim()
  }

  // Prix HT total — "Total HT 488,00 €"
  const prixMatch = fullText.match(/Total HT\s+([\d\s]+[,\.]\d{2})\s*€/)
  if (prixMatch) {
    const val = parseFloat(prixMatch[1].replace(/\s/g, '').replace(',', '.'))
    if (!isNaN(val)) extracted.prixVenteHT = val.toString()
  }

  // Délai de paiement — "45 jours"
  const delaiMatch = fullText.match(/(\d+)\s*jours/)
  if (delaiMatch) extracted.delaiPaiementJours = delaiMatch[1]

  // Type auto — "vente de bien" → BIEN, "prestation" → SERVICE
  if (/vente de bien/i.test(fullText)) extracted.type = 'BIEN'
  else if (/prestation de service/i.test(fullText)) extracted.type = 'SERVICE'

  return extracted
}

const inputCls = 'w-full px-3 py-1.5 text-sm rounded border border-border bg-white focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-lavender-500 placeholder:text-text-muted'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border pb-1.5">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function AffaireForm({ affaire, clients, fournisseurs, affairesExistantes, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(() => toFormData(affaire))
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = useCallback((key: keyof FormData, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if ((key === 'dateFacture' || key === 'delaiPaiementJours') && next.dateFacture && next.delaiPaiementJours) {
        next.dateEcheance = calculerDateEcheance(next.dateFacture, parseInt(next.delaiPaiementJours))
      }
      if (key === 'clientPaye' && value === true && !next.datePaiementClient) {
        next.datePaiementClient = new Date().toISOString().split('T')[0]
        next.statutProd = 'PAYE'
      }
      return next
    })
  }, [])

  const interloSuggestions = useMemo(() => {
    const client = clients.find(c => c.societe === form.societe)
    return client?.interlocuteurs ?? []
  }, [clients, form.societe])

  const calc = useMemo(() => calculerAffaire(fromFormData(form) as Affaire), [form])

  const handlePDF = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) return
    setParsing(true)
    try {
      const extracted = await parsePDF(file)
      setForm(prev => ({ ...prev, ...extracted }))
      if (extracted.societe) {
        const client = clients.find(c => c.societe.toLowerCase().includes(extracted.societe!.toLowerCase()))
        if (client?.delaiPaiementJours) {
          setForm(prev => ({ ...prev, delaiPaiementJours: client.delaiPaiementJours.toString() }))
        }
      }
    } catch (err) {
      console.error('Erreur parsing PDF', err)
    } finally {
      setParsing(false)
    }
  }, [clients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(fromFormData(form))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-modal flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-text-main">
            {affaire ? "Modifier l'affaire" : 'Nouvelle affaire'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Zone PDF */}
          {!affaire && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handlePDF(f) }}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-colors',
                dragOver ? 'border-lavender-400 bg-lavender-50' : 'border-border hover:border-lavender-300 hover:bg-surface'
              )}
            >
              {parsing ? (
                <span className="flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Extraction en cours…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Upload size={16} /> Glisse un PDF de devis/facture pour pré-remplir
                </span>
              )}
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handlePDF(f) }} />
            </div>
          )}

          {/* Identification */}
          <Section title="Identification">
            <div className="grid grid-cols-2 gap-3">
              <Field label="N° Devis *">
                <input required className={inputCls} value={form.refDevis}
                  onChange={e => set('refDevis', e.target.value)} placeholder="D 202604-1" />
              </Field>
              <Field label="N° Facture">
                <input className={inputCls} value={form.refFacture}
                  onChange={e => set('refFacture', e.target.value)} placeholder="F 202606-3" />
              </Field>
              <Field label="Date devis">
                <input type="date" className={inputCls} value={form.dateDevis}
                  onChange={e => set('dateDevis', e.target.value)} />
              </Field>
              <Field label="Date facture">
                <input type="date" className={inputCls} value={form.dateFacture}
                  onChange={e => set('dateFacture', e.target.value)} />
              </Field>
            </div>
            <Field label="Statut">
              <select className={inputCls} value={form.statutProd}
                onChange={e => set('statutProd', e.target.value as StatutProd)}>
                <option value="COMMANDE_RECUE">Commande reçue</option>
                <option value="CREATION_A_FAIRE">Création à faire</option>
                <option value="ATTENTE_BAT">En attente retour BAT</option>
                <option value="EN_IMPRESSION">En impression</option>
                <option value="EN_LIVRAISON">En livraison</option>
                <option value="ATTENTE_FACTURATION">En attente de facturation</option>
                <option value="PROD_FACTURE">Facturé</option>
                <option value="PAYE">Payé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </Field>
          </Section>

          {/* Client */}
          <Section title="Client">
            <Field label="Société *">
              <Autocomplete value={form.societe} onChange={v => {
                set('societe', v)
                const client = clients.find(c => c.societe === v)
                if (client?.delaiPaiementJours) set('delaiPaiementJours', client.delaiPaiementJours.toString())
              }} suggestions={clients.map(c => c.societe)} placeholder="PPG France Manufacturing" />
            </Field>
            <Field label="Interlocuteur">
              <Autocomplete value={form.interlocuteur} onChange={v => set('interlocuteur', v)}
                suggestions={interloSuggestions} placeholder="Nom du contact" />
            </Field>
          </Section>

          {/* Projet */}
          <Section title="Projet">
            <Field label="Désignation *">
              <input required className={inputCls} value={form.designation}
                onChange={e => set('designation', e.target.value)}
                placeholder="26 Panneaux Dibond 990x700mm" />
            </Field>
            <Field label="Réf. commande client">
              <input className={inputCls} value={form.refCommandeClient}
                onChange={e => set('refCommandeClient', e.target.value)}
                placeholder="EPO-00878300" />
            </Field>
            <Field label="Notes">
              <textarea className={clsx(inputCls, 'resize-none')} rows={2} value={form.notes}
                onChange={e => set('notes', e.target.value)} placeholder="Remarques diverses…" />
            </Field>
            <Field label="Lié à l'affaire (acompte)">
              <select className={inputCls} value={form.affaireParentId}
                onChange={e => set('affaireParentId', e.target.value)}>
                <option value="">— aucun lien —</option>
                {affairesExistantes
                  .filter(a => !affaire || a.id !== affaire.id)
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.refDevis} — {a.designation.slice(0, 40)}
                    </option>
                  ))}
              </select>
            </Field>
          </Section>

          {/* Montants */}
          <Section title="Montants">
            <Field label="Type d'opération">
              <div className="flex gap-2">
                {([
                  { type: 'BIEN', label: 'Bien', sub: 'achat-revente · 13,3%' },
                  { type: 'SERVICE', label: 'Service', sub: 'prestation · 27,8%' },
                  { type: 'MIXTE', label: 'Mixte', sub: 'bien + service' },
                ] as { type: TypeAffaire; label: string; sub: string }[]).map(({ type: t, label, sub }) => (
                  <button key={t} type="button" onClick={() => set('type', t)}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded text-left border transition-colors',
                      form.type === t
                        ? 'bg-lavender-50 border-lavender-300'
                        : 'bg-white border-border hover:border-lavender-200'
                    )}>
                    <div className={clsx('text-xs font-medium', form.type === t ? 'text-lavender-600' : 'text-text-main')}>{label}</div>
                    <div className="text-2xs text-text-muted mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
            </Field>

            {form.type !== 'MIXTE' ? (
              <Field label="Prix de vente HT (€) *">
                <input required type="number" step="0.01" min="0" className={inputCls}
                  value={form.prixVenteHT} onChange={e => set('prixVenteHT', e.target.value)} placeholder="0,00" />
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Part Bien HT (€)">
                  <input type="number" step="0.01" min="0" className={inputCls}
                    value={form.montantBienHT} onChange={e => set('montantBienHT', e.target.value)} placeholder="0,00" />
                </Field>
                <Field label="Part Service HT (€)">
                  <input type="number" step="0.01" min="0" className={inputCls}
                    value={form.montantServiceHT} onChange={e => set('montantServiceHT', e.target.value)} placeholder="0,00" />
                </Field>
              </div>
            )}

            {(form.type === 'BIEN' || form.type === 'MIXTE') && (
              <Field label="Coût d'achat TTC (€)">
                <input type="number" step="0.01" min="0" className={inputCls}
                  value={form.coutAchatTTC} onChange={e => set('coutAchatTTC', e.target.value)} placeholder="0,00" />
              </Field>
            )}

            <div className="bg-surface rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">
                  Charges URSSAF+IR
                  {form.type === 'BIEN' && ' (13,3%)'}
                  {form.type === 'SERVICE' && ' (27,8%)'}
                </span>
                <span className="text-text-main">{formaterEuros(calc.chargesTotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Marge brute</span>
                <span className="text-text-main">{formaterEuros(calc.margeBrute)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-1.5">
                <span className="font-medium text-text-main">Net en poche</span>
                <span className="font-semibold text-mint-600">{formaterEuros(calc.netEnPoche)}</span>
              </div>
            </div>
          </Section>

          {/* Fournisseur */}
          <Section title="Fournisseur">
            <Field label="Société fournisseur">
              <Autocomplete value={form.fournisseur} onChange={v => set('fournisseur', v)}
                suggestions={fournisseurs.map(f => f.nom)} placeholder="Nom du fournisseur" />
            </Field>
            <Field label="Notes fournisseur">
              <input className={inputCls} value={form.notesFournisseur}
                onChange={e => set('notesFournisseur', e.target.value)}
                placeholder="Référence commande, lien produit…" />
            </Field>
          </Section>

          {/* Paiements */}
          <Section title="Paiements">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Délai paiement client (jours)">
                <input type="number" min="0" className={inputCls} value={form.delaiPaiementJours}
                  onChange={e => set('delaiPaiementJours', e.target.value)} placeholder="45" />
              </Field>
              <Field label="Échéance calculée">
                <input type="date" readOnly className={clsx(inputCls, 'bg-surface')} value={form.dateEcheance} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                  <input type="checkbox" checked={form.fournisseurPaye} className="rounded"
                    onChange={e => {
                      set('fournisseurPaye', e.target.checked)
                      if (e.target.checked && !form.datePaiementFournisseur)
                        set('datePaiementFournisseur', new Date().toISOString().split('T')[0])
                    }} />
                  Fournisseur payé
                </label>
                {form.fournisseurPaye && (
                  <input type="date" className={inputCls} value={form.datePaiementFournisseur}
                    onChange={e => set('datePaiementFournisseur', e.target.value)} />
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                  <input type="checkbox" checked={form.clientPaye} className="rounded"
                    onChange={e => {
                      set('clientPaye', e.target.checked)
                      if (e.target.checked) {
                        if (!form.datePaiementClient)
                          set('datePaiementClient', new Date().toISOString().split('T')[0])
                        set('statutProd', 'PAYE')
                      } else {
                        set('statutProd', form.refFacture ? 'PROD_FACTURE' : 'COMMANDE_RECUE')
                      }
                    }} />
                  Client payé
                </label>
                {form.clientPaye && (
                  <input type="date" className={inputCls} value={form.datePaiementClient}
                    onChange={e => set('datePaiementClient', e.target.value)} />
                )}
              </div>
            </div>
          </Section>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-white">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-main">
            Annuler
          </button>
          <button type="submit" onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white
              bg-gradient-to-r from-lavender-500 to-powder-500
              hover:from-lavender-600 hover:to-powder-600
              disabled:opacity-50 transition-all shadow-sm">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {affaire ? 'Enregistrer' : "Créer l'affaire"}
          </button>
        </div>
      </div>
    </div>
  )
}
