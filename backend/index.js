const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './data/');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create data directory if not exists
const fs = require('fs');
if (!fs.existsSync('./data/')) {
    fs.mkdirSync('./data/');
}

// Mock In-Memory Database — starts empty (zero)
let invoices = [];


let tenants = {
    'ac93a157-9394-4b01-9a5e-c77619d3b19c': { name: 'Empresa Demo', plan: 'Pro' }
};

// --- Routes ---

app.get('/', (req, res) => {
    res.json({ message: "Welcome to Data Analytics Sénior API (Node.js)", status: "online" });
});

// Mock ERP Connector
const erpConnector = {
    syncInvoice: async (invoice) => {
        console.log(`[ERP] Syncing invoice ${invoice.id} to SAP/Sage...`);
        return true;
    }
};

app.post('/invoices/upload', upload.single('file'), (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const tenant = tenants[tenant_id];

    if (!tenant_id || !tenant) {
        return res.status(400).json({ error: "Invalid or missing X-Tenant-ID" });
    }

    // Pricing Plan check (B2B logic)
    const activeInvoices = invoices.filter(i => i.tenant_id === tenant_id).length;
    if (tenant.plan === 'Basic' && activeInvoices >= 50) {
        return res.status(403).json({ error: "Límite del plan básico alcanzado. Sube a PRO para procesar más facturas." });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const newInvoice = {
        id: uuidv4(),
        tenant_id: tenant_id,
        vendor_name: "Detectando...",
        invoice_date: new Date().toISOString().split('T')[0],
        total_amount: Math.floor(Math.random() * 500) + 50, // Simulated AI extraction
        currency: "EUR",
        status: "processing",
        synced: false,
        file_path: req.file.path
    };

    invoices.unshift(newInvoice);

    // Simulate AI extraction finishing after 3 seconds
    setTimeout(() => {
        const idx = invoices.findIndex(i => i.id === newInvoice.id);
        if (idx !== -1) {
            invoices[idx].vendor_name = "Proveedor IA Detectado";
            invoices[idx].status = "processed";
        }
    }, 3000);

    res.json(newInvoice);
});

app.get('/analytics/summary', (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const tenant_invoices = invoices.filter(i => i.tenant_id === tenant_id);

    const total = tenant_invoices.reduce((sum, i) => sum + i.total_amount, 0);
    const avg = tenant_invoices.length > 0 ? total / tenant_invoices.length : 0;

    // Group by vendor for Top Vendor calculation
    const vendors = {};
    tenant_invoices.forEach(i => {
        vendors[i.vendor_name] = (vendors[i.vendor_name] || 0) + i.total_amount;
    });
    const topVendor = Object.entries(vendors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ninguno';

    res.json({
        total_expenditure: total,
        invoice_count: tenant_invoices.length,
        avg_invoice_value: avg,
        top_vendor: topVendor,
        plan: tenants[tenant_id]?.plan || 'Basic',
        trend_data: [
            { month: "Jan", total: 4000 },
            { month: "Feb", total: 3500 },
            { month: "Mar", total: total }
        ],
        recent_invoices: tenant_invoices.slice(0, 10)
    });
});

app.post('/erp/sync', async (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const unsynced = invoices.filter(i => i.tenant_id === tenant_id && !i.synced && i.status === 'processed');

    for (const inv of unsynced) {
        await erpConnector.syncInvoice(inv);
        inv.synced = true;
    }

    res.json({ success: true, message: `${unsynced.length} facturas sincronizadas con el ERP.` });
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
