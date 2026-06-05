import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Affaires } from '@/pages/Affaires'
import { Clients } from '@/pages/Clients'
import { Fournisseurs } from '@/pages/Fournisseurs'
import { ExportURSSAF } from '@/pages/ExportURSSAF'
import { useAffaires } from '@/store/useStore'

function StatistiquesPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-medium text-text-main mb-2">Statistiques</h1>
      <p className="text-sm text-text-muted">À venir — graphiques annuels, évolution CA, top clients…</p>
    </div>
  )
}

function ExportPage() {
  const { affaires } = useAffaires()
  return <ExportURSSAF affaires={affaires} />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-white font-sans text-text-main">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Affaires />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/fournisseurs" element={<Fournisseurs />} />
            <Route path="/statistiques" element={<StatistiquesPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
