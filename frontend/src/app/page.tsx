import React from 'react';
import FileUpload from '../components/FileUpload';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Data Analytics <span className="text-purple-500">Sénior</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Documentation</button>
            <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">
              Admin Portal
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Dashboard General</h1>
            <p className="text-gray-400">Bienvenido, aquí tienes el resumen de gastos de <span className="text-white font-semibold italic">Empresa Demo</span>.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
              <span>Exportar Reporte</span>
            </button>
            <FileUpload />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Gasto Total (Mes)', value: '12.500,50€', trend: '+12%', color: 'border-purple-500/30' },
            { label: 'Facturas Procesadas', value: '45', trend: '+5', color: 'border-blue-500/30' },
            { label: 'Gasto Medio', value: '277,78€', trend: '-2%', color: 'border-green-500/30' },
            { label: 'Proveedores Activos', value: '18', trend: '+2', color: 'border-orange-500/30' },
          ].map((kpi, i) => (
            <div key={i} className={`bg-[#0A0A0A] border ${kpi.color} p-6 rounded-2xl`}>
              <p className="text-sm text-gray-500 font-medium mb-1">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{kpi.value}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Invoices Table (2/3) */}
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-lg">Facturas Recientes</h2>
              <button className="text-sm text-purple-500 hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Proveedor</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Importe</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {[
                    { vendor: 'Amazon Web Services', date: '02 Mar, 2026', amount: '450.00€', status: 'Procesado' },
                    { vendor: 'Google Workspace', date: '01 Mar, 2026', amount: '89.50€', status: 'Procesado' },
                    { vendor: 'Restaurante El Faro', date: '28 Feb, 2026', amount: '120.00€', status: 'Revisión' },
                    { vendor: 'Apple Ireland', date: '27 Feb, 2026', amount: '1.299,00€', status: 'Procesado' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="px-6 py-4 font-medium group-hover:text-purple-400 transition-colors">{row.vendor}</td>
                      <td className="px-6 py-4 text-gray-400">{row.date}</td>
                      <td className="px-6 py-4 font-bold">{row.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${row.status === 'Procesado' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity/Filters (1/3) */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-6">Filtros de Análisis</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-500 block mb-2 uppercase font-bold tracking-widest">Rango de Tiempo</label>
                <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                  <option>Últimos 30 días</option>
                  <option>Este Trimestre</option>
                  <option>Año 2026</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2 uppercase font-bold tracking-widest">Categoría de Gasto</label>
                <div className="space-y-2">
                  {['SaaS', 'Marketing', 'Dietas', 'Viajes'].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-all cursor-pointer">
                      <span>{cat}</span>
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-top border-white/5">
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <p className="text-xs font-bold text-purple-400 uppercase mb-2">Sugerencia AI</p>
                  <p className="text-sm text-gray-300 italic">"Has gastado un 15% más en suscripciones SaaS que el mes pasado. ¿Revisamos las licencias?"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-sm">
          <p>© 2026 Data Analytics Sénior. Privacidad Grantizada (Modelos Locales).</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
