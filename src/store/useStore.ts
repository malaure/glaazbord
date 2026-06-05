import { useState, useEffect, useCallback } from 'react'
import type { Affaire, Client, Fournisseur } from '@/types'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export function useAffaires() {
  const [affaires, setAffaires] = useState<Affaire[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const data = await api<Affaire[]>('/api/affaires')
    setAffaires(data)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const creer = async (data: Omit<Affaire, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api<Affaire>('/api/affaires', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setAffaires(prev => [created, ...prev])
    return created
  }

  const modifier = async (id: string, data: Partial<Affaire>) => {
    const current = affaires.find(a => a.id === id)!
    const updated = await api<Affaire>(`/api/affaires/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...current, ...data }),
    })
    setAffaires(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }

  const supprimer = async (id: string) => {
    await api(`/api/affaires/${id}`, { method: 'DELETE' })
    setAffaires(prev => prev.filter(a => a.id !== id))
  }

  return { affaires, loading, reload, creer, modifier, supprimer }
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])

  const reload = useCallback(async () => {
    const data = await api<Client[]>('/api/clients')
    setClients(data)
  }, [])

  useEffect(() => { reload() }, [reload])

  const creer = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    const created = await api<Client>('/api/clients', {
      method: 'POST', body: JSON.stringify(data),
    })
    setClients(prev => [...prev, created].sort((a, b) => a.societe.localeCompare(b.societe)))
    return created
  }

  const modifier = async (id: string, data: Partial<Client>) => {
    const current = clients.find(c => c.id === id)!
    const updated = await api<Client>(`/api/clients/${id}`, {
      method: 'PUT', body: JSON.stringify({ ...current, ...data }),
    })
    setClients(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  const supprimer = async (id: string) => {
    await api(`/api/clients/${id}`, { method: 'DELETE' })
    setClients(prev => prev.filter(c => c.id !== id))
  }

  return { clients, reload, creer, modifier, supprimer }
}

export function useFournisseurs() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])

  const reload = useCallback(async () => {
    const data = await api<Fournisseur[]>('/api/fournisseurs')
    setFournisseurs(data)
  }, [])

  useEffect(() => { reload() }, [reload])

  const creer = async (data: Omit<Fournisseur, 'id' | 'createdAt'>) => {
    const created = await api<Fournisseur>('/api/fournisseurs', {
      method: 'POST', body: JSON.stringify(data),
    })
    setFournisseurs(prev => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)))
    return created
  }

  const modifier = async (id: string, data: Partial<Fournisseur>) => {
    const current = fournisseurs.find(f => f.id === id)!
    const updated = await api<Fournisseur>(`/api/fournisseurs/${id}`, {
      method: 'PUT', body: JSON.stringify({ ...current, ...data }),
    })
    setFournisseurs(prev => prev.map(f => f.id === id ? updated : f))
    return updated
  }

  const supprimer = async (id: string) => {
    await api(`/api/fournisseurs/${id}`, { method: 'DELETE' })
    setFournisseurs(prev => prev.filter(f => f.id !== id))
  }

  return { fournisseurs, reload, creer, modifier, supprimer }
}
