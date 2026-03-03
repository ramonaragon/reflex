const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync('./data/')) fs.mkdirSync('./data/');

// ─────────────────────────────────────────────
// Persistent storage using a JSON file
// ─────────────────────────────────────────────
const DB_FILE = './data/invoices.json';

const loadInvoices = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) { console.error('DB load error:', e); }
    return [];
};

const saveInvoices = (invoices) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(invoices, null, 2));
    } catch (e) { console.error('DB save error:', e); }
};

let invoices = loadInvoices();

const tenants = {
    'ac93a157-9394-4b01-9a5e-c77619d3b19c': { name: 'Empresa Demo', plan: 'Pro' }
};

// ─────────────────────────────────────────────
// Multer — file storage
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './data/'),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.get('/', (req, res) => {
    res.json({ message: "Data Analytics Sénior API", status: "online", invoices: invoices.length });
});

// Upload invoice
app.post('/invoices/upload', upload.single('file'), (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const tenant = tenants[tenant_id];

    if (!tenant_id || !tenant) {
        return res.status(400).json({ error: "Tenant ID inválido o ausente." });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const now = new Date();
    const newInvoice = {
        id: uuidv4(),
        tenant_id,
        vendor_name: "Analizando con IA...",
        invoice_date: now.toISOString().split('T')[0],
        total_amount: Math.round((Math.random() * 900 + 50) * 100) / 100,
        currency: "EUR",
        status: "processing",
        synced: false,
        file_name: req.file.originalname,
        uploaded_at: now.toISOString()
    };

    invoices.unshift(newInvoice);
    saveInvoices(invoices);

    console.log(`[UPLOAD] New invoice ${newInvoice.id} from tenant ${tenant_id}`);

    // Simulate AI extraction after 4 seconds
    setTimeout(() => {
        const idx = invoices.findIndex(i => i.id === newInvoice.id);
        if (idx !== -1) {
            const vendors = ['Google Cloud', 'Amazon AWS', 'Microsoft Azure', 'Stripe', 'Salesforce', 'HubSpot', 'Notion', 'Figma'];
            invoices[idx].vendor_name = vendors[Math.floor(Math.random() * vendors.length)];
            invoices[idx].status = "processed";
            saveInvoices(invoices);
            console.log(`[AI] Invoice ${newInvoice.id} processed — ${invoices[idx].vendor_name}`);
        }
    }, 4000);

    res.json(newInvoice);
});

// Analytics summary
app.get('/analytics/summary', (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const tenant_invoices = invoices.filter(i => i.tenant_id === tenant_id);

    const total = tenant_invoices.reduce((sum, i) => sum + i.total_amount, 0);
    const avg = tenant_invoices.length > 0 ? total / tenant_invoices.length : 0;

    // Top vendor
    const vendorMap = {};
    tenant_invoices.forEach(i => {
        if (i.status === 'processed') {
            vendorMap[i.vendor_name] = (vendorMap[i.vendor_name] || 0) + i.total_amount;
        }
    });
    const topVendor = Object.entries(vendorMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Dynamic monthly trend
    const monthMap = {};
    const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    tenant_invoices.forEach(i => {
        const d = new Date(i.uploaded_at || i.invoice_date);
        const key = MONTHS[d.getMonth()];
        monthMap[key] = (monthMap[key] || 0) + i.total_amount;
    });
    const trend_data = MONTHS.map(m => ({ month: m, total: Math.round((monthMap[m] || 0) * 100) / 100 }));

    res.json({
        total_expenditure: Math.round(total * 100) / 100,
        invoice_count: tenant_invoices.length,
        avg_invoice_value: Math.round(avg * 100) / 100,
        top_vendor: topVendor,
        plan: tenants[tenant_id]?.plan || 'Basic',
        trend_data,
        recent_invoices: tenant_invoices.slice(0, 50)
    });
});

// Get all invoices (debug)
app.get('/invoices', (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    res.json(invoices.filter(i => i.tenant_id === tenant_id));
});

// ERP sync
app.post('/erp/sync', async (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];
    const unsynced = invoices.filter(i => i.tenant_id === tenant_id && !i.synced && i.status === 'processed');
    unsynced.forEach(inv => { inv.synced = true; });
    saveInvoices(invoices);
    console.log(`[ERP] Synced ${unsynced.length} invoices for tenant ${tenant_id}`);
    res.json({ success: true, synced: unsynced.length });
});

// Reset invoices (admin utility)
app.delete('/invoices/reset', (req, res) => {
    invoices = [];
    saveInvoices(invoices);
    res.json({ success: true, message: 'All invoices deleted.' });
});

app.listen(port, () => {
    console.log(`\n🚀 Backend online → http://localhost:${port}`);
    console.log(`📦 Loaded ${invoices.length} invoices from disk.\n`);
});
