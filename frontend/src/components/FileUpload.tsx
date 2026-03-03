'use client';
import React, { useState } from 'react';

const TENANT_ID = 'ac93a157-9394-4b01-9a5e-c77619d3b19c'; // Empresa Demo ID from DB

export default function FileUpload() {
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus('Subiendo...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/invoices/upload', {
                method: 'POST',
                headers: {
                    'X-Tenant-ID': TENANT_ID,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(`Factura en proceso (ID: ${data.id.slice(0, 8)}...)`);
                // In a real app, we would refresh the list
            } else {
                setStatus('Error al subir la factura.');
            }
        } catch (error) {
            console.error('Error uploading:', error);
            setStatus('Error de conexión con el backend.');
        } finally {
            setUploading(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="relative group">
            <input
                type="file"
                id="invoice-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                disabled={uploading}
            />
            <label
                htmlFor="invoice-upload"
                className={`inline-flex items-center gap-2 bg-purple-600 px-5 py-2.5 rounded-xl font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{uploading ? 'Subiendo...' : 'Subir Factura'}</span>
            </label>

            {status && (
                <div className="absolute top-full mt-4 right-0 min-w-[250px] bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        <p className="text-xs font-medium text-white">{status}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
