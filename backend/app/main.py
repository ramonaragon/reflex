from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from pydantic import BaseModel
from datetime import date
import uuid
from .extraction_service import extraction_service

app = FastAPI(title="Data Analytics Sénior API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class InvoiceBase(BaseModel):
    vendor_name: Optional[str] = None
    invoice_date: Optional[date] = None
    total_amount: Optional[float] = None
    currency: str = "EUR"
    invoice_number: Optional[str] = None
    concept: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: uuid.UUID
    status: str
    tenant_id: uuid.UUID

# --- Database / Extraction Mock ---

@app.get("/")
async def root():
    return {"message": "Welcome to Data Analytics Sénior API", "status": "online"}

@app.post("/invoices/upload", response_model=InvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    x_tenant_id: uuid.UUID = Header(...)
):
    """
    Simulates invoice upload and triggers background extraction.
    In production, this would upload to S3/Storage and queue a background task.
    """
    # 1. Validation (Tenant check)
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
    
    # 2. Mock persistence & extraction
    new_id = uuid.uuid4()
    
    # Simulation of LLM Extraction (The "Maestro Prompt" logic would go here)
    # prompt = "Extrae fecha, proveedor, importe..."
    
    return {
        "id": new_id,
        "tenant_id": x_tenant_id,
        "status": "processing",
        "vendor_name": "Procesando...",
        "currency": "EUR"
    }

@app.get("/analytics/summary")
async def get_summary(x_tenant_id: uuid.UUID = Header(...)):
    """
    Returns aggregated metrics for the dashboard.
    """
    # SQL: SELECT SUM(total_amount), COUNT(*) FROM invoices WHERE tenant_id = :x_tenant_id
    return {
        "total_expenditure": 12500.50,
        "invoice_count": 45,
        "avg_invoice_value": 277.78,
        "top_vendor": "Amazon Web Services",
        "trend_data": [
            {"month": "Jan", "total": 4000},
            {"month": "Feb", "total": 3500},
            {"month": "Mar", "total": 5000}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
