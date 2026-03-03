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

// --- Routes ---

app.get('/', (req, res) => {
    res.json({ message: "Welcome to Data Analytics Sénior API (Node.js)", status: "online" });
});

// Mock Extraction Service
const extractionService = {
    extractFromText: async (text) => {
        // Mock result
        return {
            fecha: "2026-03-01",
            vendor_name: "Google Cloud",
            concept: "Servicios de Infraestructura",
            total_amount: 145.20,
            currency: "EUR",
            invoice_number: "INV-2026-001",
            status: "processed"
        };
    }
};

app.post('/invoices/upload', upload.single('file'), (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];

    if (!tenant_id) {
        return res.status(400).json({ error: "X-Tenant-ID header is required" });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // In production, we'd start an async processing job here
    const new_id = uuidv4();

    res.json({
        id: new_id,
        tenant_id: tenant_id,
        status: "processing",
        message: "Invoice upload successful. Processing started.",
        vendor_name: "Procesando AI..."
    });
});

app.get('/analytics/summary', (req, res) => {
    const tenant_id = req.headers['x-tenant-id'];

    // SQL: SELECT SUM(total_amount), COUNT(*) FROM invoices WHERE tenant_id = :tenant_id
    res.json({
        total_expenditure: 12500.50,
        invoice_count: 45,
        avg_invoice_value: 277.78,
        top_vendor: "Amazon Web Services",
        trend_data: [
            { month: "Jan", total: 4000 },
            { month: "Feb", total: 3500 },
            { month: "Mar", total: 5000 }
        ]
    });
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
