'use client';
import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';
import FileUpload from '../../components/FileUpload';

const TENANT_ID = 'ac93a157-9394-4b01-9a5e-c77619d3b19c';

const COLORS = ['#9333EA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const EMPTY_TREND = [
    { month: 'Ene', total: 0 },
    { month: 'Feb', total: 0 },
    { month: 'Mar', total: 0 },
    { month: 'Abr', total: 0 },
    { month: 'May', total: 0 },
    { month: 'Jun', total: 0 },
];

// Custom tooltip style
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="font-bold" style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number' ? `${p.value.toLocaleString('es-ES')}€` : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:8000/analytics/summary', {
                headers: { 'X-Tenant-ID': TENANT_ID }
            });
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Error fetching summary:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 5s to update real time
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-purple-500 font-bold text-lg animate-pulse">Cargando Analytics Sénior...</p>
            </div>
        </div>
    );

    const trendData = data?.trend_data?.length > 0 ? data.trend_data : EMPTY_TREND;

    // Build vendor breakdown from recent invoices
    const vendorMap: Record<string, number> = {};
    (data?.recent_invoices || []).forEach((inv: any) => {
        vendorMap[inv.vendor_name] = (vendorMap[inv.vendor_name] || 0) + inv.total_amount;
    });
    const vendorData = Object.entries(vendorMap).map(([name, value]) => ({ name, value }));

    // Status breakdown
    const processed = (data?.recent_invoices || []).filter((i: any) => i.status === 'processed').length;
    const processing = (data?.recent_invoices || []).filter((i: any) => i.status !== 'processed').length;
    const statusData = [
        { name: 'Procesadas', value: processed || 0 },
        { name: 'En proceso', value: processing || 0 },
    ];

    const kpis = [
        { label: 'Gasto Total (Mes)', value: `${(data?.total_expenditure || 0).toLocaleString('es-ES')}€`, trend: data?.total_expenditure > 0 ? '+nuevo' : '0', color: 'border-purple-500/30 bg-purple-500/5', trendColor: 'bg-purple-500/10 text-purple-400' },
        { label: 'Facturas Procesadas', value: data?.invoice_count ?? 0, trend: data?.invoice_count > 0 ? `+${data.invoice_count}` : '0', color: 'border-blue-500/30 bg-blue-500/5', trendColor: 'bg-blue-500/10 text-blue-400' },
        { label: 'Gasto Medio', value: `${(data?.avg_invoice_value || 0).toLocaleString('es-ES', { maximumFractionDigits: 2 })}€`, trend: data?.avg_invoice_value > 0 ? 'activo' : '0', color: 'border-green-500/30 bg-green-500/5', trendColor: 'bg-green-500/10 text-green-400' },
        { label: 'Top Proveedor', value: data?.top_vendor || '—', trend: data?.top_vendor ? 'Líder' : '—', color: 'border-orange-500/30 bg-orange-500/5', trendColor: 'bg-orange-500/10 text-orange-400' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-black/70 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="font-bold text-xl text-white">D</span>
                        </div>
                        <span className="font-bold text-2xl tracking-tight">Data Analytics <span className="text-purple-500">Sénior</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-gray-300">Admin · Empresa Demo</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">{data?.plan}</span>
                        </div>
                        <FileUpload onUploaded={fetchData} />
                    </div>
                </div>
            </nav>

            <main className="max-w-screen-2xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Panel de Control</h1>
                        <p className="text-gray-500 text-sm mt-1">Todos los procesos de facturación en tiempo real</p>
                    </div>
                    <div className="flex gap-2">
                        {(['overview', 'invoices', 'vendors'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
                            >
                                {tab === 'overview' ? 'Resumen' : tab === 'invoices' ? 'Facturas' : 'Proveedores'}
                            </button>
                        ))}
                        <button
                            onClick={async () => {
                                await fetch('http://localhost:8000/erp/sync', { method: 'POST', headers: { 'X-Tenant-ID': TENANT_ID } });
                                fetchData();
                                alert('ERP sincronizado.');
                            }}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10 transition-all"
                        >
                            ⚡ Sincronizar ERP
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpis.map((kpi, i) => (
                        <div key={i} className={`border ${kpi.color} p-6 rounded-2xl`}>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">{kpi.label}</p>
                            <div className="flex items-end justify-between gap-2">
                                <h3 className="text-2xl font-black truncate">{kpi.value}</h3>
                                <span className={`text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded-full ${kpi.trendColor}`}>{kpi.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== POWER BI CHARTS GRID ===== */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                    {/* Area Chart — Gasto Mensual */}
                    <div className="xl:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base">Evolución del Gasto Mensual</h2>
                                <p className="text-gray-500 text-xs">Tendencia acumulada de facturación (€)</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">Area Chart</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF08" />
                                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" name="Gasto" stroke="#9333EA" strokeWidth={2} fill="url(#colorTotal)" dot={{ fill: '#9333EA', r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut — Estado de Facturas */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base">Estado de Facturas</h2>
                                <p className="text-gray-500 text-xs">Procesadas vs En proceso</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">Donut</span>
                        </div>
                        {statusData[0].value === 0 && statusData[1].value === 0 ? (
                            <div className="flex items-center justify-center h-[220px] flex-col gap-3">
                                <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                                    <span className="text-gray-600 text-4xl">0</span>
                                </div>
                                <p className="text-gray-600 text-xs">Sin facturas aún</p>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                                            {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {statusData.map((s, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                            {s.name}: <span className="font-bold text-white">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                    {/* Bar Chart — Gasto por Proveedor */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base">Gasto por Proveedor</h2>
                                <p className="text-gray-500 text-xs">Ranking de gasto acumulado (€)</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Bar Chart</span>
                        </div>
                        {vendorData.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <p className="text-gray-600 text-sm">Sube facturas para ver proveedores</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={vendorData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF08" />
                                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Gasto" radius={[6, 6, 0, 0]}>
                                        {vendorData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Line Chart — Facturas por día */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base">Volumen de Facturación</h2>
                                <p className="text-gray-500 text-xs">Número de facturas y total procesado</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">Line Chart</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF08" />
                                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '11px', color: '#9CA3AF' }} />
                                <Line type="monotone" dataKey="total" name="Total" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: '#F59E0B', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-base">Historial Completo de Facturas</h2>
                        <span className="text-xs text-gray-500">{data?.invoice_count ?? 0} facturas registradas</span>
                    </div>
                    {(!data?.recent_invoices || data?.recent_invoices.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">📄</div>
                            <p className="text-gray-500 font-bold">Sin facturas aún</p>
                            <p className="text-gray-600 text-sm">Sube una factura PDF o imagen para empezar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] text-gray-400 text-[11px] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Proveedor</th>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Importe</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">ERP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03] text-sm">
                                    {data.recent_invoices.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 font-medium group-hover:text-purple-400 transition-colors">{row.vendor_name}</td>
                                            <td className="px-6 py-4 text-gray-400">{row.invoice_date}</td>
                                            <td className="px-6 py-4 font-bold">{row.total_amount?.toLocaleString('es-ES')}€</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${row.status === 'processed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                    {row.status === 'processed' ? '✓ Procesado' : '⏳ Procesando'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.synced
                                                    ? <span className="text-[10px] text-blue-400 font-bold border border-blue-400/30 px-2 py-0.5 rounded">✓ Sync</span>
                                                    : <span className="text-[10px] text-gray-600 font-bold border border-white/5 px-2 py-0.5 rounded">Pendiente</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
